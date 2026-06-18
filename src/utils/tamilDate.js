const NAMES_TA = [
  "தை",
  "மாசி",
  "பங்குனி",
  "சித்திரை",
  "வைகாசி",
  "ஆனி",
  "ஆடி",
  "ஆவணி",
  "புரட்டாசி",
  "ஐப்பசி",
  "கார்த்திகை",
  "மார்கழி",
];
const STARTS = [
  [0, 14],
  [1, 12],
  [2, 14],
  [3, 14],
  [4, 15],
  [5, 15],
  [6, 17],
  [7, 17],
  [8, 17],
  [9, 17],
  [10, 16],
  [11, 16],
];

export function getTamilMonth(date) {
  const m = date.getMonth(),
    d = date.getDate();
  for (let i = 0; i < 12; i++) {
    const [gm, sd] = STARTS[i];
    const [ngm, nsd] = STARTS[(i + 1) % 12];
    if (m === gm && d >= sd) return i;
    if (m === ngm && d < nsd) return i;
  }
  return 0;
}

export function getTamilMonthName(date) {
  return NAMES_TA[getTamilMonth(date)];
}
