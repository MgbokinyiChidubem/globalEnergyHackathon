import { expect, test } from "vitest";
import { ParseError, extractJson, parseAppliances } from "./parseAppliances";

const good = '[{"name":"freezer","watts":150,"hours":10,"qty":1,"motor":true}]';

test("strips code fences", () => {
  expect(extractJson("```json\n" + good + "\n```")).toEqual(JSON.parse(good));
});

test("finds the array inside prose", () => {
  expect(extractJson("Sure! Here you go: " + good + " Hope it helps")).toEqual(JSON.parse(good));
});

test("retries once then succeeds", async () => {
  let calls = 0;
  const r = await parseAppliances("1 freezer", async () => (++calls === 1 ? "no json here" : good));
  expect(calls).toBe(2);
  expect(r[0].name).toBe("freezer");
});

test("rejects absurd values and fails after retry", async () => {
  const bad = '[{"name":"AC","watts":50000,"hours":30,"qty":1,"motor":true}]';
  await expect(parseAppliances("big AC", async () => bad)).rejects.toThrow(ParseError);
});

test("motor defaults to false", async () => {
  const r = await parseAppliances("tv", async () => '[{"name":"TV","watts":100,"hours":6,"qty":1}]');
  expect(r[0].motor).toBe(false);
});

test("an empty list from the model is a clear failure, not an empty system", async () => {
  let calls = 0;
  await expect(parseAppliances("hello", async () => (calls++, "[]"))).rejects.toThrow(ParseError);
  expect(calls).toBe(2);
});
