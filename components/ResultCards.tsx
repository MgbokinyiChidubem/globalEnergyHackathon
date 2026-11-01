"use client";

import { useState } from "react";
import { EXAMPLE_TERMS, fuelImpact, monthlyInstalment } from "@/lib/impact";
import { paybackMonths, paybackSeries, priceSystem } from "@/lib/pricing";
import { buildShareText, whatsappUrl } from "@/lib/share";
import { PANEL_W, sizeSystem } from "@/lib/sizing";
import type { Appliance } from "@/lib/types";
import PaybackChart from "./PaybackChart";

const naira = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 });
const whole = new Intl.NumberFormat("en-NG", { maximumFractionDigits: 0 });
const CARD = "rounded-3xl bg-panel p-6 shadow-[0_1px_0_#ead9bd,0_20px_40px_-24px_rgba(120,80,20,0.35)]";

type Props = {
  appliances: Appliance[];
  sunHours: number;
  source: "nasa" | "estimate";
  weeklyFuel: number;
  city: string;
  petrolPrice: string;
  onPetrolPriceChange: (v: string) => void;
};

function ShareBar({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className={`${CARD} flex flex-wrap items-center justify-between gap-4`}>
      <div>
        <h3 className="font-display text-xl font-bold">Send this to an installer</h3>
        <p className="mt-1 text-muted">Ask for a quote on this exact system, and compare every quote against it.</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <a href={whatsappUrl(text)} target="_blank" rel="noopener noreferrer"
          className="rounded-full bg-[#178a5c] px-5 py-3 font-display font-bold text-white hover:bg-[#12704a]">
          Share on WhatsApp
        </a>
        <button className="rounded-full px-5 py-3 font-display font-bold ring-2 ring-line hover:bg-paper"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(text);
              setCopied(true);
            } catch {
              setCopied(false);
            }
          }}>
          {copied ? "Copied" : "Copy as text"}
        </button>
      </div>
    </div>
  );
}

function Spec({ value, unit, label }: { value: string; unit: string; label: string }) {
  return (
    <div className="py-5 sm:px-6 sm:first:pl-0">
      <div className="font-display text-5xl font-extrabold tracking-tight">
        {value}
        <span className="ml-1.5 text-2xl font-bold text-muted">{unit}</span>
      </div>
      <div className="mt-1 text-lg text-muted">{label}</div>
    </div>
  );
}

