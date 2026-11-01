# Disclosure statement (draft)

Paste into the submission portal's disclosure form. Update the "built during the sprint" section before submitting.

## What existed before the event (Oct 30, 2026, 12:00 PM ET)

The working web app, tagged in the repository as `prior-work-2026-10-29`:

- Sizing engine for inverter, battery and panels, with unit tests
- Pricing, payback, monthly payment view, and yearly petrol, CO₂ and money saved (the Brief 7 metric)
- AI appliance reading from plain text, NASA POWER sun hours by city
- Editable appliance table, payback chart, WhatsApp and copy-as-text sharing
- Offline use after the first visit, manual entry without the AI, rate limiting
- Landing page, end-to-end browser tests, and an explainer video made on Oct 12, 2026

See `CHANGELOG.md` for dates.

The tag and commits are dated Oct 29, 2026, but the repository was first pushed to GitHub on Oct 31, 2026, during the sprint.

## What we built during the sprint

- Upgraded Next.js from 16.4.0 to 16.4.3 (security patch)
- First GitHub push and public Vercel deployment (https://solarsizer-ai.vercel.app)
- Ran the browser and offline test suites against the live site
- Produced the demo video, pitch video, deck and one-page summary
- Switched the AI model to fix live timeouts, and stopped it inventing appliances for text with none

Not done yet: equipment prices are still placeholders, and results have not been compared with real installer quotes
or checked with shop owners. The impact figures are modelled for an example shop.

## Videos

- Narration in both videos is an AI voice (Kokoro, through HyperFrames). The screen footage is a recording of the live app.
- The screen recording is retimed in places to fit the narration. In the demo, the AI result shown came from the live app during that recording.

## AI tools used

- Claude Code (Anthropic) to help write code, tests, documents and the videos
- NVIDIA API Catalog, model `nvidia/nemotron-3.5-lightning-30b-a3b`, inside the app to turn a typed appliance list into structured data. The demo video was recorded earlier with `openai/gpt-oss-20b`.
  The model does no calculations; all numbers come from the tested sizing code.

## Open-source code and libraries

Next.js, React, Tailwind CSS, Zod, the `openai` npm client, Vitest, Playwright. All under their own open-source licences.

## Datasets and sources

- NASA POWER climatology API, parameter `ALLSKY_SFC_SW_DWN` (annual mean sun hours)
- CO₂ factor of 2.31 kg per litre of petrol (IPCC 2006 default for motor gasoline)
- Equipment prices in `lib/prices.json`: placeholder Lagos estimates. Replace with sourced prices and their date.
