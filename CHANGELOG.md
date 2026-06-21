# Changelog

All notable changes to this project are documented here.

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
