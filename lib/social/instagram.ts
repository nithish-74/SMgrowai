const GRAPH_BASE = "https://graph.instagram.com/v21.0";

type InstagramMediaResponse = {
  id?: string;
  error?: { message?: string; type?: string };
};

async function graphPost(
  path: string,
  accessToken: string,
  params: Record<string, string>
): Promise<InstagramMediaResponse> {
  const url = new URL(`${GRAPH_BASE}${path}`);
  url.searchParams.set("access_token", accessToken);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const res = await fetch(url.toString(), { method: "POST" });
  const data = (await res.json()) as InstagramMediaResponse;

  if (!res.ok || !data.id) {
    throw new Error(
      data.error?.message ?? `Instagram API error (${res.status}) on ${path}`
    );
  }

  return data;
}

export async function getInstagramUserId(accessToken: string): Promise<string> {
  const url = new URL(`${GRAPH_BASE}/me`);
  url.searchParams.set("fields", "id");
  url.searchParams.set("access_token", accessToken);

  const res = await fetch(url.toString());
  const data = (await res.json()) as { id?: string; error?: { message?: string } };

  if (!res.ok || !data.id) {
    throw new Error(
      data.error?.message ?? `Failed to resolve Instagram user id (${res.status})`
    );
  }

  return data.id;
}

async function publishMedia(
  igUserId: string,
  accessToken: string,
  creationId: string
): Promise<string> {
  const published = await graphPost(`/${igUserId}/media_publish`, accessToken, {
    creation_id: creationId,
  });
  return published.id!;
}

export type InstagramMediaType = "carousel" | "single";

export async function publishInstagramPost(options: {
  accessToken: string;
  caption: string;
  imageUrls: string[];
  mediaType: InstagramMediaType;
}): Promise<{ publishedId: string }> {
  const { accessToken, caption, imageUrls, mediaType } = options;

  if (imageUrls.length === 0) {
    throw new Error("At least one image URL is required for Instagram posting");
  }

  const igUserId = await getInstagramUserId(accessToken);

  if (mediaType === "single") {
    const container = await graphPost(`/${igUserId}/media`, accessToken, {
      image_url: imageUrls[0],
      caption,
    });
    const publishedId = await publishMedia(igUserId, accessToken, container.id!);
    return { publishedId };
  }

  const childIds: string[] = [];
  for (const imageUrl of imageUrls) {
    const child = await graphPost(`/${igUserId}/media`, accessToken, {
      image_url: imageUrl,
      is_carousel_item: "true",
    });
    childIds.push(child.id!);
  }

  const carouselContainer = await graphPost(`/${igUserId}/media`, accessToken, {
    media_type: "CAROUSEL",
    children: childIds.join(","),
    caption,
  });

  const publishedId = await publishMedia(
    igUserId,
    accessToken,
    carouselContainer.id!
  );

  return { publishedId };
}
