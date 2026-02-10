import { ID, Query } from "appwrite";
import { databases } from "./appwrite";
import { uploadToServer } from "./upload";

export type Ad = {
  id: string;
  name: string;
  smallImages: string[];
  mediumImages: string[];
  largeImages: string[];
  videos: string[];
  views: number;
  uniqueUsers: string[];
  isExpired: boolean;
  endTime: string;
  user: string;
  type: string,
  link?: string
};

const DATABASE_ID = "69617e75000c6c010a75";

const ADS_COLLECTION = "ads";


function mapAd(doc: any): Ad {
  return {
    id: doc.$id,
    name: doc.name,
    smallImages: doc.smallImages || [],
    mediumImages: doc.mediumImages || [],
    largeImages: doc.largeImages || [],
    videos: doc.videos || [],
    views: doc.views ?? 0,
    uniqueUsers: doc.uniqueUsers || [],
    isExpired: doc.isExpired,
    endTime: doc.endTime,
    user: doc.user,
    type: doc.type,
    link: doc?.link
  };
}


export async function uploadAdImage(file: File): Promise<string> {
  return uploadToServer(file, "ads/images", "video");
}

export async function uploadAdVideo(file: File): Promise<string> {
  return uploadToServer(file, "ads/videos", "video");
}


export async function createAd(data: {
  name: string;
  smallImages: string[],
  mediumImages: string[],
  largeImages: string[],
  videos: string[];
  endTime: string;
  user: string;
  type: string;
  link?: string;
}) {
  return databases.createDocument(
    DATABASE_ID,
    ADS_COLLECTION,
    ID.unique(),
    {
      name: data.name,
      smallImages: data.smallImages,
      mediumImages: data.mediumImages,
      largeImages: data.largeImages,
      videos: data.videos,
      views: 0,
      uniqueUsers: [],
      isExpired: false,
      endTime: data.endTime,
      user: data.user,
      type: data.type,
      link: data.link,
    }
  );
}


interface FetchAdsOptions {
  limit?: number;
  cursor?: string; // last document ID for pagination
  filter?: Partial<{ name: string; type: string; isExpired: boolean }>;
}

export async function fetchAds({
  limit = 10,
  cursor,
  filter,
}: FetchAdsOptions = {}): Promise<{ ads: Ad[]; nextCursor?: string }> {
  const queries: any[] = [Query.orderDesc("$createdAt"), Query.limit(limit)];

  // Pagination cursor
  if (cursor) {
    queries.push(Query.cursorAfter(cursor));
  }

  // Filtering
  if (filter) {
    if (filter.name) {
      queries.push(Query.contains("name", filter.name));
    }
    if (filter.type) {
      queries.push(Query.equal("type", filter.type));
    }
    if (filter.isExpired !== undefined) {
      queries.push(Query.equal("isExpired", filter.isExpired));
    }
  }

  const res = await databases.listDocuments(DATABASE_ID, ADS_COLLECTION, queries);

  const ads = res.documents.map(mapAd);

  // Use last document as next cursor if there are more
  const nextCursor = res.documents.length === limit ? res.documents[res.documents.length - 1].$id : undefined;

  return { ads, nextCursor };
}


export type AdItem = {
  id: string;
  fileUrl: string;
  fileType: "image" | "video";
  link?: string,
};

function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}


export async function fetchSmallAds(): Promise<{
  searchAds: AdItem[];
  topAds: AdItem[];
  middleAds: AdItem[];
}> {
  const activeAds = await fetchActiveAds();

  // Step 1: flatten all rectangular creatives
  const formatted: AdItem[] = [];

  for (const ad of activeAds) {
    // Rectangular images
    for (const imageUrl of ad.smallImages) {
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
      searchAds: [],
      topAds: [],
      middleAds: [],
    };
  }

  // Step 2: shuffle once
  const shuffled = shuffle(formatted);

  // Step 3: slice safely
  const pick = (items: AdItem[]) =>
    items.slice(0, Math.min(6, items.length));

  return {
    searchAds: pick(shuffled),
    topAds: pick(shuffle(shuffled)),
    middleAds: pick(shuffle(shuffled)),
  };
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

export async function recordAdView(adId: string, userId?: string) {
  try {
    // Fetch the ad first
    const ad = await fetchAdById(adId);

    // Prepare updated uniqueUsers array
    const uniqueUsers = new Set(ad.uniqueUsers); // use Set to avoid duplicates

    if (userId && !uniqueUsers.has(userId)) {
      uniqueUsers.add(userId);
    }

    // Update the ad
    await editAd(adId, {
      uniqueUsers: Array.from(uniqueUsers),
      views: ad.views + 1,
    });

  } catch (err) {
    console.error("Failed to record ad view", err);
  }
}




export async function fetchActiveAds(): Promise<Ad[]> {
  const res = await databases.listDocuments(
    DATABASE_ID,
    ADS_COLLECTION,
    [
      Query.equal("isExpired", false),
      Query.orderDesc("$createdAt"),
      Query.limit(10),
    ]
  );

  return res.documents.map(mapAd);
}


export async function fetchAdById(adId: string): Promise<Ad> {
  const doc = await databases.getDocument(
    DATABASE_ID,
    ADS_COLLECTION,
    adId
  );

  return mapAd(doc);
}


export async function editAd(
  adId: string,
  data: Partial<{
    name: string;
    smallImages: string[];
    mediumImages: string[];
    largeImages: string[];
    videos: string[];
    endTime: string;
    isExpired: boolean;
    type: string;
    link?: string;
    uniqueUsers?: string[];
    views?: number;
  }>
) {
  try {
    return await databases.updateDocument(
      DATABASE_ID,
      ADS_COLLECTION,
      adId,
      data
    );
  } catch (err) {
    console.error("Failed to update ad", err);
    throw err;
  }
}


export async function deleteAd(adId: string) {
  try {
    return await databases.deleteDocument(
      DATABASE_ID,
      ADS_COLLECTION,
      adId
    );
  } catch (err) {
    console.error("Failed to delete ad", err);
    throw err;
  }
}
