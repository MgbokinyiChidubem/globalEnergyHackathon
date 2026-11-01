// Rooftop silhouette with a few lit windows; deterministic so server and client render the same.
const W = 1600, H = 220;

function buildings() {
  let seed = 11;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const out: { x: number; w: number; h: number; windows: { x: number; y: number; lit: boolean }[] }[] = [];
  for (let x = 0; x < W; ) {
    const w = 70 + Math.floor(rnd() * 90);
    const h = 60 + Math.floor(rnd() * 140);
    const windows = [];
    for (let wy = H - h + 16; wy < H - 18; wy += 26)
      for (let wx = x + 12; wx < x + w - 22; wx += 22) windows.push({ x: wx, y: wy, lit: rnd() > 0.72 });
    out.push({ x, w, h, windows });
    x += w + 4;
  }
  return out;
}

const BUILDINGS = buildings();

export default function Skyline() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice" className="block h-[150px] w-full sm:h-[220px]" aria-hidden>
      {BUILDINGS.map((b) => (
        <g key={b.x}>
          <rect x={b.x} y={H - b.h} width={b.w} height={b.h} fill="#0a1030" />
          {b.windows.map((w) => (
            <rect key={`${w.x}-${w.y}`} x={w.x} y={w.y} width={10} height={13} rx={1.5} fill={w.lit ? "#ffc23c" : "#1a2350"} opacity={w.lit ? 0.9 : 1} />
          ))}
        </g>
      ))}
    </svg>
  );
}
