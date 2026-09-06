# Ninaivootal — Roadmap

நினைவூட்டல்கள் — a Tamil calendar and reminders PWA.

Last updated: 6 September 2026

---

## Release history

| Version | What shipped |
|---|---|
| v1.0.0 | Initial release. Gregorian + Tamil Panchangam calendar, reminders (date-of-birth and Tamil star), Firebase Auth and Firestore. |
| v1.1.0 | Edit and delete reminders. Dedicated reminders list, sorted by next occurrence and split into "upcoming this year" / "earlier this year" with day countdowns. "Today" button and click-a-reminder-to-navigate on the calendar. Hardcoded festival calendar (`festivals.js`) removed. |
| v1.2.0 | Visual redesign. Blue/navy palette derived from the logo icon (sky blue `#3B82C4` primary, deep navy `#1A3A5C` for strong/selected states), replacing the earlier maroon and teal. Loading screens added. |
| v1.3.0 | Rename to Ninaivootal. PWA manifest corrections, favicon MIME type fix, temporary in-app rename notice. |
| v1.4.0 | **Daily email digest.** Scheduled Cloud Function at 06:00 IST sends one email per user listing the reminders falling that day. Delivered via the Firebase Trigger Email extension over Brevo SMTP. |

v1.4.0 was released 5 September 2026 and verified end to end on 6 September: the scheduled run fired unattended, wrote to the `mail` collection, and the email arrived.

---

## Immediate items

Small, mostly non-feature work that should clear before the next release.

**Delete `dailyReminderEmails`** — an orphaned scheduled function from July with no source in the repo. Once v1.4 Phase 1 added the fields it queries, it began running in the same 06:00 slot as `dailyDigest`, queuing a second email per reminder. Paused 6 September 2026; deletion pending confirmation of a single clean send. Its source is preserved outside the repo.

**Node 20 → 22** — `functions/package.json` pins `engines` to `"20"`. Node 20 is decommissioned **30 October 2026**, after which functions deploys fail. A one-word change plus a redeploy. Hard deadline.

**CI deploy for Cloud Functions — the next major step.** GitHub Actions currently deploys Hosting only. Functions are deployed by hand, and `firebase deploy` reads the `functions/` folder on disk rather than the repo, which is how two orphaned functions came to exist (`runDigestNow`, a temporary HTTP trigger, deleted 6 September 2026; `dailyReminderEmails`, above). The goal is that **no part of the app requires a manual deploy** — merging to `main` ships both Hosting and Functions.

Setup (all one-time):

- A Google Cloud service account with Cloud Functions Admin, Cloud Build Editor, Artifact Registry Administrator, and Service Account User; its JSON key added as a GitHub secret. This is a stronger credential than the existing Hosting one (`firebase-adminsdk-fbsvc`), in a public repo — worth being deliberate about.
- A second job in `deploy.yml` with a `paths: functions/**` filter, kept separate from the Hosting job so one failing does not block the other.
- Decide on `--force` (prunes deployed functions with no local source) — safe only once every live function has source in the repo, which is true after `dailyReminderEmails` is deleted.

Sequencing: do this **after** the Node 20 → 22 bump and the v1.4.1 digest change have both shipped manually, so the first automated run happens against a codebase already known to deploy cleanly. See `functions/README.md`.

**User profile backfill** — only 2 of 7 users have `notifyByEmail` set. The rest need to open the app once for their profile document to be written.

**Test data cleanup** — leftover test reminders ("Digest test", "Dummy Test", "sample test") in the reminders subcollections. A dead v1.0-era `birthdays` subcollection also remains in Firestore.

---

## v1.4.1 — timezone fix, email polish, per-reminder opt-out

Closes gaps in what v1.4.0 shipped.

**Per-user timezone and same-day reminders.** *(done — `functions/index.js`, pending deploy)* The digest ran at a fixed 06:00 IST and ignored the `timezone` already stored on each profile, and a reminder added after the morning send waited until the next day. The scheduled function now runs hourly, resolves "today" and "06:00" in each user's own zone (IST fallback), and records which reminder IDs it has mailed each day so a later run sends only what is new. See `functions/README.md`.

**Per-reminder email opt-in/opt-out.** The account-level `notifyByEmail` flag stays as the outer gate; a per-reminder flag filters within the digest. Four pieces:

- A boolean on each reminder document. Absent must mean *included* (`!== false`, not `=== true`) so existing reminders need no migration.
- A toggle in `AddReminder.jsx` on create and edit, plus a quick action on the reminders list.
- One filter in `sendDigests()`, applied where today's reminders are read. Silenced reminders are simply left out of the candidate set; with the v1.4.1 `lastNotified.sentIds` model there is no separate "skip without stamping" case to get wrong, because IDs are only recorded once actually mailed.
- Settings shows which reminders are currently silenced.

**Email polish.** Add a greeting and a link back to the app. Suppress the auto-generated `alertMessage` when it merely repeats the label.

> Ordering note: per-reminder opt-out was originally slated for v1.5. It's small enough to fold into a point release, which frees v1.5 for push notifications — the feature originally named as the headline for "the next version." Change this if you'd rather keep the original numbering.

---

## v1.5 — push notifications

The original headline goal: make this a real reminder app rather than an email one. Chosen deliberately over festivals, polish and refactoring. Email was built first as the easier path with universal reach, avoiding the iOS requirement that a PWA be installed before it can receive push.

