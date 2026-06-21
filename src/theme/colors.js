// ===========================================================================
// src/theme/colors.js
// Single source of truth for the app's colors, derived from the logo icon.
// All-blue/navy palette (no warm accent). Change a value here -> updates everywhere.
// ===========================================================================

export const COLORS = {
  // Primary — the logo's sky blue. Buttons, primary actions, headers.
  primary: "#3B82C4",
  primaryDark: "#2C6BA6", // hover / pressed
  primaryBg: "#E6F1FB", // soft blue tint (banners, reminder-day cells)

  // Strong — the logo's deep navy ("த"). Selected day, today, emphasis.
  navy: "#1A3A5C",
  navyBg: "#E3E9F0",

  // Reminder marker — a brighter azure so reminders stay visible within the blues.
  reminder: "#2E9BD6",
  reminderDark: "#1C6FA0", // reminder text on light bg

  // Neutrals
  white: "#FFFFFF",
  text: "#222222",
  textMuted: "#666666",
  textFaint: "#999999",
  border: "#E5E7EB",
  borderSoft: "#EEF0F2",
  danger: "#C0392B", // delete actions
  dangerBg: "#FFF5F5",
};

// Convenience groupings used by the calendar/reminders UI.
export const REMINDER = {
  bg: COLORS.primaryBg, // light-blue day-cell / banner background
  dot: COLORS.reminder, // brighter azure marker
  text: COLORS.reminderDark, // readable reminder text
};

export const SELECTED = COLORS.navy; // selected day / today accent
