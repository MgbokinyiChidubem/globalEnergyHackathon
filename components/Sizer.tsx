"use client";

import { useState, type ReactNode } from "react";
import ApplianceTable from "@/components/ApplianceTable";
import ResultCards from "@/components/ResultCards";
import Skyline from "@/components/Skyline";
import { CITIES } from "@/lib/cities";
import { DEFAULT_PETROL_PRICE } from "@/lib/impact";
import { fetchSun } from "@/lib/sunClient";
import type { SunResult } from "@/lib/sun";
import type { Appliance } from "@/lib/types";

const DEMO = "1 freezer, 2 standing fans, a TV and 6 bulbs";

export default function Sizer({ intro }: { intro: ReactNode }) {
  const [text, setText] = useState("");
  const [cityId, setCityId] = useState("lagos");
  const [fuel, setFuel] = useState("");
  const [petrolPrice, setPetrolPrice] = useState(String(DEFAULT_PETROL_PRICE));
  const [appliances, setAppliances] = useState<Appliance[] | null>(null);
  const [sun, setSun] = useState<SunResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadSun(id: string) {
    setSun(await fetchSun(id));
  }

  async function size() {
    setLoading(true);
    setError("");
    try {
      const [parseRes] = await Promise.all([
        fetch("/api/parse", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text }) }),
        loadSun(cityId),
      ]);
      const data = await parseRes.json();
      if (!parseRes.ok) {
        setError(data.error ?? "Something went wrong. Try again.");
        setAppliances((a) => a ?? []); // still allow manual entry
      } else {
        setAppliances(data.appliances);
        requestAnimationFrame(() => document.getElementById("results")?.scrollIntoView({ block: "start" }));
      }
    } catch {
      setError(navigator.onLine === false
        ? "You are offline, so the AI cannot read your list. Enter your appliances by hand below."
        : "No connection. Check your internet and try again, or enter your appliances by hand below.");
      setAppliances((a) => a ?? []);
    } finally {
      setLoading(false);
    }
  }

  async function enterByHand() {
    setError("");
    setAppliances((a) => (a && a.length ? a : [{ name: "Appliance", watts: 100, hours: 4, qty: 1, motor: false }]));
    await loadSun(cityId);
    requestAnimationFrame(() => document.getElementById("results")?.scrollIntoView({ block: "start" }));
  }

  const cityName = CITIES.find((c) => c.id === cityId)?.name ?? "";

  return (
    <>
      <div className="relative">
        <div aria-hidden className="sun pointer-events-none absolute bottom-[40px] left-1/2 h-[520px] w-[520px] -ml-[260px] rounded-full sm:bottom-[60px] sm:h-[760px] sm:w-[760px] sm:-ml-[380px] lg:left-[72%]" />
        <section className="relative mx-auto grid max-w-6xl grid-cols-1 gap-10 px-5 pb-10 pt-6 sm:px-8 lg:grid-cols-12 lg:gap-14 lg:pt-14">
          <div className="lg:col-span-6 lg:pt-6">{intro}</div>
          <div className="lg:col-span-6">
            <div className="rounded-[28px] bg-night/85 p-6 ring-1 ring-line backdrop-blur-md sm:p-8">
              <label className="block">
                <span className="mb-2 block font-display text-xl font-bold">What do you want to power?</span>
                <textarea className="w-full px-4 py-3 text-lg leading-snug" rows={3} maxLength={500} placeholder={DEMO}
                  value={text} onChange={(e) => setText(e.target.value)} />
              </label>
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block font-bold">City</span>
                  <select className="w-full px-3 py-3" value={cityId}
                    onChange={(e) => { setCityId(e.target.value); if (appliances) loadSun(e.target.value); }}>
                    {CITIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-2 block font-bold">Petrol you buy each week (₦)</span>
                  <input className="w-full px-3 py-3" type="number" min={0} inputMode="numeric" placeholder="25000"
                    value={fuel} onChange={(e) => setFuel(e.target.value)} />
                </label>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
                <button className="rounded-full bg-amber px-7 py-3.5 font-display text-lg font-bold text-deep shadow-[0_10px_30px_-8px_rgba(255,194,60,0.7)] transition hover:-translate-y-0.5 hover:bg-[#ffd166] disabled:translate-y-0 disabled:opacity-45 disabled:shadow-none"
                  disabled={loading || !text.trim()} onClick={size}>
                  {loading ? "Reading your list…" : "Size my system"}
                </button>
                <button className="text-muted underline decoration-line decoration-2 underline-offset-4 hover:text-foreground"
                  onClick={() => { setText(DEMO); setFuel("25000"); }}>
                  Fill in an example shop
                </button>
                <button className="text-muted underline decoration-line decoration-2 underline-offset-4 hover:text-foreground"
                  onClick={enterByHand}>
                  Enter appliances by hand
                </button>
              </div>
              <p className="mt-4 min-h-6 text-sm text-muted" aria-live="polite">
                {loading ? "The AI is reading your list. This takes about 10 seconds." : ""}
              </p>
              {error && <p role="alert" className="text-bad">{error}</p>}
            </div>
          </div>
        </section>
        <Skyline />
      </div>

      <div className="day">
        {appliances && (
          <section id="results" className="mx-auto max-w-6xl scroll-mt-4 px-5 pb-6 pt-14 sm:px-8">
            <h2 className="font-display text-[clamp(2rem,4vw,3rem)] font-extrabold tracking-tight">
              Your system{cityName ? ` for ${cityName}` : ""}
            </h2>
            <div className="mt-8 space-y-6">
              {sun && (
                <ResultCards appliances={appliances} sunHours={sun.sunHours} source={sun.source} weeklyFuel={Number(fuel)}
                  city={cityName} petrolPrice={petrolPrice} onPetrolPriceChange={setPetrolPrice} />
              )}
              <ApplianceTable appliances={appliances} onChange={setAppliances} />
            </div>
          </section>
        )}
      </div>
    </>
  );
}