export default function ResultCards({ appliances, sunHours, source, weeklyFuel, city, petrolPrice, onPetrolPriceChange }: Props) {
  const size = sizeSystem(appliances, sunHours);
  const quote = priceSystem(size);
  const payback = paybackMonths(quote.total, weeklyFuel);
  const impact = fuelImpact(weeklyFuel, Number(petrolPrice), quote.total);
  const plan = monthlyInstalment(quote.total);
  const monthlyFuel = Number.isFinite(weeklyFuel) && weeklyFuel > 0 ? (weeklyFuel * 52) / 12 : 0;

  if (size.dailyWh === 0) {
    return <p className="text-lg text-muted">Add at least one appliance below to see your system.</p>;
  }

  const lines = [
    [`Inverter, ${size.inverterKVA} kVA`, quote.inverter],
    [`Battery, ${size.batteryKWh} kWh`, quote.battery],
    [`Panels, ${size.panelCount} × ${PANEL_W} W`, quote.panels],
    ["Installation and cabling", quote.install],
  ] as const;

  return (
    <section className="space-y-6" aria-live="polite">
      <p className="max-w-[40rem] font-display text-[clamp(1.6rem,3vw,2.4rem)] font-bold leading-tight">
        {payback === null
          ? "Enter how much petrol you buy each week to see when solar pays for itself."
          : `Solar pays for itself in about ${payback} months, then the petrol money stays in your pocket.`}
      </p>

      <div className="grid grid-cols-1 divide-y divide-line border-y border-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <Spec value={String(size.inverterKVA)} unit="kVA" label="Inverter" />
        <Spec value={String(size.batteryKWh)} unit="kWh" label="Battery" />
        <Spec value={String(size.panelCount)} unit={`× ${PANEL_W} W`} label="Solar panels" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className={`${CARD} lg:col-span-2`}>
          <h3 className="font-display text-xl font-bold">Estimated cost</h3>
          <dl className="mt-4 space-y-2.5">
            {lines.map(([label, amount]) => (
              <div key={label} className="flex justify-between gap-4">
                <dt className="text-muted">{label}</dt>
                <dd>{naira.format(amount)}</dd>
              </div>
            ))}
            <div className="flex justify-between gap-4 border-t border-line pt-3 text-xl font-bold">
              <dt>Total</dt>
              <dd>{naira.format(quote.total)}</dd>
            </div>
          </dl>
        </div>
        <div className={`${CARD} lg:col-span-3`}>
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h3 className="font-display text-xl font-bold">Money spent over time</h3>
            <div className="flex gap-4 text-sm">
              <span className="flex items-center gap-1.5"><span className="h-1 w-5 rounded bg-gen" /> Generator petrol</span>
              <span className="flex items-center gap-1.5"><span className="h-1 w-5 rounded bg-solar" /> Solar system</span>
            </div>
          </div>
          <PaybackChart series={paybackSeries(quote.total, weeklyFuel)} payback={payback} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className={CARD} aria-label="Yearly impact">
          <h3 className="font-display text-xl font-bold">What changes every year</h3>
          {impact.litresPerYear > 0 ? (
            <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 [&>div]:min-w-0">
              <div>
                <dd className="font-display text-[clamp(1.5rem,2.1vw,1.9rem)] font-extrabold leading-tight">{whole.format(impact.litresPerYear)}</dd>
                <dt className="text-muted">litres of petrol not burned</dt>
              </div>
              <div>
                <dd className="font-display text-[clamp(1.5rem,2.1vw,1.9rem)] font-extrabold leading-tight">{impact.co2TonnesPerYear.toFixed(1)} t</dd>
                <dt className="text-muted">CO₂ avoided</dt>
              </div>
              <div className="sm:col-span-2">
                <dd className="font-display text-[clamp(1.5rem,2.1vw,1.9rem)] font-extrabold leading-tight text-ok">{naira.format(impact.fuelCostPerYear)}</dd>
                <dt className="text-muted">petrol money saved</dt>
              </div>
            </dl>
          ) : (
            <p className="mt-3 text-muted">Enter your weekly petrol spend above to see litres, CO₂ and money saved.</p>
          )}
          <label className="mt-5 flex flex-wrap items-center gap-3">
            <span className="text-muted">Petrol price per litre (₦)</span>
            <input className="w-28 px-3 py-1.5" type="number" min={1} inputMode="numeric" value={petrolPrice}
              onChange={(e) => onPetrolPriceChange(e.target.value)} />
          </label>
          {impact.litresPerYear > 0 && (
            <p className="num mt-3 text-muted">
              Over 5 years that is about {naira.format(impact.netSavings5Years)} kept after paying for the system.
            </p>
          )}
        </section>
        <section className={CARD} aria-label="Pay monthly">
          <h3 className="font-display text-xl font-bold">Pay monthly instead</h3>
          <p className="num mt-3 text-lg">
            {naira.format(plan.deposit)} down, then <strong>{naira.format(plan.monthly)} a month</strong> for {plan.months} months.
          </p>
          {monthlyFuel > 0 && (
            <p className="num mt-2 text-lg">
              You spend about {naira.format(monthlyFuel)} a month on petrol today. The instalment is{" "}
              {plan.monthly <= monthlyFuel ? "less than that" : `${naira.format(plan.monthly - monthlyFuel)} more than that`},
              and it stops after {plan.months} months.
            </p>
          )}
          <p className="num mt-3 text-sm text-muted">
            Example pay-as-you-go terms: {EXAMPLE_TERMS.depositShare * 100}% deposit, {EXAMPLE_TERMS.annualRate * 100}% a
            year, {EXAMPLE_TERMS.months} months. Real terms come from the provider.
          </p>
        </section>
      </div>

      <ShareBar text={buildShareText({
        city, inverterKVA: size.inverterKVA, batteryKWh: size.batteryKWh, panelCount: size.panelCount, panelW: PANEL_W,
        total: quote.total, payback, litresPerYear: impact.litresPerYear, co2TonnesPerYear: impact.co2TonnesPerYear,
      })} />

      <p className="num text-muted">
        You use about {(size.dailyWh / 1000).toFixed(1)} kWh a day, with a peak load of {size.peakW} W. {" "}
        {source === "nasa" ? "NASA POWER" : "Our estimate"} gives your city {sunHours.toFixed(1)} sun hours a day. Prices
        are planning estimates, so get a final quote from a certified installer. Savings assume solar replaces your
        generator petrol.
      </p>
    </section>
  );
}
