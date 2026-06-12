import type { FormatTemplate, Product } from "@prisma/client";

export type CopyProvider = "instagram" | "twitter";

export type InstagramCopyResult = {
  caption: string;
  slidesCopy: string[];
};

export type TwitterCopyResult = {
  thread: string[];
};

export type CopyGeneratorPrompt = {
  systemPrompt: string;
  userMessage: string;
};

function formatPrice(price: Product["price"]): string {
  if (price === null || price === undefined) return "Not provided";
  return price.toString();
}

function buildInstagramSystemPrompt(
  hookType: string,
  structurePattern: string,
  ctaStyle: string
): string {
  return `You are an expert Instagram copywriter for a real brand. Write promotional content that sounds human, specific, and on-brand — never generic or obviously AI-generated.

Format rules (from the analysed template):
- Hook type: ${hookType}
- Structure pattern: ${structurePattern}
- CTA style: ${ctaStyle}

Apply the hook type in the opening, follow the structure pattern through the caption and slides, and close with the CTA style indicated.

Product rules:
- Use only the product title, description, and price provided in the user message.
- Never invent features, specs, discounts, testimonials, or claims not supported by that information.
- If a detail is missing, omit it rather than guessing.

Output rules:
- Return ONLY a valid JSON object with exactly these fields: caption, slidesCopy.
- caption: string, maximum 2200 characters.
- slidesCopy: array of 5 to 7 strings; each string maximum 150 characters (carousel slide text).
- Do not include markdown, code fences, backticks, or any text before or after the JSON.`;
}

function buildTwitterSystemPrompt(
  hookType: string,
  structurePattern: string,
  ctaStyle: string
): string {
  return `You are an expert X (Twitter) copywriter for a real brand. Write a thread that sounds human, specific, and on-brand — never generic or obviously AI-generated.

Format rules (from the analysed template):
- Hook type: ${hookType}
- Structure pattern: ${structurePattern}
- CTA style: ${ctaStyle}

The first tweet must deliver the hook type. Build the thread using the structure pattern. End with the CTA style indicated.

Product rules:
- Use only the product title, description, and price provided in the user message.
- Never invent features, specs, discounts, testimonials, or claims not supported by that information.
- If a detail is missing, omit it rather than guessing.

Output rules:
- Return ONLY a valid JSON object with exactly this field: thread.
- thread: array of tweet strings; each tweet maximum 280 characters; the first tweet is the hook.
- Do not include markdown, code fences, backticks, or any text before or after the JSON.`;
}

function buildUserMessage(
  product: Product,
  template: FormatTemplate,
  provider: CopyProvider
): string {
  const description = product.description?.trim() || "Not provided";
  const platformLabel = provider === "instagram" ? "Instagram" : "X (Twitter)";

  return `Write ${platformLabel} copy for this product using the format template below.

## Product
- Title: ${product.title}
- Description: ${description}
- Price: ${formatPrice(product.price)}

## Format template
- Hook type: ${template.hookType}
- Structure pattern: ${template.structurePattern}
- CTA style: ${template.ctaStyle}`;
}

export function buildCopyGeneratorPrompt(
  product: Product,
  template: FormatTemplate,
  provider: CopyProvider
): CopyGeneratorPrompt {
  const { hookType, structurePattern, ctaStyle } = template;

  const systemPrompt =
    provider === "instagram"
      ? buildInstagramSystemPrompt(hookType, structurePattern, ctaStyle)
      : buildTwitterSystemPrompt(hookType, structurePattern, ctaStyle);

  return {
    systemPrompt,
    userMessage: buildUserMessage(product, template, provider),
  };
}
