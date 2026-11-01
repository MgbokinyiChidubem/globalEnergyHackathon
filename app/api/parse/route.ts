import { APIConnectionTimeoutError } from "openai";
import { nvidiaComplete } from "@/lib/nvidia";
import { ParseError, parseAppliances } from "@/lib/parseAppliances";
import { createRateLimiter } from "@/lib/rateLimit";

// Protects the shared free NVIDIA key (about 40 requests/min for the whole account).
const allow = createRateLimiter(10, 60_000);

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  if (!allow(ip)) {
    return Response.json({ error: "Too many tries in a minute. Wait a moment, then try again." }, { status: 429 });
  }
  const body = await request.json().catch(() => null);
  const text = typeof body?.text === "string" ? body.text.trim() : "";
  if (!text || text.length > 500) {
    return Response.json({ error: "Describe your appliances in 1–500 characters" }, { status: 400 });
  }
  try {
    return Response.json({ appliances: await parseAppliances(text, nvidiaComplete) });
  } catch (e) {
    if (e instanceof ParseError) return Response.json({ error: e.message }, { status: 422 });
    if ((e as { status?: number }).status === 429) {
      return Response.json({ error: "AI is busy, try again in a minute" }, { status: 429 });
    }
    if (e instanceof APIConnectionTimeoutError) {
      return Response.json({ error: "The AI is slow right now. Try again, or add your appliances by hand below." }, { status: 504 });
    }
    console.error("parse failed", e);
    return Response.json({ error: "AI service unavailable, try again or add appliances manually" }, { status: 502 });
  }
}
