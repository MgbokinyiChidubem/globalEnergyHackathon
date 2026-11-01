"""Offline check against a production build (the service worker only registers in production).

    npm run build && npx next start --port 3025
    python e2e/test_offline.py [base_url]
"""
import re
import sys

from playwright.sync_api import expect, sync_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:3025"
results = []


def check(name, fn):
    try:
        fn()
        results.append((True, name))
    except Exception as e:
        results.append((False, f"{name}: {str(e).splitlines()[0][:160]}"))


with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    ctx = browser.new_context()
    page = ctx.new_page()
    page.goto(BASE, timeout=90000)
    page.get_by_role("heading", level=1).wait_for(timeout=90000)
    # Wait until the service worker controls the page, then reload once so assets are cached.
    page.wait_for_function("navigator.serviceWorker && navigator.serviceWorker.controller !== null", timeout=30000)
    page.reload()
    page.get_by_role("heading", level=1).wait_for()
    check("manifest is linked", lambda: expect(page.locator('link[rel="manifest"]')).to_have_count(1))

    ctx.set_offline(True)
    page.reload()
    check("page loads offline", lambda: expect(page.get_by_role("heading", level=1)).to_contain_text("solar system"))

    # AI cannot run offline: clear message plus manual entry.
    page.get_by_role("textbox", name="What do you want to power?").fill("1 freezer and 2 fans")
    page.get_by_role("button", name="Size my system").click()
    check("offline AI shows clear message", lambda: expect(page.get_by_role("alert").filter(has_text="offline")).to_be_visible(timeout=15000))
    page.get_by_role("button", name="Enter appliances by hand").click()
    check("offline manual entry sizes a system", lambda: expect(page.get_by_text("Solar panels")).to_be_visible(timeout=15000))
    check("offline uses estimated sun hours", lambda: expect(page.get_by_text(re.compile(r"Our estimate gives your city 4\.5 sun hours"))).to_be_visible())
    browser.close()

for ok, name in results:
    print(("PASS " if ok else "FAIL ") + name)
print(f"\n{sum(ok for ok, _ in results)}/{len(results)} passed")
sys.exit(0 if all(ok for ok, _ in results) else 1)
