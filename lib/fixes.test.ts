import { expect, test } from "vitest";
import { CITIES } from "./cities";
import { parseField } from "./parseField";
import { createRateLimiter } from "./rateLimit";
import { fetchSun } from "./sunClient";

// Bug: number cells could not be cleared (empty snapped to the minimum).
test("parseField: empty or junk is null so the cell can stay blank while typing", () => {
  expect(parseField("", 1, 5000)).toBeNull();
  expect(parseField("abc", 1, 5000)).toBeNull();
});
test("parseField: clamps into range and rounds integers", () => {
  expect(parseField("9000", 1, 5000)).toBe(5000);
  expect(parseField("0", 1, 50, true)).toBe(1);
  expect(parseField("2.6", 1, 50, true)).toBe(3);
  expect(parseField("4.5", 0, 24)).toBe(4.5);
});

// Bug: changing city with a network failure did nothing and showed no message.
test("fetchSun falls back to the city estimate when the network fails", async () => {
  const r = await fetchSun("kano", async () => {
    throw new Error("offline");
  });
  expect(r).toEqual({ sunHours: 6.0, source: "estimate" });
});
test("fetchSun falls back on a non-OK response", async () => {
  const r = await fetchSun("lagos", async () => new Response("{}", { status: 500 }));
  expect(r).toEqual({ sunHours: 4.5, source: "estimate" });
});
test("fetchSun returns server data when OK", async () => {
  const r = await fetchSun("lagos", async () => Response.json({ sunHours: 4.59, source: "nasa" }));
  expect(r).toEqual({ sunHours: 4.59, source: "nasa" });
});

// Bug: Nairobi and Accra were priced in naira from a Lagos price table.
test("every city is in Nigeria, matching the NGN price table", () => {
  for (const c of CITIES) {
    expect(c.lat, c.id).toBeGreaterThanOrEqual(4);
    expect(c.lat, c.id).toBeLessThanOrEqual(14);
    expect(c.lon, c.id).toBeGreaterThanOrEqual(2.6);
    expect(c.lon, c.id).toBeLessThanOrEqual(14.7);
  }
});

// Bug: anyone could drain the shared NVIDIA key through /api/parse.
test("rate limiter allows `limit` calls per window per key, then blocks, then resets", () => {
  let now = 0;
  const allow = createRateLimiter(3, 60_000, () => now);
  expect([allow("a"), allow("a"), allow("a"), allow("a")]).toEqual([true, true, true, false]);
  expect(allow("b")).toBe(true);
  now = 60_001;
  expect(allow("a")).toBe(true);
});
