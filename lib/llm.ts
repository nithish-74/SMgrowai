import { parseJsonString } from "@/lib/parse-json";

export const OLLAMA_MODEL = "llama3.2";
export const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";

export async function callLlm(
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      stream: false,
      options: {
        num_predict: 4096,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama request failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.message.content.trim();
}

export function parseJsonFromLlm<T>(raw: string): T {
  return parseJsonString<T>(raw, "LLM response");
}

export async function callLlmJson<T>(
  systemPrompt: string,
  userMessage: string,
  label: string
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const raw = await callLlm(systemPrompt, userMessage);
      return parseJsonFromLlm<T>(raw);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt === 0) {
        console.warn(`[llm:${label}] failed, retrying once:`, lastError.message);
      }
    }
  }

  throw lastError ?? new Error(`[llm:${label}] failed after retry`);
}
