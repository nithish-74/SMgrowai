import type { OAuthProvider, OAuthToken } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const REFRESH_BUFFER_MS = 5 * 60 * 1000;

function needsRefresh(token: OAuthToken): boolean {
  if (!token.expiresAt) return false;
  return token.expiresAt.getTime() - Date.now() < REFRESH_BUFFER_MS;
}

async function refreshInstagramToken(token: OAuthToken): Promise<OAuthToken> {
  const url = new URL("https://graph.instagram.com/refresh_access_token");
  url.searchParams.set("grant_type", "ig_refresh_token");
  url.searchParams.set("access_token", token.accessToken);

  const res = await fetch(url.toString());
  const data = (await res.json()) as {
    access_token?: string;
    expires_in?: number;
    error?: { message?: string };
  };

  if (!res.ok || !data.access_token) {
    throw new Error(
      data.error?.message ?? `Instagram token refresh failed (${res.status})`
    );
  }

  return prisma.oAuthToken.update({
    where: { id: token.id },
    data: {
      accessToken: data.access_token,
      expiresAt: data.expires_in
        ? new Date(Date.now() + data.expires_in * 1000)
        : null,
    },
  });
}

async function refreshTwitterToken(token: OAuthToken): Promise<OAuthToken> {
  if (!token.refreshToken) {
    throw new Error("Twitter refresh token is missing");
  }

  const clientId = process.env.AUTH_TWITTER_ID;
  const clientSecret = process.env.AUTH_TWITTER_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("AUTH_TWITTER_ID and AUTH_TWITTER_SECRET must be set");
  }

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: token.refreshToken,
    client_id: clientId,
  });

  const res = await fetch("https://api.twitter.com/2/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body,
  });

  const data = (await res.json()) as {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    error?: string;
    error_description?: string;
  };

  if (!res.ok || !data.access_token) {
    throw new Error(
      data.error_description ??
        data.error ??
        `Twitter token refresh failed (${res.status})`
    );
  }

  return prisma.oAuthToken.update({
    where: { id: token.id },
    data: {
      accessToken: data.access_token,
      refreshToken: data.refresh_token ?? token.refreshToken,
      expiresAt: data.expires_in
        ? new Date(Date.now() + data.expires_in * 1000)
        : null,
    },
  });
}

export async function refreshOAuthToken(token: OAuthToken): Promise<OAuthToken> {
  switch (token.provider) {
    case "instagram":
      return refreshInstagramToken(token);
    case "twitter":
      return refreshTwitterToken(token);
    default:
      throw new Error(`Unsupported provider: ${token.provider}`);
  }
}

export async function getValidOAuthToken(
  userId: string,
  provider: OAuthProvider
): Promise<OAuthToken> {
  const token = await prisma.oAuthToken.findUnique({
    where: { userId_provider: { userId, provider } },
  });

  if (!token) {
    throw new Error(`No OAuth token for provider: ${provider}`);
  }

  if (needsRefresh(token)) {
    return refreshOAuthToken(token);
  }

  return token;
}
