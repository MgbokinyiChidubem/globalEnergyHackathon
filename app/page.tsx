import Link from "next/link";
import Sizer from "@/components/Sizer";

const PROBLEMS = [
  { color: "bg-bad", title: "Too small", body: "The battery is flat before midnight and the generator comes back on." },
  { color: "bg-sun", title: "Too big", body: "You pay for panels and batteries you never use, and that money does not come back." },
  { color: "bg-amber", title: "No payback date", body: "Three installers give three quotes, and nobody tells you when solar starts saving you money." },
];

const STEPS = [
  { title: "Describe it", body: "Type what you own the way you would say it. The AI turns it into a list you can edit." },
  { title: "Size it", body: "Tested formulas size the inverter for start-up load, the battery for the night and the panels for the day." },
  { title: "Match your sun", body: "NASA satellite data gives the real sun hours for your city. Kano needs fewer panels than Lagos." },
  { title: "Price it", body: "A local price table gives the cost and a monthly payment option. Your petrol spend gives the payback month, the litres saved and the CO₂ avoided." },
];

const ACCESS = [
  { title: "Free for shops and homes", body: "No sign-up and no fee. Installers and pay-as-you-go providers are the ones who benefit from ready-sized requests." },
  { title: "Works on a weak network", body: "After your first visit the page opens offline. Enter appliances by hand and it still sizes your system." },
  { title: "Share on WhatsApp", body: "Send your result as plain text to an installer or a family member on any phone, then compare their quote with it." },
];

export default function Home() {
  return (
    <div id="top" className="overflow-x-clip bg-[linear-gradient(180deg,#0a1030_0%,#121a3a_55%,#2a2350_100%)]">
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-5 py-6 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5 font-display text-2xl font-extrabold tracking-tight">
          <span aria-hidden className="h-6 w-6 rounded-full bg-[radial-gradient(circle,#fff1b8,#ffc23c_55%,#ff7a2f)]" />
          SolarSizer AI
        </Link>
        <a href="#how" className="text-muted hover:text-foreground">How it works</a>
      </header>

      <main>
        <Sizer
          intro={
            <>
              <h1 className="font-display text-[clamp(2.8rem,6.4vw,5.2rem)] font-extrabold leading-[0.98] tracking-[-0.035em]">
                Find the solar system your home actually needs.
              </h1>
              <p className="mt-7 max-w-[32rem] text-xl leading-relaxed text-muted">
                Tell us what you want to power. We size the inverter, battery and panels for your city, price them in
                naira, and show the month solar starts beating your generator.
              </p>
            </>
          }
        />

        <div className="day">
          <section className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-5 py-20 sm:px-8 lg:grid-cols-12 lg:py-28">
            <h2 className="font-display text-[clamp(2rem,4vw,3.2rem)] font-extrabold leading-[1.05] tracking-tight lg:col-span-5">
              Why buying solar feels like guessing
            </h2>
            <ul className="divide-y divide-line lg:col-span-6 lg:col-start-7">
              {PROBLEMS.map((p) => (
                <li key={p.title} className="flex gap-5 py-6 first:pt-0">
                  <span aria-hidden className={`mt-2.5 h-3.5 w-3.5 shrink-0 rounded-full ${p.color}`} />
                  <div>
                    <h3 className="font-display text-2xl font-bold">{p.title}</h3>
                    <p className="mt-1.5 text-lg leading-relaxed text-muted">{p.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="border-t border-line">
            <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-24">
              <h2 className="font-display text-[clamp(2rem,4vw,3.2rem)] font-extrabold tracking-tight">Made for the way people actually buy</h2>
              <ul className="mt-12 grid grid-cols-1 gap-x-10 gap-y-10 md:grid-cols-3">
                {ACCESS.map((a) => (
                  <li key={a.title} className="border-l-4 border-sun pl-5">
                    <h3 className="font-display text-2xl font-bold">{a.title}</h3>
                    <p className="mt-2 text-lg leading-relaxed text-muted">{a.body}</p>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section id="how" className="scroll-mt-4 border-t border-line">
            <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-28">
              <h2 className="font-display text-[clamp(2rem,4vw,3.2rem)] font-extrabold tracking-tight">How it works</h2>
              <ol className="mt-14 grid grid-cols-1 gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
                {STEPS.map((s, i) => (
                  <li key={s.title}>
                    <span className="font-display text-7xl font-extrabold leading-none text-sun">{i + 1}</span>
                    <h3 className="mt-4 font-display text-2xl font-bold">{s.title}</h3>
                    <p className="mt-2 text-lg leading-relaxed text-muted">{s.body}</p>
                  </li>
                ))}
              </ol>
              <p className="mt-20 max-w-[44rem] font-display text-[clamp(1.5rem,2.6vw,2.1rem)] font-semibold leading-snug">
                The AI only reads your list. Every number comes from formulas you can check, so the same list always
                gives the same answer.
              </p>
              <a href="#top" className="mt-10 inline-block rounded-full bg-ink px-7 py-3.5 font-display text-lg font-bold text-paper hover:bg-[#2c3150]">
                Size my system
              </a>
            </div>
          </section>
        </div>
      </main>

      <footer>
        <div className="mx-auto max-w-6xl space-y-2 px-5 py-10 text-muted sm:px-8">
          <p>
            Sun data from NASA POWER. Appliance reading by an open model on the NVIDIA API. Prices are planning estimates,
            so get a final quote from a certified installer.
          </p>
          <p className="num">Made for the Global Energy Hackathon 2026, Digital Solutions, Apps and AI/ML track.</p>
        </div>
      </footer>
    </div>
  );
}
