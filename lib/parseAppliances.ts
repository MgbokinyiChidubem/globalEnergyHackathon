import { z } from "zod";
import type { Appliance } from "./types";

export type Complete = (system: string, user: string) => Promise<string>;

export class ParseError extends Error {}

export const SYSTEM_PROMPT =
  "Extract household or shop appliances from the user's text. Reply with ONLY a JSON array, no prose. " +
  "Each item: name (string), watts (typical rated watts for one unit in Nigeria), hours (hours of use per day), " +
  "qty (integer), motor (true for fridges, freezers, pumps, air conditioners, washing machines). " +
  "For fridges and freezers use about 10 effective hours. If hours are not stated, use typical daily use. " +
  "Only include appliances the user actually mentions. If the text names no appliances, reply with [].";

export const ApplianceSchema = z.object({
  name: z.string().trim().min(1).max(60),
  watts: z.number().min(1).max(5000),
  hours: z.number().min(0).max(24),
  qty: z.number().int().min(1).max(50),
  motor: z.boolean().default(false),
});
const ListSchema = z.array(ApplianceSchema).min(1);

/** Pull the JSON array out of a model reply that may wrap it in code fences or prose. */
export function extractJson(raw: string): unknown {
  const s = raw.replace(/```(?:json)?/gi, "");
  const start = s.indexOf("[");
  const end = s.lastIndexOf("]");
  if (start === -1 || end <= start) throw new ParseError("no JSON array in reply");
  return JSON.parse(s.slice(start, end + 1));
}

export async function parseAppliances(text: string, complete: Complete): Promise<Appliance[]> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const result = ListSchema.safeParse(extractJson(await complete(SYSTEM_PROMPT, text)));
      if (result.success) return result.data;
    } catch (e) {
      if (!(e instanceof ParseError) && !(e instanceof SyntaxError)) throw e; // network/API errors bubble up
    }
  }
  throw new ParseError("Could not read your appliances, try listing them with commas");
}
