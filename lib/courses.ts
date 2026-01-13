import { ID, Query } from "appwrite";
import { storage, databases } from "./appwrite";

const DATABASE_ID = "69617e75000c6c010a75";
const COLLECTION_ID = "courses";
const POST_COLLECTION = "posts"
const BUCKET_ID = "69617f7300331ea02ff5";

const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;


export type Course = {
  id: string;
  title: string;
  code: string;
  description: string;
  lecturer?: string;
  thumbnailId: string;
  thumbnailUrl: string;
  files?: string[];
};




export function buildFileViewUrl(
  bucketId: string,
  fileId: string
) {
  return `${APPWRITE_ENDPOINT}/storage/buckets/${bucketId}/files/${fileId}/view?project=${PROJECT_ID}&mode=admin`;
}

export async function uploadThumbnail(file: File) {
  const uploaded = await storage.createFile(
    BUCKET_ID,
    ID.unique(),
    file
  );

 const url = buildFileViewUrl(BUCKET_ID, uploaded.$id);

  return {
    fileId: uploaded.$id,
    url: url,
  };
}

export async function createCourse(data: {
  title: string;
  code: string;
  description: string;
  lecturer?: string;
  thumbnailId: string;
  thumbnailUrl: string;
  user: string,
}) {
  return databases.createDocument(
    DATABASE_ID,
    COLLECTION_ID,
    ID.unique(),
    data
  );
}


export function buildDownloadUrlFromView(viewUrl: string) {
  if (!viewUrl) return "";
  return viewUrl.replace("/view", "/download").split("&mode=admin")[0];
}

export async function fetchCourses(): Promise<Course[]> {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_ID,
      [Query.orderDesc("$updatedAt"), Query.limit(15)]
    );

    return response.documents.map((doc: any) => ({
      id: doc.$id,
      title: doc.title,
      code: doc.code,
      description: doc.description,
      lecturer: doc.lecturer,
      thumbnailId: doc.thumbnailId,
      thumbnailUrl: doc.thumbnailUrl,
      files: doc.files || [],
    }));
  } catch (err) {
    console.error("Failed to fetch courses", err);
    return [];
  }
}

export async function fetchCoursesByAdmin(userId: string): Promise<Course[]> {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_ID,
      [Query.orderDesc("$updatedAt"), Query.equal("user", userId)]
    );

    return response.documents.map((doc: any) => ({
      id: doc.$id,
      title: doc.title,
      code: doc.code,
      description: doc.description,
      lecturer: doc.lecturer,
      thumbnailId: doc.thumbnailId,
      thumbnailUrl: doc.thumbnailUrl,
      files: doc.files || [],
    }));
  } catch (err) {
    console.error("Failed to fetch courses", err);
    return [];
  }
}



interface Post {
  id: string;
  images: string[];
  description?: string;
}

export async function fetchPosts(
  courseId: string,
  limit = 5,
  cursor?: string
): Promise<{ posts: Post[]; lastId: string | null }> {
  try {
    const queries = [
      Query.equal("courses", courseId),
      Query.orderDesc("$createdAt"),
      Query.limit(limit),
    ];

    if (cursor) {
      queries.push(Query.cursorAfter(cursor));
    }

    const response = await databases.listDocuments(
      DATABASE_ID,
      POST_COLLECTION,
      queries
    );

    const posts: Post[] = response.documents.map(doc => ({
      id: doc.$id,
      images: doc.images ?? [],
      description: doc.description ?? "",
    }));

    const lastId =
      response.documents.length > 0
        ? response.documents[response.documents.length - 1].$id
        : null;

    return { posts, lastId };
  } catch (err) {
    console.error("Failed to fetch posts", err);
    return { posts: [], lastId: null };
  }
}




async function compressImage(
  file: File,
  maxWidth = 1600,
  quality = 0.75
): Promise<File> {
  const imageBitmap = await createImageBitmap(file);

  const scale = Math.min(1, maxWidth / imageBitmap.width);
  const width = imageBitmap.width * scale;
  const height = imageBitmap.height * scale;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas failed");

  ctx.drawImage(imageBitmap, 0, 0, width, height);

  const blob: Blob = await new Promise((resolve) =>
    canvas.toBlob(
      (b) => resolve(b as Blob),
      "image/jpeg",
      quality
    )
  );

  return new File([blob], file.name.replace(/\.\w+$/, ".jpg"), {
    type: "image/jpeg",
  });
}


