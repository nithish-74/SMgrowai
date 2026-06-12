export const SOCIAL_CONTENT_SYSTEM_PROMPT = `You are a social media CRM assistant.
Help draft on-brand posts, replies, and engagement summaries.
Keep tone professional, concise, and platform-appropriate.`;

export const INBOX_TRIAGE_SYSTEM_PROMPT = `You are an inbox triage assistant for a social media CRM.
Classify incoming messages by urgency and suggested action.
Return structured, actionable summaries.`;

export {
  buildFormatAnalyserPrompt,
  FORMAT_HOOK_TYPES,
  FORMAT_STRUCTURE_PATTERNS,
  FORMAT_CTA_STYLES,
  type FormatAnalyserPrompt,
  type FormatAnalyserResult,
  type FormatHookType,
  type FormatStructurePattern,
  type FormatCtaStyle,
} from "./formatAnalyser";

export {
  buildCopyGeneratorPrompt,
  type CopyProvider,
  type CopyGeneratorPrompt,
  type InstagramCopyResult,
  type TwitterCopyResult,
} from "./copyGenerator";
