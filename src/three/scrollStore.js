import { PAGES, SECTIONS } from "./sections";

let offset = 0;
let el = null;
const listeners = new Set();

export { PAGES };

export const scrollStore = {
  setOffset(v) {
    if (Math.abs(v - offset) < 0.0008) return;
    offset = v;
    listeners.forEach((l) => l());
  },
  getOffset: () => offset,
  setEl(node) {
    el = node;
  },
  getEl: () => el,
  subscribe(cb) {
    listeners.add(cb);
    return () => listeners.delete(cb);
  },
  goTo(pageIndex) {
    if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    el.scrollTo({ top: (pageIndex / PAGES) * max, behavior: "smooth" });
  },
  goToSection(key) {
    scrollStore.goTo(SECTIONS[key].start);
  },
};
