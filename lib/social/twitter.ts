type TweetCreateResponse = {
  data?: { id: string };
  errors?: Array<{ message?: string }>;
};

async function fetchImageBuffer(imageUrl: string): Promise<Buffer> {
  const res = await fetch(imageUrl);
  if (!res.ok) {
    throw new Error(`Failed to fetch image (${res.status}): ${imageUrl}`);
  }
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function uploadTwitterMedia(
  accessToken: string,
  imageUrl: string
): Promise<string> {
  const buffer = await fetchImageBuffer(imageUrl);
  const body = new URLSearchParams({
    media_data: buffer.toString("base64"),
  });

  const res = await fetch("https://upload.twitter.com/1.1/media/upload.json", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const data = (await res.json()) as {
    media_id_string?: string;
    errors?: Array<{ message?: string }>;
  };

  if (!res.ok || !data.media_id_string) {
    const message =
      data.errors?.[0]?.message ??
      `Twitter media upload failed (${res.status})`;
    throw new Error(message);
  }

  return data.media_id_string;
}

export async function publishTwitterThread(options: {
  accessToken: string;
  tweets: string[];
  mediaUrls?: string[];
}): Promise<{ lastTweetId: string }> {
  const { accessToken, tweets } = options;

  if (tweets.length === 0) {
    throw new Error("Twitter thread must contain at least one tweet");
  }

  let mediaIds: string[] = [];
  if (options.mediaUrls?.length) {
    mediaIds = await Promise.all(
      options.mediaUrls.map((url) => uploadTwitterMedia(accessToken, url))
    );
  }

  let previousTweetId: string | undefined;

  for (let i = 0; i < tweets.length; i++) {
    const payload: Record<string, unknown> = { text: tweets[i] };

    if (i === 0 && mediaIds.length > 0) {
      payload.media = { media_ids: mediaIds };
    }

    if (previousTweetId) {
      payload.reply = { in_reply_to_tweet_id: previousTweetId };
    }

    const res = await fetch("https://api.twitter.com/2/tweets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = (await res.json()) as TweetCreateResponse;

    if (!res.ok || !data.data?.id) {
      const message =
        data.errors?.[0]?.message ??
        `Twitter tweet post failed (${res.status})`;
      throw new Error(message);
    }

    previousTweetId = data.data.id;
  }

  return { lastTweetId: previousTweetId! };
}
