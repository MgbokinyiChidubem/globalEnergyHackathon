import { expect, test } from "vitest";
import { fuelImpact, monthlyInstalment } from "./impact";
import { buildShareText, whatsappUrl } from "./share";

// Brief 7 metric: cost saved per household and tonnes of CO2 avoided per year.
test("fuelImpact: demo shop, ₦25,000/week at ₦1,000/L", () => {
  const r = fuelImpact(25000, 1000, 2430000);
  expect(r.litresPerYear).toBe(1300);
  expect(r.co2TonnesPerYear).toBeCloseTo(3.003, 3);
  expect(r.fuelCostPerYear).toBe(1300000);
  expect(r.netSavings5Years).toBe(1300000 * 5 - 2430000);
});

test("fuelImpact: no fuel spend or bad petrol price gives zeros, never NaN", () => {
  for (const [fuel, price] of [[0, 1000], [25000, 0], [NaN, 1000], [25000, NaN], [-5, 1000]]) {
    const r = fuelImpact(fuel, price, 2430000);
    expect(r.litresPerYear).toBe(0);
    expect(r.co2TonnesPerYear).toBe(0);
  }
});

// Affordability: pay-as-you-go style instalment compared with today's petrol bill.
test("monthlyInstalment: 10% deposit, 24% APR, 24 months", () => {
  const r = monthlyInstalment(2430000);
  expect(r.deposit).toBe(243000);
  expect(r.months).toBe(24);
  expect(r.monthly).toBeCloseTo(115630, -1);
});

test("monthlyInstalment: zero rate divides evenly; zero total is zero", () => {
  expect(monthlyInstalment(1200000, { annualRate: 0, depositShare: 0, months: 12 }).monthly).toBe(100000);
  expect(monthlyInstalment(0).monthly).toBe(0);
});

test("share text carries the system, cost, payback and impact, and no personal data", () => {
  const text = buildShareText({
    city: "Lagos",
    inverterKVA: 1, batteryKWh: 5, panelCount: 3, panelW: 550,
    total: 2430000, payback: 23, litresPerYear: 1300, co2TonnesPerYear: 3.003,
  });
  expect(text).toContain("Lagos");
  expect(text).toContain("1 kVA inverter");
  expect(text).toContain("5 kWh battery");
  expect(text).toContain("3 × 550 W panels");
  expect(text).toMatch(/₦\s?2,430,000/);
  expect(text).toContain("23 months");
  expect(text).toContain("1,300 litres");
  expect(text).toContain("3.0 tonnes");
});

test("share text without fuel spend omits payback and impact lines", () => {
  const text = buildShareText({
    city: "Kano", inverterKVA: 1, batteryKWh: 2.5, panelCount: 1, panelW: 550,
    total: 1360000, payback: null, litresPerYear: 0, co2TonnesPerYear: 0,
  });
  expect(text).not.toContain("months");
  expect(text).not.toContain("litres");
});

test("whatsappUrl encodes text for wa.me", () => {
  expect(whatsappUrl("a b&c")).toBe("https://wa.me/?text=a%20b%26c");
});
