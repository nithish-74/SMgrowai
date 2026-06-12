const GRAPH_BASE = "https://graph.instagram.com";

type InstagramMeResponse = {
  followers_count?: number;
  error?: { message?: string };
};

type InstagramMediaItem = {
  id: string;
  caption?: string;
  media_type?: string;
  media_url?: string;
  like_count?: number;
  comments_count?: number;
  timestamp?: string;
};

type InstagramMediaResponse = {
  data?: InstagramMediaItem[];
  paging?: { next?: string };
  error?: { message?: string };
};

async function instagramFetch<T>(url: string): Promise<T> {
  const res = await fetch(url);
  const data = (await res.json()) as T & { error?: { message?: string } };

  if (!res.ok || data.error?.message) {
    throw new Error(
      data.error?.message ?? `Instagram API request failed (${res.status})`
    );
  }

  return data;
}

export type InstagramScannedPostInput = {
  postId: string;
  caption: string | null;
  mediaUrl: string | null;
  likes: number;
  comments: number;
  shares: number;
  engagementRate: number;
};

export async function fetchInstagramPosts(
  accessToken: string
): Promise<InstagramScannedPostInput[]> {
  const meUrl = new URL(`${GRAPH_BASE}/me`);
  meUrl.searchParams.set("fields", "followers_count");
  meUrl.searchParams.set("access_token", accessToken);

  const me = await instagramFetch<InstagramMeResponse>(meUrl.toString());
  const followersCount = me.followers_count ?? 0;

  const posts: InstagramScannedPostInput[] = [];
  let nextUrl: string | null = (() => {
    const mediaUrl = new URL(`${GRAPH_BASE}/me/media`);
    mediaUrl.searchParams.set(
      "fields",
      "id,caption,media_type,media_url,like_count,comments_count,timestamp"
    );
    mediaUrl.searchParams.set("limit", "50");
    mediaUrl.searchParams.set("access_token", accessToken);
    return mediaUrl.toString();
  })();

  while (nextUrl) {
    const page: InstagramMediaResponse = await instagramFetch<InstagramMediaResponse>(nextUrl);
    const items = page.data ?? [];

    for (const item of items) {
      const likes = item.like_count ?? 0;
      const comments = item.comments_count ?? 0;
      const engagementRate =
        followersCount > 0 ? (likes + comments) / followersCount : 0;

      posts.push({
        postId: item.id,
        caption: item.caption?.trim() ?? null,
        mediaUrl: item.media_url ?? null,
        likes,
        comments,
        shares: 0,
        engagementRate,
      });
    }

    nextUrl = page.paging?.next ?? null;
  }

  return posts;
}
