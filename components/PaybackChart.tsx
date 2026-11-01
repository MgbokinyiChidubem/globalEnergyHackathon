import type { PaybackPoint } from "@/lib/pricing";

const W = 640, H = 260, PAD = 40;

// Colours come from the surrounding scope's tokens (night or .day).
export default function PaybackChart({ series, payback }: { series: PaybackPoint[]; payback: number | null }) {
  const maxM = series[series.length - 1].month;
  const maxY = Math.max(...series.map((p) => Math.max(p.generator, p.solar)), 1);
  const x = (m: number) => PAD + (m / maxM) * (W - PAD * 1.5);
  const y = (v: number) => H - PAD - (v / maxY) * (H - PAD * 1.6);
  const line = (key: "generator" | "solar") => series.map((p) => `${x(p.month)},${y(p[key])}`).join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 w-full text-muted" role="img"
      aria-label={payback ? `Solar pays back in month ${payback}` : "Payback chart"}>
      <line x1={PAD} y1={H - PAD} x2={W - PAD / 2} y2={H - PAD} stroke="var(--color-line)" strokeWidth={2} />
      <line x1={PAD} y1={PAD / 2} x2={PAD} y2={H - PAD} stroke="var(--color-line)" strokeWidth={2} />
      <text x={W - PAD / 2} y={H - 12} fill="currentColor" fontSize={14} textAnchor="end">months</text>
      <text x={PAD + 8} y={PAD / 2 + 6} fill="currentColor" fontSize={14}>₦ spent</text>
      <polyline points={line("solar")} fill="none" stroke="var(--color-solar)" strokeWidth={4} strokeLinejoin="round" />
      <polyline points={line("generator")} fill="none" stroke="var(--color-gen)" strokeWidth={4} strokeLinejoin="round" />
      {payback !== null && (
        <g>
          <line x1={x(payback)} y1={PAD / 2} x2={x(payback)} y2={H - PAD} stroke="var(--color-sun)" strokeWidth={2} strokeDasharray="6 5" />
          <text x={x(payback) - 8} y={PAD + 6} fill="var(--color-foreground)" fontSize={15} fontWeight={700} textAnchor="end">
            month {payback}
          </text>
        </g>
      )}
    </svg>
  );
}
