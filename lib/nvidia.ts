import OpenAI from "openai";
import type { Complete } from "./parseAppliances";

let client: OpenAI | null = null;

/** Chat completion via NVIDIA's OpenAI-compatible API (build.nvidia.com). Server only. */
export const nvidiaComplete: Complete = async (system, user) => {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) throw new Error("NVIDIA_API_KEY is not set");
  // Free tier sometimes queues for minutes; fail fast with a clear message instead.
  client ??= new OpenAI({ apiKey, baseURL: "https://integrate.api.nvidia.com/v1", timeout: Number(process.env.NVIDIA_TIMEOUT_MS ?? 30_000), maxRetries: 0 });
  // Nemotron Lightning with thinking off answers in about 2 s. gpt-oss-20b and other free models often queue for
  // minutes, and Meta Llama models are geo-blocked in Nigeria. Reasoning models need max_tokens headroom.
  const model = process.env.NVIDIA_MODEL ?? "nvidia/nemotron-3.5-lightning-30b-a3b";
  const res = await client.chat.completions.create({
    model,
    temperature: 0,
    max_tokens: 2000,
    ...(model.startsWith("openai/gpt-oss") ? { reasoning_effort: "low" as const } : {}),
    ...(model.startsWith("nvidia/nemotron") ? { chat_template_kwargs: { enable_thinking: false } } : {}),
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });
  return res.choices[0]?.message?.content ?? "";
};
