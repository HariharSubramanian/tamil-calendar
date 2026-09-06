// ===========================================================================
// functions/index.js
//
// Daily reminder digest.
//
// Wakes at the top of every hour. For each user who has opted into email,
// once their OWN local clock has passed 06:00, it writes ONE message into the
// `mail` collection listing the reminders that fall on their local "today"
// and have not already been mailed today. The Firebase Trigger Email
// extension watches `mail` and sends via Brevo SMTP — nothing here talks to
// SMTP.
//
// Why hourly, not a single 06:00 run:
//   - "today" and "06:00" are resolved in each user's stored timezone
//     (users/{uid}.timezone, written by src/firebase/userProfile.js), so one
//     fixed-time run cannot serve every zone;
//   - a reminder added during the day still goes out that day — a send
//     records which reminder IDs it covered, and a later run the same day
//     mails only what is new.
//
// Reminders carry an `occurrences` array of ISO dates written by the browser
// (see src/utils/buildOccurrences.js). The server never computes Tamil dates.
// ===========================================================================

const { onSchedule } = require("firebase-functions/v2/scheduler");
const { setGlobalOptions } = require("firebase-functions");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();
const FieldValue = admin.firestore.FieldValue;

setGlobalOptions({ maxInstances: 10, region: "asia-south1" });

// Fallback zone for a profile whose `timezone` is missing or unparseable.
const TIMEZONE = "Asia/Kolkata";

// A user's digest goes out on the first hourly run at or after this local hour.
const SEND_HOUR = 6;

// Today's date as YYYY-MM-DD in the given zone. en-CA formats exactly as
// YYYY-MM-DD, matching the strings stored in `occurrences`. Throws RangeError
// on an unknown time zone.
function todayIso(timeZone = TIMEZONE) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

// Current hour 0-23 in the given zone. Throws RangeError on an unknown zone.
// `% 24` guards the ICU quirk where midnight can format as "24" under h23.
function hourInZone(timeZone = TIMEZONE) {
  return (
    Number(
      new Intl.DateTimeFormat("en-GB", {
        timeZone,
        hour: "2-digit",
        hourCycle: "h23",
      }).format(new Date()),
    ) % 24
  );
}

// Plain-text and HTML bodies for one user's digest.
function buildMessage(displayName, reminders, isoDate) {
  const niceDate = new Date(isoDate).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  const lines = reminders.map((r) => {
    const label = r.label || "Reminder";
    const detail =
      r.type === "tamil"
        ? `${r.tamilMonth} · ${r.tamilStar}`
        : r.occasion === "anniversary"
          ? "Anniversary"
          : "Birthday";
    const note = r.alertMessage ? ` — ${r.alertMessage}` : "";
    return { label, detail, note };
  });

  const text =
    `Today, ${niceDate}:\n\n` +
    lines.map((l) => `• ${l.label} (${l.detail})${l.note}`).join("\n") +
    `\n\n— Ninaivootal`;

  const html =
    `<p>Today, ${niceDate}:</p><ul>` +
    lines
      .map(
        (l) =>
          `<li><strong>${l.label}</strong> <span style="color:#666">(${l.detail})</span>${l.note}</li>`,
      )
      .join("") +
    `</ul><p style="color:#999;font-size:12px">— Ninaivootal</p>`;

  const subject =
    reminders.length === 1
      ? `Today: ${lines[0].label}`
      : `Today: ${reminders.length} reminders`;

  return { subject, text, html };
}

// The actual work of one hourly run.
async function sendDigests() {
  logger.info("Digest run starting", { at: new Date().toISOString() });

  const users = await db
    .collection("users")
    .where("notifyByEmail", "==", true)
    .get();

  let sent = 0;
  let skipped = 0;

  for (const userDoc of users.docs) {
    const profile = userDoc.data();
    if (!profile.email) {
      logger.warn("User has no email, skipping", { uid: userDoc.id });
      continue;
    }

    // Resolve "today" and the local hour in the user's own zone; fall back to
    // Asia/Kolkata if the stored zone is missing or rejected by Intl.
    let isoDate;
    let localHour;
    try {
      isoDate = todayIso(profile.timezone);
      localHour = hourInZone(profile.timezone);
    } catch {
      isoDate = todayIso();
      localHour = hourInZone();
    }

    // Too early where this user is — a later hourly run will catch them. A
    // non-integer hour (an ICU regression, never seen in practice) fails
    // closed: skip rather than risk mailing at the wrong time of day.
    if (!Number.isInteger(localHour) || localHour < SEND_HOUR) {
      skipped++;
      continue;
    }

    const reminders = await userDoc.ref
      .collection("reminders")
      .where("occurrences", "array-contains", isoDate)
      .get();
    if (reminders.empty) continue;

    // Reminder IDs already mailed to this user today. Current shape is
    // `lastNotified: { date, sentIds }`. The pre-v1.4.1 shape was a bare
    // `lastNotifiedDate` string with no per-reminder detail — if it is today,
    // treat every reminder due today as already sent.
    const ln = profile.lastNotified;
    let sentIds = [];
    if (ln && ln.date === isoDate && Array.isArray(ln.sentIds)) {
      sentIds = ln.sentIds;
    } else if (!ln && profile.lastNotifiedDate === isoDate) {
      sentIds = reminders.docs.map((d) => d.id);
    }

    const fresh = reminders.docs.filter((d) => !sentIds.includes(d.id));
    if (fresh.length === 0) {
      skipped++;
      continue;
    }

    const { subject, text, html } = buildMessage(
      profile.displayName,
      fresh.map((d) => d.data()),
      isoDate,
    );

    // The Trigger Email extension sends whatever lands here.
    await db.collection("mail").add({
      to: [profile.email],
      message: { subject, text, html },
    });

    // Record the union of prior + just-sent IDs, and drop the legacy string.
    // Written only after the mail write succeeds, so a failure retries next run.
    await userDoc.ref.update({
      lastNotified: {
        date: isoDate,
        sentIds: sentIds.concat(fresh.map((d) => d.id)),
      },
      lastNotifiedDate: FieldValue.delete(),
    });
    sent++;
  }

  logger.info("Digest run finished", { users: users.size, sent, skipped });
  return { users: users.size, sent, skipped };
}

// Top of every hour; per-user gating on SEND_HOUR happens inside sendDigests.
exports.dailyDigest = onSchedule(
  { schedule: "0 * * * *", timeZone: TIMEZONE, region: "asia-south1" },
  async () => {
    await sendDigests();
  },
);
