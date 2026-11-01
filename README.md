# SolarSizer AI

**Right-size your solar. Kill the generator bill.**

Live app: https://solarsizer-ai.vercel.app

Global Energy Hackathon 2026. Track 2, Digital Solutions & AI. Brief 7, Replace diesel for productive use.

## Problem

Millions of Nigerian homes and shops run petrol generators because the grid fails daily. Solar is the answer, but buying it is guesswork: installers quote wildly different systems, undersized systems die before midnight, oversized ones waste money, and nobody shows when the system pays for itself.

## How it works

1. **AI parse.** You describe what you own in plain words ("1 freezer, 2 standing fans, a TV and 6 bulbs"). An LLM on the NVIDIA API turns that into an appliance list (watts, hours, quantity, motor). You can edit every row.
2. **Sizing engine.** Pure TypeScript, unit-tested. The AI never does the math.
3. **Sun data.** Annual peak sun hours for your city from NASA POWER, so Kano and Lagos get different panel counts.
4. **Price and payback.** System cost from a local price table, compared with your weekly petrol spend to get the payback month.
5. **Brief 7 impact.** Litres of petrol and tonnes of CO2 avoided per year (2.31 kg CO2 per litre), yearly petrol saving, 5-year net saving.
6. **Affordability.** Monthly payment with example pay-as-you-go terms (10% deposit, 24% a year, 24 months), next to today's petrol bill.
7. **Low connectivity.** Share the result on WhatsApp as plain text. Works offline after the first visit (service worker); enter appliances by hand without the AI.

Free for shops and homes. The business model: installers and pay-as-you-go providers pay per qualified sizing request.

Submission drafts: `docs/one-page-summary.md`, `docs/pitch-deck-outline.md`, `docs/demo-script.md`, `docs/disclosure.md`. Prior work and sprint work: `CHANGELOG.md`.

### Formulas

| Value | Formula |
|-------|---------|
| Daily energy | Σ watts × hours × qty |
| Inverter | max(peak W × 1.25, surge W ÷ 2) ÷ 0.8 power factor, rounded up to a standard kVA |
| Surge | motor loads (fridges, freezers, pumps, AC) count 3× |
| Battery | daily Wh × 0.5 night share ÷ (0.8 depth of discharge × 0.9 efficiency), rounded up to a standard kWh |
| Panels | daily Wh ÷ (sun hours × 0.75 derate) ÷ 550 W, rounded up |
| Payback | total cost ÷ (weekly fuel × 52 ÷ 12), in months |

## Data sources and credits

- **AI:** `nvidia/nemotron-3.5-lightning-30b-a3b` (default, thinking off) via NVIDIA API Catalog (build.nvidia.com), OpenAI-compatible endpoint. Meta Llama models are geo-blocked in Nigeria; run `node scripts/check-models.mjs` to see which models answer from your location, then set `NVIDIA_MODEL`.
- **Sun hours:** NASA POWER climatology API, parameter `ALLSKY_SFC_SW_DWN` (annual mean). Falls back to an approximate value per city if NASA is unreachable, labelled "estimate".
- **Prices:** `lib/prices.json`. Placeholder Lagos retail estimates; replace with researched prices and their date before demo.

## Run locally

```bash
npm install
cp .env.example .env.local   # then paste your NVIDIA key into .env.local
npm run dev                  # http://localhost:3000
npm test                     # unit tests
python e2e/test_landing.py   # browser tests (dev server on :3023, needs Playwright)
python e2e/test_offline.py   # offline tests (production server on :3025)
```

Get a free NVIDIA key at https://build.nvidia.com (sign in, open a model page, "Get API Key"). Keys start with `nvapi-`. Never commit `.env.local`.

## Deploy

Import the repo on Vercel and set the environment variable `NVIDIA_API_KEY`. Optional: `NVIDIA_MODEL` to switch models.

## Limits

Prices and sizes are estimates for planning, not an installer's quote. The free NVIDIA tier is rate-limited (about 40 requests per minute reported by developers); the app makes one AI call per "Size my system" click.
