# Cloud Functions — daily reminder digest

One scheduled function, `dailyDigest`, in [`index.js`](index.js). It emails each
opted-in user a single summary of the reminders that fall on the current day.

- **Runtime:** Node 20 (`package.json` → `engines.node`), `firebase-functions` v2
- **Region:** `asia-south1`
- **Schedule:** `0 * * * *` — top of every hour. Each user is mailed on the
  first run at or after 06:00 **in their own stored timezone**; see below.
- **Trigger type:** `onSchedule` (2nd gen) — a Cloud Scheduler job invokes the
  function over HTTP (`https://asia-south1-<project>.cloudfunctions.net/dailyDigest`)

---

## How a run works

The function runs every hour. `sendDigests()`:

1. **Query users** where `notifyByEmail == true`.
2. **For each user**, in a plain loop:
   - skip if the profile has no `email`;
   - **resolve "today" and the current hour in that user's `timezone`**
     (`users/{uid}.timezone`), using `Intl.DateTimeFormat` with `en-CA` for the
     date and `en-GB` + `hourCycle: "h23"` for the hour. A missing or
     unparseable zone falls back to `Asia/Kolkata`;
   - **skip if it is not yet 06:00** where that user is — a later hourly run
     picks them up;
   - query that user's `reminders` subcollection for
     `occurrences array-contains <their-today>`;
   - skip if none match;
   - work out which of today's reminder IDs have **not** already been mailed
     today (the `lastNotified` guard, below);
   - skip if none are new;
   - build one plain-text + HTML message from the new reminders only and
     `add()` it to the top-level `mail` collection;
   - **only then** `update({ lastNotified: { date, sentIds } })`.

At most one email per user per hour, covering whatever is new since the last
send that day. In the common case that is a single morning digest. The subject
is the single label if there's one reminder in that email, otherwise a count.

### Why a per-user loop instead of a collection-group query

A single `collectionGroup("reminders").where("occurrences", "array-contains", …)`
would need a composite/collection-group index defined in
`firestore.indexes.json`. Looping per user keeps every query a simple
single-field one, so **`firestore.indexes.json` stays empty** and there is no
index to deploy or keep in sync. User counts are small; this is not a
performance concern at current scale.

Since v1.4.1 the function runs hourly rather than once a day, and past 06:00
local it runs the `reminders` query for every opted-in user each hour (the old
code stopped at the `lastNotifiedDate` check before querying). That is roughly
`users × waking-hours` small single-field reads per day — negligible for a
handful of users, but if the user base grows this is the first thing to guard
(e.g. skip the query when `lastNotified.date` is today and nothing on the
profile signals a new reminder).

### The `lastNotified` guard

Scheduled functions can retry, the function now runs 24×/day, and a duplicate
email is the most visible possible failure. Each user's `users/{uid}` document
carries:

```
lastNotified: { date: "2026-09-07", sentIds: ["<reminderId>", …] }
```

`date` is the user's local ISO day; `sentIds` are the reminder IDs already
mailed that day. A run mails only today's reminders whose IDs are **not** in
`sentIds`, then writes back the union. This is what lets a reminder added at
14:00 still go out that afternoon without re-sending the ones from the morning.

The write happens **after** the `mail` document is created, so a failure between
the two retries cleanly on the next hourly run rather than being silently marked
done.

**Legacy shape.** Before v1.4.1 this was a bare string `lastNotifiedDate` under
an all-or-nothing scheme. The function still reads it: if it equals the user's
today, every reminder due today is treated as already sent. The first successful
send after v1.4.1 replaces it with the map above and deletes the string
(`FieldValue.delete()`).

### Handoff to email delivery

Nothing here talks to SMTP. The function only writes
`{ to: [email], message: { subject, text, html } }` to `mail/{id}`. The Firebase
**Trigger Email** extension watches that collection and sends via Brevo SMTP.
Sender-domain and deliverability work is tracked in [`../ROADMAP.md`](../ROADMAP.md).

### Tamil dates are never computed here

Occurrence dates are computed in the browser (`src/utils/buildOccurrences.js` →
`reminderDates.js` → `starDate.js`, using `@ishubhamx/panchangam-js`) and
persisted on each reminder. The function only does string matching on the
`occurrences` array, which keeps it free of Panchangam logic.

### Per-user timezone (resolved in v1.4.1)

`users/{uid}.timezone` — collected by the client since v1.4 Phase 1 — is now
read on every run: the function runs hourly and only mails a user once their own
local clock has passed 06:00. Users with a missing or unparseable zone fall back
to `Asia/Kolkata`.

Because the schedule is a plain `0 * * * *`, delivery can land up to roughly an
hour late, and a little more for zones on a sub-hour offset (India itself is
UTC+5:30). Acceptable for a daily digest; a per-zone schedule would tighten it
but needs one Cloud Scheduler job per zone.

---

## Deployment model

**GitHub Actions never deploys functions.** The workflow in
`.github/workflows/deploy.yml` deploys Firebase Hosting only and does not look at
`functions/`.

Functions are deployed **manually**:

```bash
cd functions
npm run deploy          # firebase deploy --only functions
```

`firebase deploy` reads the `functions/` folder **on disk**, not git. Uncommitted
or since-deleted code can be live and stay live, and the deployed set only
changes when someone runs the command.

### Orphaned functions (no source in this repo)

- **`runDigestNow`** — a temporary HTTP trigger used to test the digest on
  demand. Added and removed within a single feature branch, so the squash-merge
  left no trace in `main`'s history. It was public and unauthenticated while it
  existed. **Deleted 6 September 2026.**
- **`dailyReminderEmails`** — a scheduled function deployed 7 July 2026 from an
  uncommitted working tree. It sat dormant because it queried fields that did not
  exist until v1.4 Phase 1; once those fields shipped it began running in the
  same 06:00 slot as `dailyDigest`, queuing a second email per reminder.
  **Paused 6 September 2026, deletion pending** confirmation of a clean single
  send. Its source is kept outside the repo.

### Planned fix

A CI job that runs `firebase deploy --only functions` from `main` would make the
repo the source of truth. `--force` (which prunes deployed functions with no
local source) should only be used once every live function has source committed
here — until then it would delete things without prompting.

---

## Maintenance

### Node 20 → 22 (hard deadline)

`engines.node` is pinned to `"20"`. **Node 20 for Cloud Functions is decommissioned
on 30 October 2026**, after which functions deploys fail. Bump it to `"22"` and
redeploy. The value must be an exact major version string — a range such as
`">=20"` is rejected.

### Local development

```bash
npm run serve     # firebase emulators:start --only functions
npm run shell      # firebase functions:shell
npm run logs       # firebase functions:log
```
