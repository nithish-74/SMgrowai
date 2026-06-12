import type { ScannedPost } from "@prisma/client";

export const FORMAT_HOOK_TYPES = [
  "question",
  "bold_claim",
  "statistic",
  "story",
  "list",
] as const;

export const FORMAT_STRUCTURE_PATTERNS = [
  "problem_solution",
  "before_after",
  "list_steps",
  "single_insight",
] as const;

export const FORMAT_CTA_STYLES = [
  "soft_cta",
  "direct_cta",
  "no_cta",
  "question_cta",
] as const;

export type FormatHookType = (typeof FORMAT_HOOK_TYPES)[number];
export type FormatStructurePattern = (typeof FORMAT_STRUCTURE_PATTERNS)[number];
export type FormatCtaStyle = (typeof FORMAT_CTA_STYLES)[number];

export type FormatAnalyserResult = {
  hookType: FormatHookType;
  structurePattern: FormatStructurePattern;
  ctaStyle: FormatCtaStyle;
  reasoning: string;
};

export type FormatAnalyserPrompt = {
  systemPrompt: string;
  userMessage: string;
};

const SYSTEM_PROMPT = `You are a social media format analyst. You analyse example posts and infer the dominant content format patterns they share.

Your task:
1. Analyse the provided social media posts (captions and context).
2. Identify the hook type — exactly one of: question, bold_claim, statistic, story, list.
3. Identify the structure pattern — exactly one of: problem_solution, before_after, list_steps, single_insight.
4. Identify the CTA style — exactly one of: soft_cta, direct_cta, no_cta, question_cta.
5. Provide brief reasoning (maximum 50 words) explaining your choices.

Output rules:
- Return ONLY a valid JSON object with these fields: hookType, structurePattern, ctaStyle, reasoning.
- Use the exact enum string values listed above.
- Do not include markdown, code fences, backticks, or any text before or after the JSON.
- Do not wrap the JSON in an array or add extra keys.`;

function formatPostsForUserMessage(posts: ScannedPost[]): string {
  if (posts.length === 0) {
    return "No posts provided.";
  }

  const lines = posts.map((post, index) => {
    const caption = post.caption?.trim() || "(no caption)";
    const meta = `[${post.provider} · ${post.postId}]`;
    return `${index + 1}. ${meta}\n${caption}`;
  });

  return `Analyse the following ${posts.length} social media post(s) and infer the shared format pattern.\n\n${lines.join("\n\n")}`;
}

export function buildFormatAnalyserPrompt(
  posts: ScannedPost[]
): FormatAnalyserPrompt {
  return {
    systemPrompt: SYSTEM_PROMPT,
    userMessage: formatPostsForUserMessage(posts),
  };
}
