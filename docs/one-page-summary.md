# SolarSizer AI — one-page summary (draft, Appendix A format)

Export to PDF for submission. Items marked **[check]** are assumptions to confirm or replace with real data.

| Prompt | Answer |
|---|---|
| **Team name & members** | **[check]** Team name, members and roles |
| **Problem brief # and title** | Brief 7: Replace diesel for productive use (confirm wording against the full brief released at kick-off) |
| **Challenge track & setting** | Track 2, Digital Solutions & AI. Setting B, non-residential: small shops and workshops that run petrol generators. Also works for homes. |
| **Community & target user** | Owners of small shops in Nigerian cities (provision stores, cold-drink sellers, barbers, tailors) who run a petrol generator most days. The user pays nothing. Installers and pay-as-you-go solar companies pay per qualified sizing request **[check: price per lead]**. The shop pays for its system in cash or monthly. |
| **The problem** | Grid power fails daily, so shops burn petrol. Solar is cheaper over time, but buyers have no neutral, location-based way to check a quote. Systems end up too small (dead by midnight) or too big (wasted money), and nobody shows when solar pays back. |
| **Proposed solution** | A web app. You type what you power in plain words. AI turns it into an appliance list you can edit. Tested formulas size the inverter, battery and panels using NASA sun hours for your city, price the system, and show payback, a monthly payment option, and the petrol, CO₂ and money saved each year. You share the result with an installer on WhatsApp. Works offline after the first visit. |
| **Proof of Concept for the 48 hours** | A shop owner gets a sized, priced system and their yearly savings in under a minute, and the result matches real installer quotes within a stated margin **[check: compare with 3 real quotes during the sprint]**. |
| **Brief success metric you will move** | For the example shop (₦25,000 petrol a week, Lagos): about 1,300 litres of petrol and 3.0 tonnes of CO₂ avoided per year, ₦1.3M saved per year, about ₦4.07M kept over 5 years after paying for the system. |
| **Estimated cost & who pays** | Example shop system: about ₦2.43M (1 kVA, 5 kWh, 3 × 550 W) **[check: placeholder prices]**. Payback about 23 months. Monthly option: ₦243,000 down, then ₦115,629 a month for 24 months, against about ₦108,333 a month of petrol today, and the payments end. Running SolarSizer costs close to nothing at pilot scale: free NASA data, free hosting tier, free NVIDIA API tier **[check: paid tiers at scale]**. |
| **6–18 month deployment path** | Months 0–6: sourced prices from 3 Lagos installers, pilot with 50 shops, WhatsApp sharing in use. Months 6–12: one pay-as-you-go partner accepts SolarSizer results as quote requests and pays per lead. Months 12–18: all Nigerian states, more installers, monthly price updates. **[check]** |
| **How it scales** | Cities and prices are two data files. A new country needs a city list, a local price table and a currency: the sizing maths and NASA data work worldwide. Kenya and Ghana are the next candidates. |
| **Biggest risk & how you will test it** | Wrong or outdated prices give misleading costs. Test: compare SolarSizer with 3 real installer quotes during the sprint; then refresh prices monthly from partner installers. Second risk: the AI misreads appliances; every row is editable and the AI never does the maths. |
| **Prior work disclosure** | The working app existed before Oct 30, 2026 (tag `prior-work-2026-10-29`, see `CHANGELOG.md` and `docs/disclosure.md`). Sprint work: **[fill in]** |
