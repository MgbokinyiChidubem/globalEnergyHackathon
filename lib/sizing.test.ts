import { expect, test } from "vitest";
import { roundToSize, sizeSystem } from "./sizing";
import type { Appliance } from "./types";

const shop: Appliance[] = [
  { name: "freezer", watts: 150, hours: 10, qty: 1, motor: true },
  { name: "standing fan", watts: 70, hours: 10, qty: 2, motor: false },
  { name: "TV", watts: 100, hours: 6, qty: 1, motor: false },
  { name: "LED bulb", watts: 10, hours: 6, qty: 6, motor: false },
];

test("sizes the demo shop for Lagos", () => {
  const s = sizeSystem(shop, 4.5);
  expect(s.dailyWh).toBe(3860);
  expect(s.peakW).toBe(450);
  expect(s.surgeW).toBe(750);
  expect(s.inverterKVA).toBe(1);
  expect(s.batteryKWh).toBe(5);
  expect(s.panelCount).toBe(3);
  expect(s.panelW).toBe(1650);
});

test("more sun means fewer panels", () => {
  expect(sizeSystem(shop, 6.0).panelCount).toBeLessThan(sizeSystem(shop, 4.5).panelCount);
});

test("rounds past the standard list for huge loads", () => {
  expect(roundToSize(23, [2.5, 5, 7.5, 10, 15, 20], 5)).toBe(25);
  expect(roundToSize(12.2, [1, 1.5, 2, 3, 3.5, 5, 7.5, 10], 1)).toBe(13);
});

test("empty list gives zero system", () => {
  const s = sizeSystem([], 5);
  expect(s.panelCount).toBe(0);
  expect(s.inverterKVA).toBe(0);
  expect(s.batteryKWh).toBe(0);
});
