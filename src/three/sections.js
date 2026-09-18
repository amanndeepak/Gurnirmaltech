// Single source of truth for how the scroll timeline is divided into
// "pages" (1 page = 1 viewport height inside drei's ScrollControls).
// Every 3D layer and every nav/dot control reads from this instead of
// hardcoding fractions, so the layout can be re-paced from one place.
export const PAGES = 12;

export const SECTIONS = {
  hero: { start: 0, length: 1, label: "Home" },
  whoWeAre: { start: 1, length: 1, label: "Who we are" },
  capabilities: { start: 2, length: 1, label: "What we do" },
  ekdiary: { start: 3, length: 1, label: "EkDiary" },
  // Extra-long on purpose: this is a slow walk through the ecopark, not a
  // quick flythrough, so it gets 4 pages instead of 1.
  ecopark: { start: 4, length: 4, label: "Ecosystem" },
  techParks: { start: 8, length: 1, label: "Tech Parks" },
  mission: { start: 9, length: 1, label: "Mission" },
  whyUs: { start: 10, length: 1, label: "Why us" },
  contact: { start: 11, length: 1, label: "Contact" },
};

// Fractional (0..1) start/length, ready to feed into hill().
export function frac(key) {
  const s = SECTIONS[key];
  return { start: s.start / PAGES, length: s.length / PAGES };
}

export function activeKey(offset) {
  const p = offset * PAGES;
  const entries = Object.entries(SECTIONS);
  for (const [key, s] of entries) {
    if (p < s.start + s.length) return key;
  }
  return entries[entries.length - 1][0];
}

export const NAV_ITEMS = [
  "whoWeAre",
  "capabilities",
  "ekdiary",
  "ecopark",
  "techParks",
  "mission",
  "whyUs",
  "contact",
].map((key) => ({ key, label: SECTIONS[key].label }));

export const DOT_ITEMS = ["hero", ...NAV_ITEMS.map((n) => n.key)].map((key) => ({
  key,
  label: SECTIONS[key].label,
}));
