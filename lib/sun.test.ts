import { expect, test } from "vitest";
import { CITIES } from "./cities";
import { getSunHours, parsePowerResponse } from "./sun";

const ok = { properties: { parameter: { ALLSKY_SFC_SW_DWN: { ANN: 4.71 } } } };

test("reads annual value", () => expect(parsePowerResponse(ok)).toBe(4.71));

test("rejects -999 and junk", () => {
  expect(parsePowerResponse({ properties: { parameter: { ALLSKY_SFC_SW_DWN: { ANN: -999 } } } })).toBeNull();
  expect(parsePowerResponse("oops")).toBeNull();
});

test("falls back to estimate when fetch fails", async () => {
  const lagos = CITIES.find((c) => c.id === "lagos")!;
  const r = await getSunHours(lagos, async () => {
    throw new Error("down");
  });
  expect(r).toEqual({ sunHours: 4.5, source: "estimate" });
});

test("uses NASA value when fetch succeeds", async () => {
  const kano = CITIES.find((c) => c.id === "kano")!;
  const r = await getSunHours(kano, async () => new Response(JSON.stringify(ok)));
  expect(r).toEqual({ sunHours: 4.71, source: "nasa" });
});
