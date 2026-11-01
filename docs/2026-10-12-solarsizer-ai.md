# SolarSizer AI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A web app where a user types their appliances in plain words, picks a city and enters weekly generator fuel spend, and gets a right-sized solar system (inverter, battery, panels), a naira cost, and a payback date.

**Architecture:** One Next.js app. Two server routes keep secrets and network calls on the server: `/api/parse` (text to appliance JSON via the NVIDIA API) and `/api/sun` (peak sun hours from NASA POWER). All sizing, pricing and payback math runs in pure TypeScript functions in `lib/`, called in the browser, so editing the appliance table recalculates instantly with no API call. The AI only extracts data; it never calculates.

**Tech Stack:** Next.js (App Router) + TypeScript + Tailwind, `openai` npm SDK pointed at NVIDIA's OpenAI-compatible endpoint, `zod`, Vitest, NASA POWER API (no key), Vercel.

**Spec:** `video-projects/solarsizer-explainer/BRIEF.md` (script sections 3–6 define the product) plus the decisions in this plan's Global Constraints.

## Before kickoff: accounts and keys (no code)

Hackathon rule: research and accounts are allowed before Oct 30, 2026; all code is written inside the 48-hour window. Do these steps before kickoff.

**1. NVIDIA API key (the only key this project needs)**
1. Go to https://build.nvidia.com and click **Login**. Sign up with email (this creates a free NVIDIA Developer Program account). Verify your email.
2. Open a model page, for example https://build.nvidia.com/meta/llama-3_3-70b-instruct.
3. Click **Get API Key** (or "View Code", then "Generate API Key"). Copy the key. It starts with `nvapi-`.
4. Store it in a password manager. Never paste it in code, chat, screenshots or GitHub.
5. Test it from a terminal (replace the key):
   ```bash
   curl https://integrate.api.nvidia.com/v1/chat/completions -H "Authorization: Bearer nvapi-YOUR_KEY" -H "Content-Type: application/json" -d "{\"model\":\"meta/llama-3.3-70b-instruct\",\"messages\":[{\"role\":\"user\",\"content\":\"Say OK\"}],\"max_tokens\":5}"
   ```
   Expected: JSON with `"choices"` and the text `OK`.
6. Free tier limit is community-reported at about 40 requests per minute per account. The app makes one call per "Size my system" click, so this is enough for a demo. Do not load-test against it.

**2. NASA POWER (no key)**
Test once in a browser: `https://power.larc.nasa.gov/api/temporal/climatology/point?parameters=ALLSKY_SFC_SW_DWN&community=RE&longitude=3.38&latitude=6.52&format=JSON`. Expected: JSON containing `"ALLSKY_SFC_SW_DWN"` with an `"ANN"` value near 4–5.

