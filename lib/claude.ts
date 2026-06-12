import Anthropic from "@anthropic-ai/sdk";

export const CLAUDE_MODEL = "claude-sonnet-4-20250514";

function getClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }
  return new Anthropic({ apiKey });
}

export async function callClaude(
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  const client = getClient();
  const response = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  const block = response.content[0];
  if (!block || block.type !== "text") {
    throw new Error("Claude returned a non-text response");
  }

  return block.text.trim();
}

import { parseJsonString } from "@/lib/parse-json";

export function parseJsonFromLlm<T>(raw: string): T {
  return parseJsonString<T>(raw, "LLM response");
}

/**
 * Calls Claude and parses JSON. On parse failure, retries the LLM call once.
 */
export async function callClaudeJson<T>(
  systemPrompt: string,
  userMessage: string,
  label: string
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const raw = await callClaude(systemPrompt, userMessage);
      return parseJsonFromLlm<T>(raw);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt === 0) {
        console.warn(`[claude:${label}] failed, retrying once:`, lastError.message);
      }
    }
  }

  throw lastError ?? new Error(`[claude:${label}] failed after retry`);
}
