import type { Account, OAuthProvider } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const PROVIDER_MAP: Record<string, OAuthProvider | undefined> = {
  instagram: "instagram",
  twitter: "twitter",
};

export function mapAccountProvider(provider: string): OAuthProvider | null {
  return PROVIDER_MAP[provider] ?? null;
}

export async function syncOAuthTokenFromAccount(
  userId: string,
  account: Pick<
    Account,
    "provider" | "access_token" | "refresh_token" | "expires_at"
  >
) {
  const provider = mapAccountProvider(account.provider);
  if (!provider || !account.access_token) {
    return null;
  }

  return prisma.oAuthToken.upsert({
    where: {
      userId_provider: { userId, provider },
    },
    create: {
      userId,
      provider,
      accessToken: account.access_token,
      refreshToken: account.refresh_token,
      expiresAt: account.expires_at
        ? new Date(account.expires_at * 1000)
        : null,
    },
    update: {
      accessToken: account.access_token,
      refreshToken: account.refresh_token,
      expiresAt: account.expires_at
        ? new Date(account.expires_at * 1000)
        : null,
    },
  });
}
