const TWITTER_API = "https://api.twitter.com/2";

type TwitterMeResponse = {
  data?: {
    id: string;
    public_metrics?: {
      followers_count?: number;
    };
  };
  errors?: Array<{ message?: string }>;
};

type TwitterTweet = {
  id: string;
  text?: string;
  created_at?: string;
  public_metrics?: {
    like_count?: number;
    retweet_count?: number;
    reply_count?: number;
  };
};

type TwitterTweetsResponse = {
  data?: TwitterTweet[];
  meta?: { next_token?: string };
  errors?: Array<{ message?: string }>;
};

async function twitterFetch<T>(url: string, accessToken: string): Promise<T> {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = (await res.json()) as T & {
    errors?: Array<{ message?: string }>;
  };

  if (!res.ok || data.errors?.length) {
    const message =
      data.errors?.[0]?.message ??
      `Twitter API request failed (${res.status})`;
    throw new Error(message);
  }

  return data;
}

export type TwitterScannedPostInput = {
  postId: string;
  caption: string | null;
  mediaUrl: string | null;
  likes: number;
  comments: number;
  shares: number;
  engagementRate: number;
};

export async function fetchTwitterPosts(
  accessToken: string
): Promise<TwitterScannedPostInput[]> {
  const me = await twitterFetch<TwitterMeResponse>(
    `${TWITTER_API}/users/me?user.fields=public_metrics`,
    accessToken
  );

  const twitterUserId = me.data?.id;
  if (!twitterUserId) {
    throw new Error("Twitter API did not return a user id");
  }

  const followerCount = (me.data as any).public_metrics?.followers_count ?? 0;
  const posts: TwitterScannedPostInput[] = [];

  let nextToken: string | undefined;
  do {
    const tweetsUrl = new URL(`${TWITTER_API}/users/${twitterUserId}/tweets`);
    tweetsUrl.searchParams.set(
      "tweet.fields",
      "public_metrics,created_at,text,attachments"
    );
    tweetsUrl.searchParams.set("max_results", "50");
    if (nextToken) {
      tweetsUrl.searchParams.set("pagination_token", nextToken);
    }

    const page = await twitterFetch<TwitterTweetsResponse>(
      tweetsUrl.toString(),
      accessToken
    );

    for (const tweet of page.data ?? []) {
      const likes = tweet.public_metrics?.like_count ?? 0;
      const retweets = tweet.public_metrics?.retweet_count ?? 0;
      const replies = tweet.public_metrics?.reply_count ?? 0;
      const engagementRate =
        followerCount > 0
          ? (likes + retweets + replies) / followerCount
          : 0;

      posts.push({
        postId: tweet.id,
        caption: tweet.text?.trim() ?? null,
        mediaUrl: null,
        likes,
        comments: replies,
        shares: retweets,
        engagementRate,
      });
    }

    nextToken = page.meta?.next_token;
  } while (nextToken);

  return posts;
}
