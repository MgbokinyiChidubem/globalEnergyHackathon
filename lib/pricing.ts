import prices from "./prices.json";
import type { SystemSize } from "./types";

export type Quote = { inverter: number; battery: number; panels: number; install: number; total: number };
export type PaybackPoint = { month: number; generator: number; solar: number };

export function priceSystem(size: SystemSize): Quote {
  const inverter = size.inverterKVA * prices.inverterPerKVA;
  const battery = size.batteryKWh * prices.batteryPerKWh;
  const panels = size.panelCount * prices.panel550W;
  const install = size.panelCount > 0 ? prices.installFlat : 0;
  return { inverter, battery, panels, install, total: inverter + battery + panels + install };
}

const monthlyFuel = (weeklyFuel: number) => (weeklyFuel * 52) / 12;

/** Months until cumulative fuel spend passes the system cost; null without a positive fuel spend. */
export function paybackMonths(total: number, weeklyFuel: number): number | null {
  if (!Number.isFinite(weeklyFuel) || weeklyFuel <= 0) return null;
  return Math.ceil(total / monthlyFuel(weeklyFuel));
}

export function paybackSeries(total: number, weeklyFuel: number): PaybackPoint[] {
  const payback = paybackMonths(total, weeklyFuel);
  const fuel = payback === null ? 0 : monthlyFuel(weeklyFuel);
  const last = Math.max(36, (payback ?? 0) + 6);
  return Array.from({ length: last + 1 }, (_, month) => ({ month, generator: month * fuel, solar: total }));
}
