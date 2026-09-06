# Changelog

All notable changes to this project are documented here.

## [1.4.0] — 2026-09-05

### Added

- Daily email digest — a single email at 6:00 AM IST listing the reminders that fall that day, sent to users who have email reminders switched on
- Settings page with an account-level toggle for the daily email
- Reminders now store their upcoming occurrence dates, so the email knows what's due without recalculating Tamil dates

### Fixed

- The Tamil date cache could return the wrong date for a newly added reminder before it was saved (it was keyed on the reminder's ID, which doesn't exist yet at that point)

## [1.3.0] — 2026-06-21

### Changed

- Renamed the app to நினைவூட்டல்கள் (Ninaivootal); updated manifest name, short name, and page title
- Updated the PWA theme colour to the new blue (#3B82C4), matching the app's palette
- Fixed manifest and icon paths to load correctly from the site root

### Added

- One-time notice for users with the app already installed, explaining how to refresh the home-screen name (auto-hides after the migration window)

## [1.2.0] — 2026-06-21

### Added

- Branded loading screen (app icon + spinning ring) while reminders load, on both the calendar and the reminders list
- "Couldn't load — Retry" state if loading fails or times out

### Changed

- Recoloured the whole app to a blue/navy palette derived from the logo, with colours centralized in one theme file

## [1.1.0] — 2026-06-21

### Added

- Edit reminders — pencil icon opens the form pre-filled; saving updates the reminder
- Delete reminders — dustbin icon with a confirmation step before deleting
- "All Reminders" list page, split from the add form (separate routes: /reminders/add and /reminders/list)
- Reminders list sorted by next occurrence, split into "Upcoming this year" and "Earlier this year" sections, each with an "in N days" countdown
- Click a reminder in the list to jump the calendar to that date
- "Today" button on the calendar to return to the current month and date
- Today's date selected by default when the calendar opens, showing its reminders

### Changed

- Calendar now selects today by default and shows that day's reminders on load

### Removed

- Hardcoded festival calendar (festivals.js) — festival display was already disabled; the data file is now removed (a dynamic festival source is planned for a future version)

## [1.0.0] — 2026-06-20

### Added

- Reminders: date of birth, anniversary, and Tamil star (nakshatram) birthday
- Tamil star dates calculated automatically from Tamil month + star
- Yearly recurrence — dates recalculated per year automatically
- Upcoming reminder banner on the calendar
- Google sign-in
- Bilingual (Tamil + English) landing page