**3. GitHub account** (for the repo). **4. Vercel account** (https://vercel.com, sign in with GitHub, free Hobby plan). No keys to copy; Vercel reads the repo.

**5. Price research (allowed before kickoff):** collect current Lagos retail prices for a 1 kVA inverter, a 5 kWh lithium battery, a 550 W panel and a typical installation. You paste them into `lib/prices.json` in Task 2.

## Global Constraints

- Node.js 20 or later.
- Environment variables: `NVIDIA_API_KEY` (required, server only, never prefixed `NEXT_PUBLIC_`), `NVIDIA_MODEL` (optional, default `meta/llama-3.3-70b-instruct`).
- NVIDIA base URL: `https://integrate.api.nvidia.com/v1`. Call settings: `temperature: 0`, `max_tokens: 800`.
- The AI never produces watts totals, sizes, costs or payback. Only `lib/` functions do math.
- Sizing constants (exact): inverter safety factor `1.25`; motor surge multiplier `3`; inverter surge rating `2 ×` continuous; power factor `0.8`; night share of daily energy `0.5`; autonomy `1` day; battery depth of discharge `0.8`; battery efficiency `0.9`; system derate `0.75`; panel size `550` W.
- Standard sizes: inverter kVA `[1, 1.5, 2, 3, 3.5, 5, 7.5, 10]`, above 10 round up to the next whole kVA. Battery kWh `[2.5, 5, 7.5, 10, 15, 20]`, above 20 round up to the next multiple of 5.
- Currency for v1: NGN (₦). Monthly fuel = weekly × 52 ÷ 12.
- Text input max 500 characters. Appliance limits: name 1–60 chars, watts 1–5000, hours 0–24, qty integer 1–50.
- Every number shown that comes from `prices.json` or fallback sun hours is labelled "estimate".
- Commit after every task. Repo name: `solarsizer-ai`.

## Review Focus

1. **AI returns prose, code fences or broken JSON.** Expected: the app strips fences, retries once, then shows "Could not read your appliances, try listing them with commas" instead of crashing. Test in Task 4.
2. **AI returns absurd values** (watts 50000, hours 30). Expected: rejected by the schema; the user can fix rows in the editable table. Test in Task 4.
3. **Weekly fuel is 0, empty or negative.** Expected: payback shows "Enter your fuel spend to see payback", no `Infinity` or `NaN`. Test in Task 2.
4. **NASA POWER down, slow or returns -999.** Expected: city fallback sun hours used, labelled "estimate", within 5 s. Test in Task 3.
5. **Very large load** (a hotel's list). Expected: sizes round up past the standard list instead of returning undefined. Test in Task 1.

---

### Task 1: Scaffold + sizing engine

**Files:**
- Create: project via `create-next-app`, `vitest.config.ts`, `lib/types.ts`, `lib/sizing.ts`
- Test: `lib/sizing.test.ts`

**Interfaces:**
- Produces:
  - `type Appliance = { name: string; watts: number; hours: number; qty: number; motor: boolean }`
  - `type SystemSize = { dailyWh: number; peakW: number; surgeW: number; inverterKVA: number; batteryKWh: number; panelCount: number; panelW: number }`
  - `sizeSystem(appliances: Appliance[], sunHours: number): SystemSize`
  - `roundToSize(value: number, sizes: number[], step: number): number`

- [ ] **Step 1: Scaffold (only after kickoff, Oct 30)**

Run: `npx create-next-app@latest solarsizer-ai --typescript --tailwind --eslint --app --use-npm --import-alias "@/*" --yes`, then `cd solarsizer-ai && npm i zod openai && npm i -D vitest`. Add `"test": "vitest run"` to `package.json` scripts. Copy this plan into `docs/`. Create `.env.local` with `NVIDIA_API_KEY=` and confirm `.env*` is in `.gitignore`.

- [ ] **Step 2: Write the failing tests** in `lib/sizing.test.ts`

```ts
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
  expect(sizeSystem([], 5).panelCount).toBe(0);
});
```

- [ ] **Step 3: Run tests, expect FAIL**

Run: `npm test` — Expected: FAIL, `sizeSystem` not exported.

- [ ] **Step 4: Implement `sizeSystem` and `roundToSize` in `lib/sizing.ts`**

Formulas (constants from Global Constraints):
- `dailyWh = Σ watts × hours × qty`; `peakW = Σ watts × qty`; `surgeW = Σ watts × qty × (motor ? 3 : 1)`
- `inverterW = max(peakW × 1.25, surgeW ÷ 2)`; `inverterKVA = roundToSize(inverterW ÷ 0.8 ÷ 1000, inverterSizes, 1)`
- `batteryKWh = roundToSize(dailyWh × 0.5 × 1 ÷ (0.8 × 0.9) ÷ 1000, batterySizes, 5)`
- `panelCount = ceil(dailyWh ÷ (sunHours × 0.75) ÷ 550)`; `panelW = panelCount × 550`
- `roundToSize`: smallest list entry ≥ value; if none, `ceil(value / step) × step`. Zero load returns 0 for every size.

- [ ] **Step 5: Run tests, expect PASS** — `npm test`

- [ ] **Step 6: Commit** — `git init && git add -A && git commit -m "feat: scaffold app and sizing engine"`

---

### Task 2: Prices, cost and payback

**Files:**
- Create: `lib/prices.json`, `lib/pricing.ts`
- Test: `lib/pricing.test.ts`

**Interfaces:**
- Consumes: `SystemSize` (Task 1)
- Produces:
  - `type Quote = { inverter: number; battery: number; panels: number; install: number; total: number }`
  - `priceSystem(size: SystemSize): Quote`
  - `paybackMonths(total: number, weeklyFuel: number): number | null`
  - `paybackSeries(total: number, weeklyFuel: number): { month: number; generator: number; solar: number }[]`

- [ ] **Step 1: Create `lib/prices.json`** — placeholder values until your research replaces them:
`{ "currency": "NGN", "inverterPerKVA": 250000, "batteryPerKWh": 300000, "panel550W": 160000, "installFlat": 200000 }`

- [ ] **Step 2: Write the failing tests** in `lib/pricing.test.ts`

```ts
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
```

- [ ] **Step 3: Run tests, expect FAIL** — `npm test`

- [ ] **Step 4: Implement in `lib/pricing.ts`** — `paybackMonths = ceil(total ÷ (weeklyFuel × 52 ÷ 12))`, null when `weeklyFuel` is not a finite number > 0. Series months `0..max(36, payback + 6)`, generator = month × monthly fuel, solar = total (flat). If payback is null, return months 0–36 with generator 0.

- [ ] **Step 5: Run tests, expect PASS** — `npm test`

- [ ] **Step 6: Commit** — `git commit -am "feat: pricing and payback"` (add new files first with `git add lib`)

---

### Task 3: Cities + NASA sun data

**Files:**
- Create: `lib/cities.ts`, `lib/sun.ts`, `app/api/sun/route.ts`
- Test: `lib/sun.test.ts`

**Interfaces:**
- Produces:
  - `type City = { id: string; name: string; lat: number; lon: number; fallbackSunHours: number }`; `CITIES: City[]`
  - `parsePowerResponse(json: unknown): number | null`
  - `getSunHours(city: City, fetchFn?: typeof fetch): Promise<{ sunHours: number; source: "nasa" | "estimate" }>`
  - `GET /api/sun?city=<id>` → `{ sunHours: number, source: "nasa" | "estimate" }`, 400 for unknown city id

- [ ] **Step 1: Create `lib/cities.ts`** with exactly these (id, name, lat, lon, fallbackSunHours):
`lagos 6.52 3.38 4.5`, `abuja 9.08 7.40 5.5`, `kano 12.00 8.52 6.0`, `port-harcourt 4.82 7.03 4.3`, `ibadan 7.38 3.95 4.8`, `enugu 6.45 7.51 4.9`, `kaduna 10.52 7.44 5.8`, `maiduguri 11.85 13.16 6.2`, `nairobi -1.29 36.82 5.5`, `accra 5.60 -0.19 4.8`.

- [ ] **Step 2: Write the failing tests** in `lib/sun.test.ts`

```ts
const ok = { properties: { parameter: { ALLSKY_SFC_SW_DWN: { ANN: 4.71 } } } };
test("reads annual value", () => expect(parsePowerResponse(ok)).toBe(4.71));
test("rejects -999 and junk", () => {
  expect(parsePowerResponse({ properties: { parameter: { ALLSKY_SFC_SW_DWN: { ANN: -999 } } } })).toBeNull();
  expect(parsePowerResponse("oops")).toBeNull();
});
test("falls back to estimate when fetch fails", async () => {
  const lagos = CITIES.find(c => c.id === "lagos")!;
  const r = await getSunHours(lagos, async () => { throw new Error("down"); });
  expect(r).toEqual({ sunHours: 4.5, source: "estimate" });
});
```

- [ ] **Step 3: Run tests, expect FAIL** — `npm test`

- [ ] **Step 4: Implement `lib/sun.ts` and the route** — URL: `https://power.larc.nasa.gov/api/temporal/climatology/point?parameters=ALLSKY_SFC_SW_DWN&community=RE&longitude=${lon}&latitude=${lat}&format=JSON`. Abort after 5000 ms (`AbortSignal.timeout(5000)`). Valid value range 1–9; anything else → fallback. Route caches with `next: { revalidate: 86400 }`.

- [ ] **Step 5: Run tests, expect PASS**, then `npm run dev` and open `http://localhost:3000/api/sun?city=kano` — Expected: `{"sunHours":<about 5.5–6.5>,"source":"nasa"}`.

- [ ] **Step 6: Commit** — `git add -A && git commit -m "feat: NASA POWER sun hours with fallback"`

---

### Task 4: AI appliance parsing (NVIDIA)

**Files:**
- Create: `lib/nvidia.ts`, `lib/parseAppliances.ts`, `app/api/parse/route.ts`
- Test: `lib/parseAppliances.test.ts`

**Interfaces:**
- Consumes: `Appliance` (Task 1)
- Produces:
  - `type Complete = (system: string, user: string) => Promise<string>`
  - `nvidiaComplete: Complete` (in `lib/nvidia.ts`)
  - `extractJson(raw: string): unknown`
  - `parseAppliances(text: string, complete: Complete): Promise<Appliance[]>` — throws `ParseError` after one retry
  - `POST /api/parse` body `{ text: string }` → 200 `{ appliances: Appliance[] }`; 400 empty or > 500 chars; 422 `{ error: "Could not read your appliances, try listing them with commas" }`; 429 `{ error: "AI is busy, try again in a minute" }` when NVIDIA returns 429

- [ ] **Step 1: Write the failing tests** in `lib/parseAppliances.test.ts`

```ts
const good = '[{"name":"freezer","watts":150,"hours":10,"qty":1,"motor":true}]';
test("strips code fences", () => {
  expect(extractJson("```json\n" + good + "\n```")).toEqual(JSON.parse(good));
});
test("finds the array inside prose", () => {
  expect(extractJson("Sure! Here you go: " + good + " Hope it helps")).toEqual(JSON.parse(good));
});
test("retries once then succeeds", async () => {
  let calls = 0;
  const r = await parseAppliances("1 freezer", async () => (++calls === 1 ? "no json here" : good));
  expect(calls).toBe(2);
  expect(r[0].name).toBe("freezer");
});
test("rejects absurd values and fails after retry", async () => {
  const bad = '[{"name":"AC","watts":50000,"hours":30,"qty":1,"motor":true}]';
  await expect(parseAppliances("big AC", async () => bad)).rejects.toThrow(ParseError);
});
test("motor defaults to false", async () => {
  const r = await parseAppliances("tv", async () => '[{"name":"TV","watts":100,"hours":6,"qty":1}]');
  expect(r[0].motor).toBe(false);
});
```

- [ ] **Step 2: Run tests, expect FAIL** — `npm test`

- [ ] **Step 3: Implement `lib/parseAppliances.ts`** — zod schema with the Global Constraints limits, array min length 1. `extractJson`: remove ``` fences, take substring from first `[` to last `]`, `JSON.parse`. System prompt (exact intent): "Extract household or shop appliances from the user's text. Reply with ONLY a JSON array, no prose. Each item: name (string), watts (typical rated watts for one unit in Nigeria), hours (hours of use per day), qty (integer), motor (true for fridges, freezers, pumps, air conditioners, washing machines). For fridges and freezers use about 10 effective hours. If hours are not stated, use typical daily use."

- [ ] **Step 4: Implement `lib/nvidia.ts`** — `new OpenAI({ apiKey: process.env.NVIDIA_API_KEY, baseURL: "https://integrate.api.nvidia.com/v1" })`, model `process.env.NVIDIA_MODEL ?? "meta/llama-3.3-70b-instruct"`, `temperature: 0`, `max_tokens: 800`. Throw a clear error at call time if the key is missing.

- [ ] **Step 5: Implement `app/api/parse/route.ts`** with the status codes in Interfaces. Detect NVIDIA 429 via the SDK error's `status === 429`.

- [ ] **Step 6: Run tests, expect PASS**, then live check with the dev server:
`curl -X POST http://localhost:3000/api/parse -H "Content-Type: application/json" -d "{\"text\":\"one freezer, two standing fans, a TV and six bulbs\"}"` — Expected: 200 with 4 appliances, freezer `motor: true`.

- [ ] **Step 7: Commit** — `git add -A && git commit -m "feat: NVIDIA appliance parsing"`

---

### Task 5: User interface

**Files:**
- Modify: `app/page.tsx`, `app/layout.tsx` (title "SolarSizer AI")
- Create: `components/ApplianceTable.tsx`, `components/ResultCards.tsx`, `components/PaybackChart.tsx`

**Interfaces:**
- Consumes: `/api/parse`, `/api/sun`, `sizeSystem`, `priceSystem`, `paybackMonths`, `paybackSeries`, `CITIES`
- Produces: the demo screen

- [ ] **Step 1: Build `app/page.tsx`** (client component) — textarea (maxLength 500, placeholder "1 freezer, 2 standing fans, a TV and 6 bulbs"), city `<select>` from `CITIES`, number input "Weekly petrol spend (₦)", button "Size my system". On click: call `/api/parse` and `/api/sun` in parallel (`Promise.all`), store appliances, sunHours, source. Show API `error` strings inline. Disable button while loading.

- [ ] **Step 2: Build `ApplianceTable`** — editable rows (name, watts, hours, qty, motor checkbox), delete row, "Add appliance" row. Every edit recomputes results in the browser through `sizeSystem` and `priceSystem`; no API call.

- [ ] **Step 3: Build `ResultCards`** — inverter kVA, battery kWh, panels "`count` × 550 W", total ₦ (format with `Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 })`), payback months or "Enter your fuel spend to see payback". Show "Sun hours: X (NASA)" or "X (estimate)". Footer note: "Prices are estimates. Get a quote from a certified installer."

- [ ] **Step 4: Build `PaybackChart`** — inline SVG, no chart library: red polyline for generator, green for solar, dashed vertical line at payback month, axis labels "months" and "₦ spent".

- [ ] **Step 5: Verify in browser** — `npm run dev`, use the demo sentence, Lagos, 25000. Expected: 1 kVA, 5 kWh, 3 × 550 W, ₦2,430,000 (with placeholder prices), payback 23 months. Change city to Kano: panel count drops or stays, never rises. Set fuel to 0: no NaN anywhere. Check width 375 px (phone): no horizontal scroll.

- [ ] **Step 6: Commit** — `git add -A && git commit -m "feat: SolarSizer UI"`

---

### Task 6: Deploy, README, demo

**Files:**
- Create: `README.md`

- [ ] **Step 1: Push to GitHub** — create empty repo `solarsizer-ai`, then `git remote add origin <url> && git push -u origin main`. Confirm `.env.local` is not in the repo.

- [ ] **Step 2: Deploy on Vercel** — New Project → import repo → Environment Variables: `NVIDIA_API_KEY` = your key (Production + Preview) → Deploy. Expected: live URL; the demo sentence works on it.

- [ ] **Step 3: Write `README.md`** — problem (2 lines), how it works (4 steps), formulas and constants, data sources with credit (NASA POWER, NVIDIA API model name, price source and date), run locally (`npm i`, `.env.local`, `npm run dev`, `npm test`), "Prices are estimates" note. Hackathon rule: credit open tools and datasets.

- [ ] **Step 4: Record the demo (2 min)** — Mama Ngozi's shop story: type the sentence → table → edit one row live → switch Lagos to Kano → payback chart. End on Three A's: Access + Affordability; scales to Kenya and Ghana by changing currency and price table.

- [ ] **Step 5: Commit and submit** — `git add README.md && git commit -m "docs: README" && git push`. Submit repo URL, live URL and video before the deadline.

---

## 48-hour schedule

| Hours | Work |
|-------|------|
| 0–2 | Task 1 Step 1 (scaffold), keys already tested |
| 2–10 | Task 1 + Task 2 (engine, pricing, tests) |
| 10–18 | Task 3 + Task 4 (sun data, NVIDIA parsing) |
| 18–30 | Task 5 (UI) |
| 30–36 | Deploy early (Task 6 Steps 1–2), fix what breaks on Vercel |
| 36–44 | Polish, real prices, README |
| 44–48 | Record demo, submit. Buffer for problems. |

Stretch goals (only if ahead): WhatsApp share button (`https://wa.me/?text=` link, no API), Kenya currency switch, outage-hours input for battery autonomy (the third "A", Availability).
