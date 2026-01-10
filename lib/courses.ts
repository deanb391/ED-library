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

export async function fetchPosts(course_id: string) {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      POST_COLLECTION,
      [Query.equal("courses", course_id), Query.orderDesc("$createdAt")]
    );

    return response.documents
  } catch (err) {
    console.error("Failed to fetch posts", err);
    return [];
  }
}


export async function uploadImage(file: File) {
  const uploaded = await storage.createFile(
    BUCKET_ID,
    ID.unique(),
    file
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
      lastOperation: Date.now()
    }
  )
  return post

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


export async function deleteFileFromCourse(courseId: string, fileUrl: string) {
  try {
    // Extract file ID from the URL
    const match = fileUrl.match(/files\/([a-zA-Z0-9]+)\/view/);
    if (!match) throw new Error("Invalid file URL");
    const fileId = match[1];

    // Delete file from storage
    await storage.deleteFile(BUCKET_ID, fileId);

    // Get current course files
    const course = await databases.getDocument(DATABASE_ID, COLLECTION_ID, courseId);
    const updatedFiles = (course.files || []).filter((url: string) => url !== fileUrl);

    // Update course document
    await databases.updateDocument(DATABASE_ID, COLLECTION_ID, courseId, { files: updatedFiles });

    return true;
  } catch (err) {
    console.error("Failed to delete file from course", err);
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

