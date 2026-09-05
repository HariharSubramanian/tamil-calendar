// ===========================================================================
// functions/index.js
//
// Daily reminder digest.
//
// Runs each morning, finds every user who has opted into email, checks which
// of their reminders fall today, and writes ONE message per user into the
// `mail` collection. The Trigger Email extension watches that collection and
// does the actual sending via Brevo SMTP — nothing here talks to SMTP.
//
// "Today" is resolved in Asia/Kolkata, not UTC. At 06:00 IST the UTC date is
// still the previous day, so using UTC would look up the wrong dates.
//
// Reminders carry an `occurrences` array of ISO dates written by the browser
// (see src/utils/buildOccurrences.js). The server never computes Tamil dates.
// ===========================================================================

const { onSchedule } = require("firebase-functions/v2/scheduler");
const { onRequest } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

setGlobalOptions({ maxInstances: 10, region: "asia-south1" });

const TIMEZONE = "Asia/Kolkata";

// Today's date as YYYY-MM-DD in the given zone. The en-CA locale formats
// exactly as YYYY-MM-DD, matching the strings stored in `occurrences`.
function todayIso(timeZone = TIMEZONE) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
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

// The actual work, shared by the scheduled and manual entry points.
async function sendDigests() {
  const isoDate = todayIso();
  logger.info("Digest run starting", { isoDate });

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

    // Idempotency: if a digest already went out today for this user, don't
    // send another. Scheduled functions can retry, and a duplicate email is
    // the most visible possible failure.
    if (profile.lastNotifiedDate === isoDate) {
      skipped++;
      continue;
    }

    const reminders = await userDoc.ref
      .collection("reminders")
      .where("occurrences", "array-contains", isoDate)
      .get();

    if (reminders.empty) continue;

    const { subject, text, html } = buildMessage(
      profile.displayName,
      reminders.docs.map((d) => d.data()),
      isoDate,
    );

    // The Trigger Email extension sends whatever lands here.
    await db.collection("mail").add({
      to: [profile.email],
      message: { subject, text, html },
    });

    // Mark only after the write succeeds, so a failure retries next run.
    await userDoc.ref.update({ lastNotifiedDate: isoDate });
    sent++;
  }

  logger.info("Digest run finished", {
    isoDate,
    users: users.size,
    sent,
    skipped,
  });
  return { isoDate, users: users.size, sent, skipped };
}

// 6:00 AM IST daily.
exports.dailyDigest = onSchedule(
  { schedule: "0 6 * * *", timeZone: TIMEZONE, region: "asia-south1" },
  async () => {
    await sendDigests();
  },
);

// TEMPORARY: manual trigger so the digest can be tested without waiting for
// 6 AM. Remove or protect before this app is public — anyone with the URL can
// invoke it. The lastNotifiedDate guard means repeat calls in one day are
// no-ops, which limits the damage.
exports.runDigestNow = onRequest({ region: "asia-south1" }, async (req, res) => {
  const result = await sendDigests();
  res.json(result);
});