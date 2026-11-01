/** Parse a number cell. Null for blank or junk (the cell may be mid-edit); otherwise clamped into range. */
export function parseField(v: string, min: number, max: number, int = false): number | null {
  if (v.trim() === "") return null;
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  return Math.min(max, Math.max(min, int ? Math.round(n) : n));
}
