/** kg CO2 per litre of petrol burned (IPCC 2006 default for motor gasoline, about 2.3). */
export const CO2_KG_PER_LITRE = 2.31;
/** Default Lagos pump price, ₦ per litre. Editable in the UI; update before demo. */
export const DEFAULT_PETROL_PRICE = 1000;

export type FuelImpact = { litresPerYear: number; co2TonnesPerYear: number; fuelCostPerYear: number; netSavings5Years: number };

const valid = (n: number) => Number.isFinite(n) && n > 0;

/**
 * Brief 7 metric. Assumes the solar system fully replaces generator petrol.
 * netSavings5Years ignores maintenance and battery replacement (lithium lasts roughly 8–10 years).
 */
export function fuelImpact(weeklyFuel: number, petrolPricePerLitre: number, systemCost: number): FuelImpact {
  if (!valid(weeklyFuel) || !valid(petrolPricePerLitre)) {
    return { litresPerYear: 0, co2TonnesPerYear: 0, fuelCostPerYear: 0, netSavings5Years: 0 };
  }
  const fuelCostPerYear = weeklyFuel * 52;
  const litresPerYear = fuelCostPerYear / petrolPricePerLitre;
  return {
    litresPerYear,
    co2TonnesPerYear: (litresPerYear * CO2_KG_PER_LITRE) / 1000,
    fuelCostPerYear,
    netSavings5Years: fuelCostPerYear * 5 - systemCost,
  };
}

export type FinanceTerms = { depositShare: number; annualRate: number; months: number };
/** Example pay-as-you-go terms, shown as an example, not an offer. */
export const EXAMPLE_TERMS: FinanceTerms = { depositShare: 0.1, annualRate: 0.24, months: 24 };

export function monthlyInstalment(total: number, terms: FinanceTerms = EXAMPLE_TERMS) {
  const deposit = Math.round(total * terms.depositShare);
  const principal = total - deposit;
  const r = terms.annualRate / 12;
  const monthly = principal <= 0 ? 0 : r === 0 ? principal / terms.months : (principal * r) / (1 - (1 + r) ** -terms.months);
  return { deposit, monthly: Math.round(monthly), months: terms.months };
}
