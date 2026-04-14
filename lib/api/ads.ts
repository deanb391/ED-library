// lib/api/ads.ts

import { uploadToServer } from "../upload";
import { shuffle } from "../utils/ad-formatter";


export type AdItem = {
  id: string;
  fileUrl: string;
  fileType: "image" | "video";
  link?: string,
};

export async function fetchAds({
  limit = 10,
  cursor,
  filter,
}: {
  limit?: number;
  cursor?: string;
  filter?: {
    name?: string;
    type?: string;
    isExpired?: boolean;
  };
} = {}) {
  const query = new URLSearchParams();

  query.append("limit", String(limit));

  if (cursor) query.append("cursor", cursor);

  if (filter?.name) query.append("name", filter.name);
  if (filter?.type) query.append("type", filter.type);
  if (filter?.isExpired !== undefined) {
    query.append("isExpired", String(filter.isExpired));
  }

  const res = await fetch(`/api/ads/list?${query.toString()}`);

  if (!res.ok) throw new Error("Failed to fetch ads");

  return res.json();
}

export async function fetchActiveAds() {
  const res = await fetch("/api/ads/active");
  return res.json();
}

export async function fetchAdById(id: string) {
  const res = await fetch(`/api/ads/get?id=${id}`);
  return res.json();
}

export async function createAd(data: any) {
  const res = await fetch("/api/ads/create", {
    method: "POST",
    body: JSON.stringify(data),
  });

  return res.json();
}

export async function editAd(adId: string, data: any) {
  const res = await fetch("/api/ads/update", {
    method: "PATCH",
    body: JSON.stringify({ adId, data }),
  });

  return res.json();
}

export async function deleteAd(adId: string) {
  const res = await fetch("/api/ads/delete", {
    method: "DELETE",
    body: JSON.stringify({ adId }),
  });

  return res.json();
}

export async function recordAdView(adId: string, userId?: string) {
  await fetch("/api/ads/view", {
    method: "POST",
    body: JSON.stringify({ adId, userId }),
  });
}

export async function fetchMediumAds(): Promise<{
  oneAds: AdItem[];
  twoAds: AdItem[];
  threeAds: AdItem[];
}> {
  const activeAds = await fetchActiveAds();

  // Step 1: flatten all rectangular creatives
  const formatted: AdItem[] = [];

  for (const ad of activeAds) {
    // Rectangular images
    for (const imageUrl of ad.mediumImages) {
      formatted.push({
        id: ad.id,
        fileUrl: imageUrl,
        fileType: "image",
        link: ad.link,
      });
    }

    // Videos can also be used in rectangular slots
    for (const videoUrl of ad.videos) {
      formatted.push({
        id: ad.id,
        fileUrl: videoUrl,
        fileType: "video",
        link: ad.link,
      });
    }
  }

  // Nothing to work with? Return emptiness honestly.
  if (formatted.length === 0) {
    return {
      oneAds: [],
      twoAds: [],
      threeAds: [],
    };
  }

  // Step 2: shuffle once
  const shuffled = shuffle(formatted);

  // Step 3: slice safely
  const pick = (items: AdItem[]) =>
    items.slice(0, Math.min(6, items.length));

  return {
    oneAds: pick(shuffled),
    twoAds: pick(shuffle(shuffled)),
    threeAds: pick(shuffle(shuffled)),
  };
}


export type BannerOrSquareAdItem = {
  id: string;
  fileUrl: string;
  fileType: "image" | "video";
  link: string; // we'll use ad type/link if needed, otherwise can be '#'
};

export async function fetchSquareAds(): Promise<BannerOrSquareAdItem[]> {
  const activeAds = await fetchActiveAds();

  const formatted: BannerOrSquareAdItem[] = [];

  for (const ad of activeAds) {
    for (const imageUrl of ad.largeImages) {
      formatted.push({
        id: ad.id,
        fileUrl: imageUrl,
        fileType: "image",
        link: ad?.link || "#", // replace with a real link if you have one in the ad object
      });
    }

    for (const videoUrl of ad.videos) {
      formatted.push({
        id: ad.id,
        fileUrl: videoUrl,
        fileType: "video",
        link: ad?.link || "#", // replace with a real link if you have one in the ad object
      });
    }
  }

  return formatted;
}

export async function uploadAdImage(file: File): Promise<string> {
  return uploadToServer(file, "ads/images", "video");
}

export async function uploadAdVideo(file: File): Promise<string> {
  return uploadToServer(file, "ads/videos", "video");
}