Four pieces were needed. Two are now done:

- ~~A scheduled Cloud Function~~ — exists as `dailyDigest`.
- ~~Reminder-due logic~~ — solved by the `occurrences` array.
- **FCM delivery** — still to build.
- **Notification permission and per-device tokens** stored in Firestore — still to build.

**A service worker does not exist and is required.** This is the main structural gap. Note that `getMessaging` is currently initialised but unused, and its top-level `await isSupported()` blocks module execution on an IndexedDB probe at startup — that dead code should be removed or properly wired, not left as-is.

---

## v2.0 — dynamic festival calendar

The largest known deferred feature. `festivals.js` was deleted in an earlier release with an explicit plan to rebuild it properly rather than maintain a hardcoded list.

Two approaches, not yet chosen:

- **A holiday API** (Calendarific, Abstract) — broad coverage, quick to integrate, but shallow on Tamil-specific observances.
- **Computed via `panchangam-js`** — better Tamil accuracy and no external dependency, but substantially more work.

Early tester feedback tied to this: festival names shown bilingually (Tamil + English together), and festival data held in Firestore rather than hardcoded. Both were made moot by the deletion and fold back in here.

---

## Outstanding tester feedback

Gathered around the v1.0 launch. The v1.2 recolor addressed the contrast and look-and-feel asks. These two were never shipped and appear to have been dropped rather than decided against:

- **Square date cells** on the calendar grid, instead of dots.
- **Read-aloud (text-to-speech)** — a real accessibility request worth revisiting.

Design caution recorded at the time: any recolor must keep functional elements visually distinct — a reminder marker versus a selected day — rather than blending everything into one blue family.

---

## Technical debt

From the HAR performance analysis of 5 September 2026. The app is healthy; perceived slowness on one machine was the laptop plus DevTools, not the code. These are real findings regardless:

**Cache headers, partly fixed.** `assets/**` now serves `public, max-age=31536000, immutable` (PR #4). But the companion `/index.html` no-cache rule **does not match**, because the rewrite serves `index.html` at `/calendar`, `/settings` and so on. HTML is still on `max-age=3600`, so a new deploy can take up to an hour to reach users.

**No code splitting.** A single 829 KB bundle (224 KB brotli). Every route waits for the whole thing, including `panchangam-js`.

**Blank screen on load.** `AuthProvider` renders `{!loading && children}`, so nothing at all renders until `onAuthStateChanged` resolves — a white screen rather than a spinner. Showing `LoadingScreen` instead would be a small, visible win.

**Firestore long-polling.** A Listen/channel request every ~1.5 s indefinitely, each returning 11 bytes. Background chatter and phone battery cost.

**Dead FCM code.** Ships roughly 20 KB and blocks module execution at startup (see v1.5 above).

**Minor waste.** `icon-192.png` fetched 3–4 times; the Tamil font fetched twice.

**Refactoring.** Split `starDate.js` and its Tamil/Sanskrit maps into separate data, logic and UI modules.

---

## Unbuilt ideas

Floated but never chosen. Recorded so they aren't lost:

- Sharing or exporting reminders
- Reminder categories or tags
- A full-year-at-a-glance view
- Multiple alert lead times ("remind me 3 days before")

---

## Parked until going public

- **Own domain and domain-based email** for Brevo. Fixes the `@brevosend.com` sender rewrite and improves deliverability.
- **Rename the hosting URL** from `tamil-calendar-b4044.web.app`.

---

## Working practices

Conventions this project follows, recorded because they were arrived at the hard way.

**One step at a time, with a verification checkpoint before moving on.** Confirm each change works before starting the next.

**Manual, file-by-file builds.** Agents running ahead unsupervised caused a rollback during v1.4. Scope them to "diagnose only, change nothing, do not commit" unless the task is genuinely low-risk, such as documentation.

**Full file replacements** over diff-style patches. Edit in VS Code, not via PowerShell redirection.

**Release flow:** feature branch → `gh pr create --fill` → review the diff → `gh pr merge --squash`. **Verify branch deletion manually** with `git branch -a` — `--delete-branch` has silently failed more than once.

**Note that squash merges discard intermediate commits.** Code added and removed within a single branch never reaches `main`'s history. This is how `runDigestNow` came to have no source anywhere in the repo.

**Before concluding anything is broken after adding a new import:** clear Vite's cache, restart, hard-refresh.

```powershell
Remove-Item -Recurse -Force node_modules\.vite
npm run dev
# then Ctrl+Shift+R in the browser
```

HMR can leave the browser running the old module — the code is on disk, committed and correct, but never executes. This cost hours during v1.4.

**Never delete Firestore documents casually.** The Console's "Delete document" **cascades into subcollections**; the SDK's `deleteDoc` does not. Confusing the two caused permanent loss of 10+ reminders on 4 September 2026, with no backup. PITR is now enabled with a 7-day window. Prefer testing first-write code paths with a second account over deleting anything.

**Branch protection.** Ruleset `protect-main` is active: restricts deletions, blocks force pushes, requires a PR. Required approvals must stay at **0** and the Code Owners rule must stay **off** while working solo — GitHub forbids self-approval, which would lock the repository. New collaborators should get Triage, not Write.
