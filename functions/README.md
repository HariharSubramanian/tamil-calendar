# Cloud Functions — daily reminder digest

One scheduled function, `dailyDigest`, in [`index.js`](index.js). It emails each
opted-in user a single summary of the reminders that fall on the current day.

- **Runtime:** Node 20 (`package.json` → `engines.node`), `firebase-functions` v2
- **Region:** `asia-south1`
- **Schedule:** `0 6 * * *` in `Asia/Kolkata` — 06:00 IST daily
- **Trigger type:** `onSchedule` (2nd gen) — a Cloud Scheduler job invokes the
  function over HTTP (`https://asia-south1-<project>.cloudfunctions.net/dailyDigest`)

---

## How a run works

`sendDigests()`:

1. **Resolve "today"** as `YYYY-MM-DD` in `Asia/Kolkata`, using
   `Intl.DateTimeFormat("en-CA", …)` (that locale formats exactly as
   `YYYY-MM-DD`, matching the strings stored in `occurrences`).
   *Why not UTC:* at 06:00 IST the UTC date is still the previous day, so a UTC
   lookup would match the wrong reminders.
2. **Query users** where `notifyByEmail == true`.
3. **For each user**, in a plain loop:
   - skip if the profile has no `email`;
   - skip if `lastNotifiedDate` already equals today (idempotency — see below);
   - query that user's `reminders` subcollection for
     `occurrences array-contains <today>`;
   - skip if none match;
   - build one plain-text + HTML message and `add()` it to the top-level
     `mail` collection;
   - **only then** `update({ lastNotifiedDate: today })`.

One email per user, however many reminders they have that day. The subject is the
single label if there's one reminder, otherwise a count.

### Why a per-user loop instead of a collection-group query

A single `collectionGroup("reminders").where("occurrences", "array-contains", …)`
would need a composite/collection-group index defined in
`firestore.indexes.json`. Looping per user keeps every query a simple
single-field one, so **`firestore.indexes.json` stays empty** and there is no
index to deploy or keep in sync. User counts are small; this is not a
performance concern at current scale.

### The `lastNotifiedDate` guard

Scheduled functions can retry, and a duplicate email is the most visible possible
failure. `lastNotifiedDate` is written **after** the `mail` document is created,
so a failure between the two retries cleanly on the next run rather than being
silently marked done. It is stored per user on `users/{uid}`.

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

### Known gap: per-user timezone

`users/{uid}.timezone` is collected by the client but **not used here** — every
run resolves "today" in `Asia/Kolkata`. Honouring each user's stored zone (and
scheduling per-zone, or running hourly and filtering) is future work.

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
