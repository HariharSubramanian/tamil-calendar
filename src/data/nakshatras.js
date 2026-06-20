// ===========================================================================
// src/data/nakshatras.js
// DATA ONLY — the 27 nakshatras (stars).
// No logic here. Just the names in Tamil, Sanskrit (library), and Tamil script.
// ===========================================================================

// Each star, in nakshatra order (1–27).
//  - tamil:    the key used in the app and dropdowns (Tamil name, transliterated)
//  - sanskrit: the name the panchangam library returns (must match exactly)
//  - script:   the Tamil-script display label
export const NAKSHATRAS = [
  { tamil: "Ashwini", sanskrit: "Ashwini", script: "அசுவினி" },
  { tamil: "Bharani", sanskrit: "Bharani", script: "பரணி" },
  { tamil: "Karthigai", sanskrit: "Krittika", script: "கார்த்திகை" },
  { tamil: "Rohini", sanskrit: "Rohini", script: "ரோகிணி" },
  { tamil: "Mrigashirsham", sanskrit: "Mrigashira", script: "மிருகசீரிடம்" },
  { tamil: "Thiruvathirai", sanskrit: "Ardra", script: "திருவாதிரை" },
  { tamil: "Punarpoosam", sanskrit: "Punarvasu", script: "புனர்பூசம்" },
  { tamil: "Poosam", sanskrit: "Pushya", script: "பூசம்" },
  { tamil: "Ayilyam", sanskrit: "Ashlesha", script: "ஆயில்யம்" },
  { tamil: "Magham", sanskrit: "Magha", script: "மகம்" },
  { tamil: "Pooram", sanskrit: "Purva Phalguni", script: "பூரம்" },
  { tamil: "Uthiram", sanskrit: "Uttara Phalguni", script: "உத்திரம்" },
  { tamil: "Hastham", sanskrit: "Hasta", script: "அஸ்தம்" },
  { tamil: "Chithirai", sanskrit: "Chitra", script: "சித்திரை" },
  { tamil: "Swathi", sanskrit: "Swati", script: "சுவாதி" },
  { tamil: "Visakam", sanskrit: "Vishakha", script: "விசாகம்" },
  { tamil: "Anusham", sanskrit: "Anuradha", script: "அனுஷம்" },
  { tamil: "Kettai", sanskrit: "Jyeshtha", script: "கேட்டை" },
  { tamil: "Moolam", sanskrit: "Mula", script: "மூலம்" },
  { tamil: "Pooradam", sanskrit: "Purva Ashadha", script: "பூராடம்" },
  { tamil: "Uthiradam", sanskrit: "Uttara Ashadha", script: "உத்திராடம்" },
  { tamil: "Thiruvonam", sanskrit: "Shravana", script: "திருவோணம்" },
  { tamil: "Avittam", sanskrit: "Dhanishta", script: "அவிட்டம்" },
  { tamil: "Sathayam", sanskrit: "Shatabhisha", script: "சதயம்" },
  { tamil: "Poorattathi", sanskrit: "Purva Bhadrapada", script: "பூரட்டாதி" },
  {
    tamil: "Uthirattathi",
    sanskrit: "Uttara Bhadrapada",
    script: "உத்திரட்டாதி",
  },
  { tamil: "Revathi", sanskrit: "Revati", script: "ரேவதி" },
];

// Convenience lookups derived from the list above (built once).
export const NAK_TAMIL_TO_SANSKRIT = Object.fromEntries(
  NAKSHATRAS.map((n) => [n.tamil, n.sanskrit]),
);
export const NAK_TAMIL_TO_SCRIPT = Object.fromEntries(
  NAKSHATRAS.map((n) => [n.tamil, n.script]),
);
