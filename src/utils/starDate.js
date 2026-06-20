// ===========================================================================
// src/utils/starDate.js
// LOGIC ONLY — the star-birthday calculation.
// Imports names from the data layer; contains no name definitions or UI.
// Validated: Aani + Visakam 2026 -> June 26 2026 (matches Drik Panchang).
// ===========================================================================

import {
  Observer,
  getPanchangamDetails,
  findSankrantisInRange,
} from "@ishubhamx/panchangam-js";
import { NAK_TAMIL_TO_SANSKRIT } from "../data/nakshatras";
import { MONTH_TAMIL_TO_RASHI } from "../data/tamilMonths";

// Chennai — star-birthdays are anchored to Chennai sunrise.
const CHENNAI = new Observer(13.0827, 80.2707, 0);

const ONE_DAY_MS = 86400000;

// The nakshatra present at sunrise rules the day (traditional star-birthday rule).
function getNakshatraAtSunrise(date) {
  const details = getPanchangamDetails(date, CHENNAI);
  // nakshatras[0] is the nakshatra active at/just after sunrise.
  return details.nakshatras?.[0]?.name || null;
}

// Find the Gregorian start/end of a Tamil solar month in a given year,
// using Sankranti (the moment the Sun enters the month's starting zodiac sign).
function getTamilMonthRange(tamilMonth, year) {
  const targetRashi = MONTH_TAMIL_TO_RASHI[tamilMonth];
  if (targetRashi === undefined) return null;

  // Search a window wide enough to include this month and the next boundary.
  const sankrantis = findSankrantisInRange(
    new Date(`${year}-01-01`),
    new Date(`${year + 1}-02-01`),
    CHENNAI,
  );

  const startIdx = sankrantis.findIndex((s) => s.rashi === targetRashi);
  if (startIdx === -1) return null;

  const start = new Date(sankrantis[startIdx].exactTime);
  const end = sankrantis[startIdx + 1]
    ? new Date(sankrantis[startIdx + 1].exactTime)
    : new Date(start.getTime() + 32 * ONE_DAY_MS); // safety fallback (~one month)

  return { start, end };
}

// MAIN: given a Tamil month + Tamil star + year, return the Gregorian Date
// of that star-birthday (or null if it can't be resolved).
export function findStarBirthday(tamilMonth, tamilStar, year) {
  const sanskritStar = NAK_TAMIL_TO_SANSKRIT[tamilStar];
  if (!sanskritStar) return null;

  const range = getTamilMonthRange(tamilMonth, year);
  if (!range) return null;

  // Scan each day of the month; return the first day whose sunrise nakshatra matches.
  for (
    let d = new Date(range.start);
    d <= range.end;
    d = new Date(d.getTime() + ONE_DAY_MS)
  ) {
    const morning = new Date(
      d.getFullYear(),
      d.getMonth(),
      d.getDate(),
      8,
      0,
      0,
    );
    if (getNakshatraAtSunrise(morning) === sanskritStar) {
      return new Date(
        morning.getFullYear(),
        morning.getMonth(),
        morning.getDate(),
      );
    }
  }
  return null;
}

// Helper: format a Date as an ISO date string (YYYY-MM-DD) for storage.
export function toISODate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
