import { expect, test } from "vitest";
import { paybackMonths, paybackSeries, priceSystem } from "./pricing";

test("prices the demo shop", () => {
  const q = priceSystem({ dailyWh: 3860, peakW: 450, surgeW: 750, inverterKVA: 1, batteryKWh: 5, panelCount: 3, panelW: 1650 });
  expect(q.total).toBe(2430000);
});

test("payback months", () => {
  expect(paybackMonths(2430000, 25000)).toBe(23);
});

test("no fuel spend means no payback, never Infinity", () => {
  expect(paybackMonths(2430000, 0)).toBeNull();
  expect(paybackMonths(2430000, -5)).toBeNull();
  expect(paybackMonths(2430000, NaN)).toBeNull();
});

test("series covers payback plus 6 months, min 36", () => {
  const s = paybackSeries(2430000, 25000);
  expect(s.length).toBe(37);
  expect(s[0]).toEqual({ month: 0, generator: 0, solar: 2430000 });
});

test("series without fuel spend has flat zero generator line", () => {
  const s = paybackSeries(2430000, 0);
  expect(s.length).toBe(37);
  expect(s.every((p) => p.generator === 0)).toBe(true);
});
