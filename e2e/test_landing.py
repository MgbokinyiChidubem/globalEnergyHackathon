"""End-to-end check of the SolarSizer AI landing page.

Run with the dev server up (calls the real NVIDIA + NASA APIs):
    python e2e/test_landing.py [base_url]
Screenshots land in e2e/shots/.
"""
import re
import sys
from pathlib import Path

from playwright.sync_api import expect, sync_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:3023"
SHOTS = Path(__file__).parent / "shots"
SHOTS.mkdir(exist_ok=True)
results = []


def check(name, fn):
    try:
        fn()
        results.append((True, name))
    except Exception as e:  # report every failure, keep going
        results.append((False, f"{name}: {str(e).splitlines()[0][:160]}"))


with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 900})
    errors = []
    page.on("pageerror", lambda e: errors.append(str(e)))
    page.on("console", lambda m: m.type == "error" and errors.append(m.text))

    page.goto(BASE, timeout=90000)
    page.get_by_role("heading", level=1).wait_for(timeout=90000)
    page.wait_for_timeout(3000)  # let the sunrise finish for the screenshot
    page.screenshot(path=str(SHOTS / "1-hero-desktop.png"))

    size_btn = page.get_by_role("button", name="Size my system")
    check("hero headline visible", lambda: expect(page.get_by_role("heading", level=1)).to_contain_text("solar system"))
    check("size button disabled when empty", lambda: expect(size_btn).to_be_disabled())

    # Bad input: AI should reject non-appliance text with a clear message.
    page.get_by_role("textbox", name="What do you want to power?").fill("hello")
    size_btn.click()
    check("nonsense input shows error", lambda: expect(page.get_by_role("alert").filter(has_text=re.compile("Could not read|AI is slow"))).to_be_visible(timeout=60000))
    check("empty state invites manual entry", lambda: expect(page.get_by_text("Add at least one appliance")).to_be_visible())

    # Happy path: example shop.
    page.get_by_role("button", name="Fill in an example shop").click()
    check("example fills fuel", lambda: expect(page.get_by_role("spinbutton", name=re.compile("each week"))).to_have_value("25000"))
    size_btn.click()
    check("loading message shown", lambda: expect(page.get_by_text("This takes about 10 seconds")).to_be_visible())
    check("AI returns appliances", lambda: expect(page.get_by_label("Appliance name")).to_have_count(4, timeout=60000))
    if page.get_by_label("Appliance name").count() == 0:
        # NVIDIA free tier timed out: carry on the way a user would, with manual rows, so the rest still gets tested.
        print("note: AI unavailable this run, continuing with manual rows")
        for _ in range(2):
            page.get_by_role("button", name="+ Add appliance").click()
    check("results heading names city", lambda: expect(page.get_by_role("heading", name="Your system for Lagos")).to_be_visible(timeout=15000))
    check("payback sentence", lambda: expect(page.get_by_text(re.compile(r"pays for itself in about \d+ months"))).to_be_visible())
    check("total cost in naira", lambda: expect(page.get_by_text(re.compile(r"₦\s?[\d,]+")).first).to_be_visible())
    check("payback chart rendered", lambda: expect(page.get_by_role("img", name=re.compile("Solar pays back in month"))).to_be_visible())

    # Brief 7 metric: litres of petrol, CO2 and money saved per year.
    impact = page.get_by_role("region", name="Yearly impact")
    check("impact shows litres per year", lambda: expect(impact).to_contain_text("1,300"))
    check("impact shows CO2 tonnes", lambda: expect(impact).to_contain_text("3.0 t"))
    check("impact shows yearly saving", lambda: expect(impact).to_contain_text(re.compile(r"₦\s?1,300,000")))
    check("set petrol price 2000", lambda: impact.get_by_role("spinbutton").fill("2000", timeout=5000))
    check("petrol price change halves litres", lambda: expect(impact).to_contain_text("650"))
    check("reset petrol price", lambda: impact.get_by_role("spinbutton").fill("1000", timeout=5000))

    # Affordability: monthly instalment next to today's petrol bill.
    plan = page.get_by_role("region", name="Pay monthly")
    check("monthly plan shows deposit and instalment", lambda: expect(plan).to_contain_text(re.compile(r"a month for 24 months")))
    check("monthly plan compares with petrol", lambda: expect(plan).to_contain_text("a month on petrol today"))

    # Low-connectivity sharing: plain-text WhatsApp link, no personal data.
    wa = page.get_by_role("link", name="Share on WhatsApp")
    check("WhatsApp link points to wa.me with result", lambda: expect(wa).to_have_attribute("href", re.compile(r"^https://wa\.me/\?text=SolarSizer.*Lagos")))
    page.wait_for_timeout(500)
    page.screenshot(path=str(SHOTS / "2-results-desktop.png"), full_page=False)

    # Editing a row recalculates without another AI call.
    total_before = page.locator("dl div").last.inner_text()
    qty = page.get_by_label("Quantity").first
    qty.fill("4")
    check("editing qty changes total", lambda: expect(page.locator("dl div").last).not_to_have_text(total_before))

    # Bug fix: a number cell can be cleared and retyped (it used to snap to the minimum).
    watts = page.get_by_label("Watts").first
    watts.fill("")
    check("watts cell can be blank while typing", lambda: expect(watts).to_have_value(""))
    watts.press_sequentially("300")
    check("retyped watts sticks", lambda: expect(watts).to_have_value("300"))
    watts.fill("")
    page.get_by_role("heading", name=re.compile("^Your system")).click()  # blur
    check("blank watts restores last valid value on blur", lambda: expect(watts).to_have_value("300"))

    # Removing every row shows the empty state, never NaN.
    for _ in range(page.get_by_label("Appliance name").count()):
        page.get_by_role("button", name=re.compile("^Remove")).first.click()
    check("all rows removed shows empty state", lambda: expect(page.get_by_text("Add at least one appliance")).to_be_visible())
    check("no NaN or Infinity on page", lambda: expect(page.locator("body")).not_to_contain_text(re.compile("NaN|Infinity")))

    # Fuel cleared: payback message changes, no crash.
    page.get_by_role("button", name="+ Add appliance").click()
    page.get_by_role("spinbutton", name=re.compile("each week")).fill("")
    check("no fuel shows payback prompt", lambda: expect(page.get_by_text("Enter how much petrol you buy each week")).to_be_visible())

    # Changing city refetches sun data.
    page.get_by_role("combobox", name="City").select_option("kano")
    check("city change updates heading", lambda: expect(page.get_by_role("heading", name="Your system for Kano")).to_be_visible())

    # Bug fix: city change while sun lookup fails falls back to an estimate instead of silently keeping old data.
    page.route("**/api/sun**", lambda route: route.abort())
    page.get_by_role("combobox", name="City").select_option("maiduguri")
    check("offline city change shows estimate", lambda: expect(page.get_by_text(re.compile(r"Our estimate gives your city 6\.2 sun hours"))).to_be_visible())
    page.unroute("**/api/sun**")
    check("only Nigerian cities offered", lambda: expect(page.get_by_role("combobox", name="City").locator("option", has_text="Nairobi")).to_have_count(0))

    page.screenshot(path=str(SHOTS / "3-full-desktop.png"), full_page=True)

    # Manual entry works without calling the AI.
    page.goto(BASE, timeout=90000)
    page.get_by_role("heading", level=1).wait_for(timeout=90000)
    calls = []
    page.on("request", lambda r: "/api/parse" in r.url and calls.append(r.url))
    page.get_by_role("button", name="Enter appliances by hand").click()
    check("manual entry opens a starter row", lambda: expect(page.get_by_label("Appliance name")).to_have_count(1))
    check("manual entry shows a system", lambda: expect(page.get_by_text("Solar panels")).to_be_visible())
    check("manual entry made no AI call", lambda: (_ for _ in ()).throw(AssertionError(calls)) if calls else None)

    # Mobile layout.
    m = browser.new_page(viewport={"width": 375, "height": 812}, is_mobile=True)
    m.goto(BASE, timeout=90000)
    m.get_by_role("heading", level=1).wait_for(timeout=90000)
    m.wait_for_timeout(3000)
    overflow = m.evaluate("document.documentElement.scrollWidth - window.innerWidth")
    check("no horizontal scroll on mobile", lambda: (_ for _ in ()).throw(AssertionError(f"overflow {overflow}px")) if overflow > 0 else None)
    m.screenshot(path=str(SHOTS / "4-hero-mobile.png"))
    m.screenshot(path=str(SHOTS / "5-full-mobile.png"), full_page=True)

    check("no JS errors", lambda: (_ for _ in ()).throw(AssertionError("; ".join(errors)[:300])) if [e for e in errors if not re.search(r"status of (422|429|504)|ERR_FAILED", e)] else None)
    browser.close()

for ok, name in results:
    print(("PASS " if ok else "FAIL ") + name)
print(f"\n{sum(ok for ok, _ in results)}/{len(results)} passed")
sys.exit(0 if all(ok for ok, _ in results) else 1)
