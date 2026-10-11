/* shared ground layout: which lots near the plaza become parks */

// lots in the first ring of blocks around the plaza that are kept green
export function isParkLot(gx, gz) {
  const ring = Math.max(Math.abs(gx), Math.abs(gz));
  if (ring > 6) return false;
  return (gx * 5 + gz * 3 + 40) % 4 === 0;
}
