# Changelog

The Global Energy Hackathon allows prior work if it is disclosed. Everything up to the tag
`prior-work-2026-10-29` was built before the sprint. Sprint work (Oct 30, 12:00 PM ET to Nov 1, 12:00 PM ET)
is listed separately below, with commit times as evidence.

## Before the sprint (up to tag `prior-work-2026-10-29`)

### Oct 14, 2026
- Next.js app with a pure TypeScript sizing engine (inverter, battery, panels) and unit tests
- Pricing and payback against weekly generator petrol spend
- NASA POWER sun hours per city, with a fallback estimate
- AI appliance reading through the NVIDIA API (`openai/gpt-oss-20b`), schema-checked, one retry, 30 s timeout
- Editable appliance table, result cards, payback chart
- Night-to-day landing page and a Playwright end-to-end test

### Oct 29, 2026
- Bug fixes: number cells can be cleared while typing, offline city change falls back to an estimate,
  Nigerian cities only (prices are in naira), rate limit of 10 AI requests per minute per visitor
- Brief 7 metrics: litres of petrol and tonnes of CO₂ avoided per year, yearly petrol saving, 5-year net saving
- Monthly payment view with example pay-as-you-go terms, compared with today's petrol bill
- Share the result on WhatsApp or copy it as plain text
- Offline support after the first visit (service worker and web app manifest), manual entry without the AI
- App icon; removed default Next.js assets
- Submission drafts in `docs/`

## During the sprint

<!-- Add one line per change with the time (ET). Judges compare this with commit times. -->

- Oct 31, 05:40 AM ET: upgraded Next.js to 16.4.3 (security patch); first push to GitHub and first Vercel deployment
- Oct 31, 08:25 AM ET: produced the submission package: demo video, pitch video, deck and one-page summary; updated the disclosure statement
- Nov 01, 09:27 AM ET: switched the AI to NVIDIA Nemotron Lightning with thinking off after the previous model timed out on every live test; stopped the AI inventing appliances for text with none
