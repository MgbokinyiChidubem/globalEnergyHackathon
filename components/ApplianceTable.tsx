"use client";

import { useState } from "react";
import { parseField } from "@/lib/parseField";
import type { Appliance } from "@/lib/types";

type Props = { appliances: Appliance[]; onChange: (next: Appliance[]) => void };

type CellProps = { label: string; value: number; min: number; max: number; step?: number; int?: boolean; width: string;
  onCommit: (n: number) => void };

/** Number cell that can be blank while typing; valid values apply live, blur restores the last valid value. */
function NumberCell({ label, value, min, max, step, int, width, onCommit }: CellProps) {
  const [draft, setDraft] = useState<string | null>(null);
  return (
    <input aria-label={label} type="number" min={min} max={max} step={step} className={`${width} px-2 py-1`}
      value={draft ?? String(value)}
      onChange={(e) => {
        setDraft(e.target.value);
        const n = parseField(e.target.value, min, max, int);
        if (n !== null) onCommit(n);
      }}
      onBlur={() => setDraft(null)} />
  );
}

export default function ApplianceTable({ appliances, onChange }: Props) {
  const update = (i: number, patch: Partial<Appliance>) =>
    onChange(appliances.map((a, j) => (j === i ? { ...a, ...patch } : a)));

  return (
    <div className="rounded-3xl bg-panel p-6 shadow-[0_1px_0_#ead9bd,0_20px_40px_-24px_rgba(120,80,20,0.35)]">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-display text-xl font-bold">What the AI read from your list</h3>
        <span className="text-muted">Change any number and the results above update</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px]">
          <thead className="text-left text-muted">
            <tr>
              <th className="py-1 font-medium">Appliance</th>
              <th className="font-medium">Watts</th>
              <th className="font-medium">Hours/day</th>
              <th className="font-medium">Qty</th>
              <th className="font-medium">Motor</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {appliances.map((a, i) => (
              <tr key={i}>
                <td className="py-1 pr-2">
                  <input aria-label="Appliance name" className="w-full px-2 py-1" value={a.name} maxLength={60}
                    onChange={(e) => update(i, { name: e.target.value })} />
                </td>
                <td className="pr-2">
                  <NumberCell label="Watts" value={a.watts} min={1} max={5000} width="w-20" onCommit={(watts) => update(i, { watts })} />
                </td>
                <td className="pr-2">
                  <NumberCell label="Hours per day" value={a.hours} min={0} max={24} step={0.5} width="w-20" onCommit={(hours) => update(i, { hours })} />
                </td>
                <td className="pr-2">
                  <NumberCell label="Quantity" value={a.qty} min={1} max={50} int width="w-16" onCommit={(qty) => update(i, { qty })} />
                </td>
                <td className="pr-2 text-center">
                  <input aria-label="Has a motor" type="checkbox" checked={a.motor} onChange={(e) => update(i, { motor: e.target.checked })} />
                </td>
                <td>
                  <button aria-label={`Remove ${a.name}`} className="rounded-full px-2.5 py-1 text-bad hover:bg-bad/10" onClick={() => onChange(appliances.filter((_, j) => j !== i))}>
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button className="mt-4 font-bold text-amber underline-offset-4 hover:underline"
        onClick={() => onChange([...appliances, { name: "New appliance", watts: 100, hours: 4, qty: 1, motor: false }])}>
        + Add appliance
      </button>
    </div>
  );
}
