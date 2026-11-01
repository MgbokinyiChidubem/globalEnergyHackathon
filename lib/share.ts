const naira = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 });
const whole = new Intl.NumberFormat("en-NG", { maximumFractionDigits: 0 });

export type ShareInput = {
  city: string;
  inverterKVA: number;
  batteryKWh: number;
  panelCount: number;
  panelW: number;
  total: number;
  payback: number | null;
  litresPerYear: number;
  co2TonnesPerYear: number;
};

/** Plain text that reads well in WhatsApp or SMS on any phone. Contains no personal data. */
export function buildShareText(r: ShareInput): string {
  const lines = [
    `SolarSizer AI result for ${r.city}:`,
    `${r.inverterKVA} kVA inverter, ${r.batteryKWh} kWh battery, ${r.panelCount} × ${r.panelW} W panels.`,
    `Estimated cost: ${naira.format(r.total)}.`,
  ];
  if (r.payback !== null) lines.push(`Pays for itself in about ${r.payback} months against my generator petrol.`);
  if (r.litresPerYear > 0) {
    lines.push(`Avoids about ${whole.format(r.litresPerYear)} litres of petrol and ${r.co2TonnesPerYear.toFixed(1)} tonnes of CO2 a year.`);
  }
  lines.push("Can you quote this system?");
  return lines.join("\n");
}

export const whatsappUrl = (text: string) => `https://wa.me/?text=${encodeURIComponent(text)}`;
