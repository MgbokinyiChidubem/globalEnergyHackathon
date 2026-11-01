# SolarSizer AI

**Plan a solar system around your appliances and your petrol bill.**

SolarSizer AI helps Nigerian shop owners and households estimate the inverter, battery and solar panels they need, understand the upfront cost, and compare it with running a petrol generator. Describe your appliances in plain language or enter them manually, choose your city, and review an editable estimate before speaking to an installer.

**Live deployment:** [https://solarsizer-ai.vercel.app/](https://solarsizer-ai.vercel.app/)

[Project summary](docs/one-page-summary.md) · [Demo walkthrough](docs/demo-script.md)

Built for **Global Energy Hackathon 2026**, Track 2: Digital Solutions & AI, with a focus on Brief 7: replacing diesel for productive use. The current implementation models **petrol generator** costs and emissions.

## The problem

For a provision shop, barber, tailor or household relying on a generator, moving to solar raises practical questions: What equipment will power these appliances? How much will it cost? How does that compare with the fuel bill?

SolarSizer brings those estimates into one workflow. AI reads the appliance description; TypeScript functions calculate the system size, price and savings.

## Features

- **Editable appliance lists:** AI extracts wattages, daily usage hours, quantities and motor loads from descriptions such as “1 freezer, 2 standing fans, a TV and 6 bulbs.” Every value can be corrected manually.
- **Solar sizing:** estimates inverter capacity, battery storage and the number of 550 W panels, allowing for motor startup surge and system losses.
- **Location-based sunshine:** requests annual average solar irradiance from NASA POWER, with labelled city estimates when the request fails.
- **Cost breakdown:** shows inverter, battery, panels and installation estimates in Nigerian naira.
- **Payback and impact:** compares solar cost with petrol spending and estimates annual petrol savings, litres and CO₂ avoided, and five-year net savings.
- **Illustrative monthly payments:** compares example financing payments with the monthly petrol bill.
- **WhatsApp sharing:** generates a plain-text system summary to copy or send to an installer.
- **Manual and offline use:** manual entry works without an AI key. In production, the cached app supports manual sizing after an initial online visit; AI parsing still needs internet access.

Supported cities: **Lagos, Abuja, Kano, Port Harcourt, Ibadan, Enugu, Kaduna and Maiduguri**.

## How to use it

1. Open the app and select **Fill in an example shop**, or describe your own appliances.
2. Choose a city and enter your weekly petrol spending in naira.
3. Select **Size my system**, or choose **Enter appliances by hand** to skip AI parsing.
4. Correct the appliance table to match your equipment ratings and daily usage.
5. Review the system, cost and savings estimates. Adjust the petrol price per litre, then copy or share the result for a quote.

## Example result

The sizing test fixture uses a 150 W freezer for 10 hours, two 70 W fans for 10 hours, a 100 W TV for 6 hours, and six 10 W bulbs for 6 hours. At **4.5 peak sun hours**, the current code and price table produce:

| Output | Estimate |
| --- | --- |
| Daily energy demand | 3.86 kWh |
| Inverter | 1 kVA |
| Battery | 5 kWh |
| Solar panels | 3 × 550 W, or 1.65 kWp |
| Total system cost | ₦2,430,000 |
| Payback at ₦25,000 petrol spending per week | 23 months |
| Annual petrol spending displaced | ₦1,300,000 |
| Petrol avoided at ₦1,000 per litre | 1,300 litres per year |
| Modelled emissions avoided | About 3.0 tonnes CO₂ per year |

This example uses placeholder equipment prices and assumes full replacement of generator petrol. AI-inferred appliance values and live sunshine data can produce different results.

## How the estimates work

The AI extracts appliance data and Zod validates the response. Electrical and financial calculations run separately in [lib/sizing.ts](lib/sizing.ts), [lib/pricing.ts](lib/pricing.ts) and [lib/impact.ts](lib/impact.ts).

| Calculation | Current model |
| --- | --- |
| Daily energy | Sum of watts × daily hours × quantity, in Wh |
| Peak load | Sum of watts × quantity, assuming simultaneous use |
| Startup surge | Motor appliances count at 3× rated power; other appliances count at 1× |
| Inverter | max(peak W × 1.25, surge W ÷ 2) ÷ 0.8 ÷ 1,000, rounded up to a supported kVA size |
| Battery | Daily Wh × 0.5 night share ÷ (0.8 depth of discharge × 0.9 efficiency) ÷ 1,000, rounded up to a supported kWh size |
| Panel count | Daily Wh ÷ (peak sun hours × 0.75 derate × 550 W), rounded up |
| Payback | System cost ÷ (weekly petrol spending × 52 ÷ 12), rounded up to whole months |
| Annual petrol avoided | Weekly petrol spending × 52 ÷ petrol price per litre |
| Annual CO₂ avoided | Annual litres × 2.31 kg CO₂ per litre ÷ 1,000 |
| Five-year net savings | Five years of petrol spending − upfront system cost |

The illustrative financing model uses a **10% deposit, 24% annual interest and a 24-month term**. It is an example, not a financing offer.

## Technology

| Area | Implementation |
| --- | --- |
| Web app | Next.js App Router, React, TypeScript and Tailwind CSS |
| Appliance parsing | NVIDIA's OpenAI-compatible API, the `openai` client and Zod validation |
| Sunshine data | NASA POWER climatology parameter `ALLSKY_SFC_SW_DWN`, with local fallback values |
| Offline support | Service worker and web app manifest |
| Checks | Vitest unit tests and Python Playwright browser scripts |

## Run locally

Install Node.js with npm, then clone this repository:

```bash
git clone https://github.com/MgbokinyiChidubem/globalEnergyHackathon.git
cd globalEnergyHackathon
npm ci
```

For AI parsing, copy `.env.example` to `.env.local`:

```powershell
# Windows PowerShell
Copy-Item .env.example .env.local
```

```bash
# macOS / Linux
cp .env.example .env.local
```

Set `NVIDIA_API_KEY` in `.env.local` to a key from [NVIDIA API Catalog](https://build.nvidia.com). Keep this file private; it is excluded from Git. You can skip this step to use manual appliance entry.

| Environment variable | Purpose | Default |
| --- | --- | --- |
| `NVIDIA_API_KEY` | Server-side credential for AI parsing | Required only for AI parsing |
| `NVIDIA_MODEL` | Override the app's model | `nvidia/nemotron-3.5-lightning-30b-a3b` |
| `NVIDIA_TIMEOUT_MS` | Timeout for each AI request, in milliseconds | `30000` |

The commented model in `.env.example` is an optional override; the app's default is defined in [lib/nvidia.ts](lib/nvidia.ts). After configuring the key, `node scripts/check-models.mjs` checks candidate models from your environment.

Start the development server:

```bash
npm run dev
```

Open [localhost:3000](http://localhost:3000). For a production build, including service-worker registration:

```bash
npm run build
npm start
```

## Validation

```bash
npm test
npm run lint
```

Unit tests cover sizing, pricing, parsing, sunshine handling and related behaviour. Browser checks require Python and Playwright:

```bash
python -m pip install playwright
python -m playwright install chromium
```

With a development server running, pass its URL explicitly:

```bash
python e2e/test_landing.py http://localhost:3000
```

The landing script exercises live AI and sunshine integrations, so configure the NVIDIA key and network access. For the offline check, run a **production** server with `npm run build` followed by `npm start`, then:

```bash
python e2e/test_offline.py http://localhost:3000
```

## Deployment

Import this repository into Vercel as a Next.js project. Set `NVIDIA_API_KEY` in the deployment environment to enable AI parsing; optionally set `NVIDIA_MODEL` and `NVIDIA_TIMEOUT_MS`. Build with `npm run build`.

The app needs server-side API routes for AI parsing and NASA lookups. Offline support registers only in production and requires a browser context that supports service workers, such as HTTPS or localhost.

## Repository structure

| Path | Contents |
| --- | --- |
| [`app/`](app/) | Pages, layout, styles, manifest and API routes |
| [`components/`](components/) | Sizing form, appliance editor, results, chart and service-worker registration |
| [`lib/`](lib/) | Sizing, pricing, impact, parsing, location data and unit tests |
| [`lib/prices.json`](lib/prices.json) | Editable naira equipment price table |
| [`public/sw.js`](public/sw.js) | Production offline caching logic |
| [`e2e/`](e2e/) | Landing-page and offline browser checks |
| [`scripts/check-models.mjs`](scripts/check-models.mjs) | NVIDIA model availability check |
| [`docs/`](docs/) | Project summary, demo script, pitch outline and disclosure |

## Assumptions and limitations

- Equipment prices are placeholder Lagos estimates and have not been validated against installer quotes. Replace them with sourced, dated prices before making a purchase decision.
- Sizing uses annual average sunshine, fixed loss factors and a 50% night-use assumption. It does not model roof shading, seasonal performance, wiring or a site-specific installation design.
- Savings assume solar fully replaces the entered petrol spending. Maintenance, battery replacement and financing costs are excluded from simple payback and five-year savings.
- AI can infer incorrect wattages or usage hours. Check the editable table against appliance ratings and actual usage.
- Offline use depends on previously cached production assets. AI parsing and fresh NASA data require internet access; city estimates support offline sizing.
- The app currently supports the listed Nigerian cities and NGN pricing. Impact figures are modelled estimates, not measured pilot outcomes.

## Project documents and disclosure

- [One-page project summary](docs/one-page-summary.md)
- [Pitch deck outline](docs/pitch-deck-outline.md)
- [Demo walkthrough](docs/demo-script.md)
- [Prior work, AI tools and data disclosure](docs/disclosure.md)
- [Development changelog](CHANGELOG.md)

The summary and submission documents include draft assumptions and items still to confirm. The disclosure and changelog describe the source project's development history; historical tag references in those documents refer to the source repository and are not present in this repository's fresh import history.
