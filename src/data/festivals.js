// Tamil festivals and observances for 2025-2026
// v1 uses a curated hardcoded list. Dynamic Panchangam
// calculation is planned for v1.1.
//
// IMPORTANT: These dates are approximate and based on common
// Tamil calendar references. Before launch, verify each against
// a trusted Panchangam (e.g. your family almanac or Drik Panchang)
// since some festival dates shift slightly by region and by the
// specific Panchangam tradition followed.

export const FESTIVALS = [
  // ---- 2025 (second half) ----
  {
    id: "f1",
    name_en: "Aadi Perukku",
    name_ta: "ஆடிப்பெருக்கு",
    date: "2025-08-03",
    type: "festival",
    desc: "18th day of Aadi — river and water worship",
  },
  {
    id: "f2",
    name_en: "Aadi Pooram",
    name_ta: "ஆடிப் பூரம்",
    date: "2025-08-04",
    type: "festival",
    desc: "Andal birthday — celebrated in Vaishnava temples",
  },
  {
    id: "f3",
    name_en: "Krishna Jayanthi",
    name_ta: "கிருஷ்ண ஜெயந்தி",
    date: "2025-08-16",
    type: "festival",
    desc: "Birth of Lord Krishna — Gokulashtami",
  },
  {
    id: "f4",
    name_en: "Vinayagar Chaturthi",
    name_ta: "விநாயகர் சதுர்த்தி",
    date: "2025-08-27",
    type: "festival",
    desc: "Birthday of Lord Ganesha",
  },
  {
    id: "f5",
    name_en: "Mahalaya Amavasai",
    name_ta: "மகாளய அமாவாசை",
    date: "2025-09-21",
    type: "observance",
    desc: "New moon for ancestral offerings (Tarpanam)",
  },
  {
    id: "f6",
    name_en: "Navaratri begins",
    name_ta: "நவராத்திரி தொடக்கம்",
    date: "2025-09-22",
    type: "festival",
    desc: "Nine nights of the Goddess — Golu display begins",
  },
  {
    id: "f7",
    name_en: "Saraswati Puja",
    name_ta: "சரஸ்வதி பூஜை",
    date: "2025-09-30",
    type: "festival",
    desc: "Worship of Goddess Saraswati — books and tools blessed",
  },
  {
    id: "f8",
    name_en: "Vijaya Dasami",
    name_ta: "விஜயதசமி",
    date: "2025-10-02",
    type: "festival",
    desc: "Tenth day — Vidyarambham, auspicious new beginnings",
  },
  {
    id: "f9",
    name_en: "Deepavali",
    name_ta: "தீபாவளி",
    date: "2025-10-20",
    type: "festival",
    desc: "Festival of lights — oil bath, sweets, crackers",
  },
  {
    id: "f10",
    name_en: "Soorasamharam",
    name_ta: "சூரசம்ஹாரம்",
    date: "2025-10-31",
    type: "festival",
    desc: "Skanda Sashti — Murugan defeats Soorapadman",
  },
  {
    id: "f11",
    name_en: "Karthigai Deepam",
    name_ta: "கார்த்திகை தீபம்",
    date: "2025-12-04",
    type: "festival",
    desc: "Festival of lights on the Karthigai star day",
  },
  {
    id: "f12",
    name_en: "Margazhi begins",
    name_ta: "மார்கழி மாதம்",
    date: "2025-12-16",
    type: "observance",
    desc: "Holy month of Margazhi — Thiruppavai recitation",
  },
  {
    id: "f13",
    name_en: "Vaikunta Ekadasi",
    name_ta: "வைகுண்ட ஏகாதசி",
    date: "2025-12-31",
    type: "ekadasi",
    desc: "Swarga Vaasal opens — special at Srirangam, Tirupati",
  },

  // ---- 2026 ----
  {
    id: "f14",
    name_en: "Thai Pongal",
    name_ta: "தைப் பொங்கல்",
    date: "2026-01-14",
    type: "festival",
    desc: "Harvest festival — first day of Thai, sweet Pongal",
  },
  {
    id: "f15",
    name_en: "Maatu Pongal",
    name_ta: "மாட்டுப் பொங்கல்",
    date: "2026-01-15",
    type: "festival",
    desc: "Second day — cattle are honoured and decorated",
  },
  {
    id: "f16",
    name_en: "Kaanum Pongal",
    name_ta: "காணும் பொங்கல்",
    date: "2026-01-16",
    type: "festival",
    desc: "Third day — family outings and visits",
  },
  {
    id: "f17",
    name_en: "Thai Poosam",
    name_ta: "தைப்பூசம்",
    date: "2026-02-01",
    type: "festival",
    desc: "Murugan festival — Kavadi and Paal Kudam processions",
  },
  {
    id: "f18",
    name_en: "Maha Shivaratri",
    name_ta: "மகா சிவராத்திரி",
    date: "2026-02-15",
    type: "festival",
    desc: "Great night of Lord Shiva — all-night vigil and fasting",
  },
  {
    id: "f19",
    name_en: "Panguni Uthiram",
    name_ta: "பங்குனி உத்திரம்",
    date: "2026-04-02",
    type: "festival",
    desc: "Celestial weddings — Murugan-Deivanai, Shiva-Parvati",
  },
  {
    id: "f20",
    name_en: "Tamil Puthandu",
    name_ta: "தமிழ் புத்தாண்டு",
    date: "2026-04-14",
    type: "festival",
    desc: "Tamil New Year — Chithirai 1, Panchangam reading",
  },
  {
    id: "f21",
    name_en: "Chithra Pournami",
    name_ta: "சித்திரா பௌர்ணமி",
    date: "2026-05-01",
    type: "observance",
    desc: "Full moon of Chithirai — Chitragupta worship",
  },
  {
    id: "f22",
    name_en: "Vaikasi Visakam",
    name_ta: "வைகாசி விசாகம்",
    date: "2026-05-31",
    type: "festival",
    desc: "Birth star of Lord Murugan",
  },
  {
    id: "f23",
    name_en: "Aadi Amavasai",
    name_ta: "ஆடி அமாவாசை",
    date: "2026-07-14",
    type: "observance",
    desc: "New moon in Aadi — ancestral offerings",
  },
];

// Visual style per festival type — used for calendar dots and badges
export const TYPE_COLORS = {
  festival: { bg: "#FFF0F0", dot: "#8B0000", label: "Festival" },
  ekadasi: { bg: "#FFF8E8", dot: "#7A5500", label: "Ekadasi" },
  observance: { bg: "#F0F4FF", dot: "#1A3A8B", label: "Observance" },
};
