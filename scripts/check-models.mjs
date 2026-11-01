// Finds which NVIDIA models answer from your location. Usage: node scripts/check-models.mjs
// Reads NVIDIA_API_KEY from .env.local. Never prints the key.
import { readFileSync } from "node:fs";

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const key = env.match(/^NVIDIA_API_KEY=(.*)$/m)?.[1]?.trim();
if (!key?.startsWith("nvapi-")) {
  console.error("Put NVIDIA_API_KEY=nvapi-... in .env.local first");
  process.exit(1);
}

const BASE = "https://integrate.api.nvidia.com/v1";
const CANDIDATES = [
  "openai/gpt-oss-20b",
  "deepseek-ai/deepseek-v4.1-flash",
  "z-ai/glm-5.3-flash",
  "nvidia/nemotron-3.5-lightning-30b-a3b",
  "google/gemma-4-31b-it",
];

const listed = new Set(
  ((await (await fetch(`${BASE}/models`, { headers: { Authorization: `Bearer ${key}` } })).json()).data ?? []).map((m) => m.id),
);

const prompt =
  "Extract appliances. Reply with ONLY a JSON array of {name, watts, hours, qty, motor}. Text: 1 freezer, 2 standing fans, a TV and 6 bulbs";
for (const model of CANDIDATES) {
  if (listed.size && !listed.has(model)) { console.log(`skip   ${model} (not in catalog)`); continue; }
  const t = Date.now();
  try {
    const res = await fetch(`${BASE}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model, temperature: 0, max_tokens: 1500, messages: [{ role: "user", content: prompt }] }),
      signal: AbortSignal.timeout(60000),
    });
    const body = await res.json().catch(() => ({}));
    const text = body.choices?.[0]?.message?.content ?? "";
    const ok = res.ok && text.includes("[");
    console.log(`${ok ? "OK    " : "FAIL  "} ${model}  ${res.status}  ${Date.now() - t}ms  ${ok ? text.replace(/\s+/g, " ").slice(0, 160) : JSON.stringify(body).slice(0, 120)}`);
  } catch (e) {
    console.log(`FAIL   ${model}  ${e.name}`);
  }
}