export async function uploadImage(file: File) {

  const compressed = await compressImage(file);

  const uploaded = await storage.createFile(
    BUCKET_ID,
    ID.unique(),
    compressed
  );

  return buildFileViewUrl(BUCKET_ID, uploaded.$id);
}


export async function appendFilesToCourse(
  courseId: string,
  newUrls: string[]
) {
  const course = await databases.getDocument(
    DATABASE_ID,
    COLLECTION_ID,
    courseId
  );

  const existingFiles = course.files || [];

  return databases.updateDocument(
    DATABASE_ID,
    COLLECTION_ID,
    courseId,
    {
      files: [...existingFiles, ...newUrls],
    }
  );
}

export async function createPost(
  courseId: string,
  newUrls: string[],
  description: string
) {
  const post = await databases.createDocument(
    DATABASE_ID,
    POST_COLLECTION,
    ID.unique(),
    {
      courses: courseId,
      images: newUrls,
      description: description
    }
  )

  await databases.updateDocument(
    DATABASE_ID,
    COLLECTION_ID,
    courseId,
    {
      lastOperation: "Now"
    }
  )
  return post

}

export async function editPost(
  postId: string,
  data: Partial<{
    description: string
  }>
) {
  try {
    return await databases.updateDocument(DATABASE_ID, POST_COLLECTION, postId, data);
  } catch (err) {
    console.error("Failed to update post", err);
    throw err;
  }
}

export async function fetchCourseById(courseId: string) {
  const course = await databases.getDocument(
    DATABASE_ID,
    COLLECTION_ID,
    courseId
  );

  // files are already URLs, stop reinventing them
  const files = (course.files || []).map((url: string, index: number) => ({
    id: index.toString(),
    previewUrl: url,
  }));

  return {
    ...course,
    files,
  };
}

export async function editCourse(
  courseId: string,
  data: Partial<{
    title: string;
    code: string;
    description: string;
    lecturer: string;
    thumbnailId: string;
    thumbnailUrl: string;
    files: string[];
  }>
) {
  try {
    return await databases.updateDocument(DATABASE_ID, COLLECTION_ID, courseId, data);
  } catch (err) {
    console.error("Failed to update course", err);
    throw err;
  }
}


export async function deleteCourse(courseId: string) {
  try {
    return await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, courseId);
  } catch (err) {
    console.error("Failed to delete course", err);
    alert("Failed To Delete Course")
  }
}


export async function deletePost(postId: string) {
  try {
    return await databases.deleteDocument(DATABASE_ID, POST_COLLECTION, postId);
  } catch (err) {
    console.error("Failed to delete post", err);
    alert("Failed To Delete Post")
  }
}

export async function deleteFileFromPost(postId: string, fileUrl: string) {
  try {
    // Extract file ID from the URL
    const match = fileUrl.match(/files\/([a-zA-Z0-9]+)\/view/);
    if (!match) throw new Error("Invalid file URL");
    const fileId = match[1];

    // Delete file from storage
    await storage.deleteFile(BUCKET_ID, fileId);

    // Get current course files
    const course = await databases.getDocument(DATABASE_ID, POST_COLLECTION, postId);
    const updatedFiles = (course.images || []).filter((url: string) => url !== fileUrl);

    // Update course document
    await databases.updateDocument(DATABASE_ID, POST_COLLECTION, postId, { images: updatedFiles });

    return true;
  } catch (err) {
    console.error("Failed to delete file from post", err);
    throw err;
  }
}

export async function searchCourses(query: string): Promise<Course[]> {
  if (!query.trim()) return [];

  try {
    const [titleResults, codeResults] = await Promise.all([
      databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID,
        [
          Query.search("title", query),
          Query.orderDesc("$updatedAt"),
          Query.limit(20)
        ]
      ),
      databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID,
        [
          Query.search("code", query),
          Query.orderDesc("$updatedAt"),
          Query.limit(20)
        ]
      )
    ]);

    // Merge + deduplicate by ID
    const map = new Map<string, any>();

    [...titleResults.documents, ...codeResults.documents].forEach(doc => {
      map.set(doc.$id, doc);
    });

    return Array.from(map.values()).map((doc: any) => ({
      id: doc.$id,
      title: doc.title,
      code: doc.code,
      description: doc.description,
      lecturer: doc.lecturer,
      thumbnailId: doc.thumbnailId,
      thumbnailUrl: doc.thumbnailUrl,
      files: doc.files || []
    }));

  } catch (err) {
    console.error("Failed to search courses", err);
    return [];
  }
}

