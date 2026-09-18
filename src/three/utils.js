// Returns a 0 -> 1 -> 0 "hill" shaped progress value as `offset` passes
// through [start, start+length], easing in/out over `margin`.
export function hill(offset, start, length, margin = 0.03) {
  const inStart = start - margin;
  const end = start + length;
  const outEnd = end + margin;
  if (offset <= inStart || offset >= outEnd) return 0;
  if (offset < start) return smoothstep((offset - inStart) / margin);
  if (offset > end) return 1 - smoothstep((offset - end) / margin);
  return 1;
}

export function smoothstep(x) {
  const t = Math.min(Math.max(x, 0), 1);
  return t * t * (3 - 2 * t);
}

// Small deterministic PRNG so layout stays stable across re-renders without
// depending on Math.random() (and without reassigning state inside a
// component body, which trips the react-hooks lint rule).
export function makeRng(seed) {
  const state = { value: seed };
  return () => {
    state.value = (state.value * 9301 + 49297) % 233280;
    return state.value / 233280;
  };
}
