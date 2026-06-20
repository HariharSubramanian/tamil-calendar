// ===========================================================================
// src/utils/reminderDates.js
// LOGIC ONLY — resolve a reminder to its Gregorian date for a given YEAR.
// This is what makes reminders recur every year forever:
//   - DOB:   trivial — same month/day each year.
//   - Tamil: recalculated per year via findStarBirthday (date shifts yearly).
// Tamil results are cached per (reminderId + year) so each year is computed
// at most once per session (good performance, always correct for any year).
// ===========================================================================

import { findStarBirthday, toISODate } from "./starDate";

const tamilCache = new Map(); // key: `${id}|${year}` -> ISO date string | null

// Resolve ONE reminder to an ISO date (YYYY-MM-DD) in the given year, or null.
export function resolveReminderDate(reminder, year) {
  if (reminder.type === "dob") {
    // Recurring on the same month/day every year.
    if (reminder.month == null || reminder.day == null) return null;
    const mm = String(reminder.month).padStart(2, "0");
    const dd = String(reminder.day).padStart(2, "0");
    return `${year}-${mm}-${dd}`;
  }

  if (reminder.type === "tamil") {
    const key = `${reminder.id}|${year}`;
    if (tamilCache.has(key)) return tamilCache.get(key);
    const d = findStarBirthday(reminder.tamilMonth, reminder.tamilStar, year);
    const iso = d ? toISODate(d) : null;
    tamilCache.set(key, iso);
    return iso;
  }

  return null;
}

// Resolve a whole list of reminders for a given MONTH of a year.
// Returns a map: { dayOfMonth: [reminders...] } for that month.
export function remindersForMonth(reminders, year, monthIndex) {
  const map = {};
  reminders.forEach((r) => {
    const iso = resolveReminderDate(r, year);
    if (!iso) return;
    const d = new Date(iso);
    if (d.getFullYear() === year && d.getMonth() === monthIndex) {
      const k = d.getDate();
      (map[k] = map[k] || []).push(r);
    }
  });
  return map;
}

// Days until the next occurrence of a reminder (for the in-app banner).
// Looks at this year and next year, returns the soonest upcoming.
export function daysUntilNext(reminder, fromDate = new Date()) {
  const thisYear = fromDate.getFullYear();
  for (const year of [thisYear, thisYear + 1]) {
    const iso = resolveReminderDate(reminder, year);
    if (!iso) continue;
    const target = new Date(iso);
    target.setHours(0, 0, 0, 0);
    const base = new Date(fromDate);
    base.setHours(0, 0, 0, 0);
    const diff = Math.round((target - base) / 86400000);
    if (diff >= 0) return diff;
  }
  return null;
}
