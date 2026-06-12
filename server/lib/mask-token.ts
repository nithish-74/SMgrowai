export function maskToken(token: string | null | undefined): string | null {
  if (!token) return null;
  if (token.length <= 4) return "****";
  return `${"*".repeat(Math.min(token.length - 4, 12))}${token.slice(-4)}`;
}
