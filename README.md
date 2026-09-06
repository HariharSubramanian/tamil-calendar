# நினைவூட்டல்கள் — Ninaivootal

A Tamil calendar and reminders PWA. It keeps birthdays, anniversaries, and
**Tamil star (nakshatram) birthdays** — recalculating the Gregorian date of each
star birthday every year — and sends a single morning email listing whatever
falls that day. Built for personal and family use.

- **Live:** https://tamil-calendar-b4044.web.app
- **Roadmap:** [ROADMAP.md](ROADMAP.md)
- **Changelog:** [CHANGELOG.md](CHANGELOG.md)
- **Cloud Functions:** [functions/README.md](functions/README.md)

---

## What it does

- **Date-of-birth and anniversary reminders** — store a day/month (year optional);
  the app shows the age or the number of years each time it comes round.
- **Tamil star birthdays** — enter a Tamil month and star; the Gregorian date is
  computed from Panchangam data (Sankranti boundaries + the nakshatra at Chennai
  sunrise) and recalculated for each year.
- **Reminders-only calendar** — month grid marking days that have a reminder, with
  the current Tamil month name shown and an "upcoming" banner.
- **Reminders list** — split into "Upcoming this year" and "Earlier this year",
  each with an "in N days" countdown; tap a row to jump the calendar to that date.
- **Daily email digest** — one email at 06:00 IST listing that day's reminders,
  toggleable per account in Settings. See [functions/README.md](functions/README.md).
- **Installable PWA** — manifest + icons; runs standalone on a phone home screen.
- **Google sign-in**; the landing page is bilingual (Tamil + English).

---

## Stack

| Area | Choice |
|---|---|
| UI | React 19, React Router 7 (`BrowserRouter`) |
| Build | Vite 8, `@vitejs/plugin-react` |
| Styling | Tailwind CSS 4 (`@tailwindcss/vite`), plus inline styles and a central `src/theme/colors.js` |
| Icons | `lucide-react` |
| Panchangam | `@ishubhamx/panchangam-js` (Sankranti + sunrise nakshatra, anchored to Chennai) |
| Backend | Firebase — Auth (Google), Cloud Firestore, Hosting, Cloud Functions (v2) |
| Email | Firebase **Trigger Email** extension over Brevo SMTP |
| Lint | ESLint 10 (flat config); `dist/` and `functions/` are ignored |

No test runner is configured yet.

---

## Local setup

Requires Node 20+ and npm.

```bash
npm install
```

### Firebase environment variables

Firebase web config is read from `import.meta.env` at build time
(`src/firebase/config.js`). `.env` and `.env.*` are **gitignored**, so every
machine needs its own `.env` file in the repo root. The build fails silently
(blank app, auth errors) if any are missing.

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Values come from the Firebase console (Project settings → General → *Your apps* →
SDK setup and configuration). These six are also stored as GitHub Actions secrets
of the same names, used by the deploy workflow.

### Commands

```bash
npm run dev       # Vite dev server
npm run build     # production build into dist/
npm run preview   # serve the built dist/ locally
npm run lint      # ESLint over the app (not functions/)
```

If a newly added import doesn't take effect, clear Vite's cache and hard-reload —
HMR can keep running the old module:

```powershell
Remove-Item -Recurse -Force node_modules\.vite
npm run dev
# then Ctrl+Shift+R in the browser
```

---

## Routes

All app routes are defined in `src/main.jsx`. Everything except `/` is behind a
`PrivateRoute` that redirects to `/` when signed out.

| Path | Page | Notes |
|---|---|---|
| `/` | `LoginPage` | Bilingual landing + Google sign-in. Redirects to `/calendar` when already signed in. |
| `/calendar` | `CalendarPage` | Reminders-only month calendar. |
| `/reminders/add` | `AddReminder` | Add a reminder. `?edit=<id>` reuses the same form to edit. |
| `/reminders/list` | `RemindersList` | All reminders, sorted by next occurrence. |
| `/settings` | `Settings` | Account-level email toggle. |
| `*` | — | Redirects to `/`. |

> `src/App.jsx` / `src/App.css` and `src/assets/*.svg` are leftovers from the
> Vite starter and are not imported anywhere.

---

## Firestore data model

Rules (`firestore.rules`) allow a signed-in user to read/write only their own
`users/{uid}/**` subtree. The digest function uses the Admin SDK, which bypasses
rules.

### `users/{uid}` — profile

Created on first sign-in and refreshed on every load by
`src/firebase/userProfile.js`.

| Field | Written by | Notes |
|---|---|---|
| `email`, `displayName` | client | refreshed from the Google account each load |
| `notifyByEmail` | client | account-level digest switch; defaults `true`; a returning user's choice is never overwritten |
| `timezone` | client | detected IANA zone, refreshed each load. **Currently informational** — the digest resolves "today" in a fixed `Asia/Kolkata` (see [functions/README.md](functions/README.md)). |
| `lastNotifiedDate` | digest function | `YYYY-MM-DD` of the last digest sent; the idempotency guard |
| `createdAt`, `updatedAt` | client | server timestamps |

### `users/{uid}/reminders/{id}`

Stores the **definition**, not a fixed date, so it recurs yearly forever.

| Field | Applies to | Notes |
|---|---|---|
| `type` | all | `"dob"` or `"tamil"` |
| `label` | all | name shown in lists and the email |
| `alertMessage` | all | auto-generated from the label if left blank |
| `occurrences` | all | array of up to 5 upcoming ISO dates, computed in the browser (`src/utils/buildOccurrences.js`) and stored so the digest can query by date |
| `day`, `month` | `dob` | 1-based; required |
| `year` | `dob` | optional — drives "age" / "Nth anniversary" |
| `occasion` | `dob` | `"birthday"` or `"anniversary"` |
| `tamilMonth`, `tamilStar` | `tamil` | Tamil-script names; resolved via `@ishubhamx/panchangam-js` |
| `createdAt`, `updatedAt` | all | server timestamps |

### `mail/{id}` (top level)

The Firebase Trigger Email extension's queue. The digest function writes
`{ to, message: { subject, text, html } }`; the extension delivers it.

There is **no `active` field** anywhere in the model.

---

## Deployment model

| What | How |
|---|---|
| **Hosting** | GitHub Actions (`.github/workflows/deploy.yml`) on every push to `main`: `npm ci` → `npm run build` → `action-hosting-deploy` to the live channel. Deploys Hosting only. |
| **Cloud Functions** | Deployed **by hand**: `firebase deploy --only functions` (or `npm run deploy` in `functions/`). Not run by CI. |
| **Firestore rules / indexes** | Deployed manually with `firebase deploy` when changed. `firestore.indexes.json` is intentionally empty. |

`firebase deploy` reads the working directory on disk, not git — so uncommitted
function code can go live. This has produced orphaned functions with no source in
the repo; the history and a planned CI fix are documented in
[functions/README.md](functions/README.md). Direct pushes to `main` are blocked
by a `.githooks/pre-push` hook and a branch-protection ruleset; work on a branch
and open a PR.

---

## Caching note

`dist/assets/**` is served `immutable` for a year; `index.html` is set to
`no-cache`, but because the SPA rewrite serves `index.html` at `/calendar`,
`/settings`, etc., that header does not match those paths and the HTML is still
cached for up to an hour. Tracked in [ROADMAP.md](ROADMAP.md).
