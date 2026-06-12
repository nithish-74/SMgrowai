export function parseJsonString<T>(raw: string, label: string): T {
  const trimmed = raw.trim();
  const unfenced = trimmed
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    return JSON.parse(unfenced) as T;
  } catch (cause) {
    const detail =
      cause instanceof Error ? cause.message : "unknown parse error";
    throw new Error(`Failed to parse JSON for ${label}: ${detail}`);
  }
}
