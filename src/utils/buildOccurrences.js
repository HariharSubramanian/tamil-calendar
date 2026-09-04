// ===========================================================================
// src/utils/buildOccurrences.js
//
// Turns a reminder into a plain array of upcoming ISO dates:
//   ["2026-06-26", "2027-07-01", ...]
//
// This array is stored on the reminder document so Phase 2's scheduled
// function can find today's reminders with a single array-contains query.
// The server never calculates Tamil dates — the browser does it here and
// persists the answer, keeping the Cloud Function trivial.
// ===========================================================================

import { resolveReminderDate } from "./reminderDates";

const DEFAULT_COUNT = 5;

function toISO(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Guards against dates that look fine as strings but aren't real — most
// importantly a 29 February DOB in a non-leap year, where resolveReminderDate
// happily builds "2027-02-29".
function isRealDate(iso) {
  const d = new Date(iso);
  return !Number.isNaN(d.getTime()) && iso === toISO(d);
}

// Build the next `count` occurrence dates, starting from today. Scans forward
// year by year, skipping past dates and years that can't be resolved. Bounded
// so a reminder that never resolves can't loop forever.
export function buildOccurrences(
  reminder,
  count = DEFAULT_COUNT,
  fromDate = new Date(),
) {
  if (!reminder) return [];

  const today = toISO(fromDate);
  const startYear = fromDate.getFullYear();
  const maxYears = count + 3;
  const out = [];

  for (let i = 0; i < maxYears && out.length < count; i++) {
    const iso = resolveReminderDate(reminder, startYear + i);
    if (!iso) continue;
    if (!isRealDate(iso)) continue;
    if (iso < today) continue;
    out.push(iso);
  }

  return out;
}
