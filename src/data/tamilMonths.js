// ===========================================================================
// src/data/tamilMonths.js
// DATA ONLY — the 12 Tamil solar months.
// No logic here. Names, Tamil script, and the zodiac sign (rashi index 0–11)
// the sun enters to BEGIN each month (used to find month boundaries via Sankranti).
// ===========================================================================

// Tamil solar months, in order (Chithirai is the first month of the Tamil year).
//  - tamil:      key used in the app and dropdowns
//  - script:     Tamil-script display label
//  - startRashi: the zodiac index the Sun enters to start this month
//                (0=Aries/Mesha ... 11=Pisces/Meena). The panchangam library's
//                Sankranti `rashi` field uses this same 0-based index.
export const TAMIL_MONTHS = [
  { tamil: "Chithirai", script: "சித்திரை", startRashi: 0 }, // Sun enters Aries
  { tamil: "Vaikasi", script: "வைகாசி", startRashi: 1 }, // Taurus
  { tamil: "Aani", script: "ஆனி", startRashi: 2 }, // Gemini
  { tamil: "Aadi", script: "ஆடி", startRashi: 3 }, // Cancer
  { tamil: "Avani", script: "ஆவணி", startRashi: 4 }, // Leo
  { tamil: "Purattasi", script: "புரட்டாசி", startRashi: 5 }, // Virgo
  { tamil: "Aippasi", script: "ஐப்பசி", startRashi: 6 }, // Libra
  { tamil: "Karthigai", script: "கார்த்திகை", startRashi: 7 }, // Scorpio
  { tamil: "Margazhi", script: "மார்கழி", startRashi: 8 }, // Sagittarius
  { tamil: "Thai", script: "தை", startRashi: 9 }, // Capricorn
  { tamil: "Maasi", script: "மாசி", startRashi: 10 }, // Aquarius
  { tamil: "Panguni", script: "பங்குனி", startRashi: 11 }, // Pisces
];

// Convenience lookups.
export const MONTH_TAMIL_TO_RASHI = Object.fromEntries(
  TAMIL_MONTHS.map((m) => [m.tamil, m.startRashi]),
);
export const MONTH_TAMIL_TO_SCRIPT = Object.fromEntries(
  TAMIL_MONTHS.map((m) => [m.tamil, m.script]),
);
