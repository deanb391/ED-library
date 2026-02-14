import { ID, Query } from "appwrite";
import { storage, databases } from "./appwrite";
import { uploadToServer } from "./upload";


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
  isOnGoing: Boolean,
  session: string,
  level: Number,
  department: string
};




export function buildFileViewUrl(
  bucketId: string,
  fileId: string
) {
  return `${APPWRITE_ENDPOINT}/storage/buckets/${bucketId}/files/${fileId}/view?project=${PROJECT_ID}&mode=admin`;
}

export async function uploadThumbnail(file: File) {
  // const uploaded = await storage.createFile(
  //   BUCKET_ID,
  //   ID.unique(),
  //   file
  // );

  // const buffer = Buffer.from(await file.arrayBuffer());
  const url = await uploadToServer(file, "courses", "image");

//  const url = buildFileViewUrl(BUCKET_ID, uploaded.$id);

  return {
    fileId: "",
    url:`${url}`,
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
  department: string,
  level: Number,
  session: string,
  isOnGoing?: Boolean
}) {
  return databases.createDocument(
    DATABASE_ID,
    COLLECTION_ID,
    ID.unique(),
    data
  );
}

function mapCourse(doc: any): Course {
  return {
    id: doc.$id,
    title: doc.title,
    code: doc.code,
    description: doc.description,
    lecturer: doc.lecturer,
    thumbnailId: doc.thumbnailId,
    thumbnailUrl: doc.thumbnailUrl,
    files: doc.files || [],
    isOnGoing: doc.isOnGoing,
    session: doc.session,
    department: doc.department,
    level: doc.level,
  };
}

export function buildDownloadUrlFromView(viewUrl: string) {
  if (!viewUrl) return "";
  return viewUrl.replace("/view", "/download").split("&mode=admin")[0];
}

export async function advancedSearchCourses(filters: {
  department?: string;
  level?: string;
  session?: string;
}): Promise<Course[]> {
  const queries = [
    Query.orderDesc("$updatedAt"),
    Query.limit(30),
  ];

  if (filters.department) {
    queries.push(Query.equal("department", filters.department));
  }

  if (filters.level) {
    queries.push(Query.equal("level", Number(filters.level)));
  }

  if (filters.session) {
    queries.push(Query.equal("session", filters.session));
  }

  const res = await databases.listDocuments(
    DATABASE_ID,
    COLLECTION_ID,
    queries
  );

  return res.documents.map(mapCourse);
}


export async function fetchRecentCourses(): Promise<Course[]> {
  return fetchCourses(undefined);
}

export async function fetchCoursesForUser(user: any): Promise<{
  forYou: Course[];
  others: Course[];
}> {
  



  const all = await databases.listDocuments(
    DATABASE_ID,
    COLLECTION_ID,
    [Query.orderDesc("$updatedAt"), Query.limit(100)]
  );

  const forYou: Course[] = [];
  const others: Course[] = [];

  all.documents.forEach((doc: any) => {
    const course = mapCourse(doc);

    if (
      course.department === user.department &&
      course.level === user.level
    ) {
      forYou.push(course);
    } else {
      if (others.length < 11) {
        others.push(course);
      }
      
    }
  });

  return { forYou, others };
}

export async function fetchCourses(
  user?: any,
  isOnGoing?: boolean
): Promise<Course[]> {
  try {
    const queries = [
      Query.orderDesc("$updatedAt"),
      Query.limit(15),
    ];

    if (user?.department) {
      queries.push(Query.equal("department", user.department));
    }

    if (user?.level) {
      queries.push(Query.equal("level", user.level));
    }

    if (typeof isOnGoing === "boolean") {
      queries.push(Query.equal("isOnGoing", isOnGoing));
    }

    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_ID,
      queries
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
      isOnGoing: doc.isOnGoing,
      session: doc.session,
      department: doc.department,
      level: doc.level,
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
      user: doc.user,
      isOnGoing: doc.isOnGoing,
      session: doc.session,
      level: doc.level,
      department: doc.department
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

export async function fetchPostsAsc(
  courseId: string,
  limit = 10,
  cursor?: string
): Promise<{ posts: Post[]; lastId: string | null }> {
  try {
    const queries = [
      Query.equal("courses", courseId),
      Query.orderAsc("$createdAt"),
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
    console.error("Failed to fetch posts asc", err);
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

  // const uploaded = await storage.createFile(
  //   BUCKET_ID,
  //   ID.unique(),
  //   compressed
  // );

  const url = await uploadToServer(compressed, "posts", "image");


  return url;
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

  return ({
      id: course.$id,
      title: course.title,
      code: course.code,
      description: course.description,
      lecturer: course.lecturer,
      thumbnailId: course.thumbnailId,
      thumbnailUrl: course.thumbnailUrl,
      files: course.files || [],
      user: course.user,
      isOnGoing: course.isOnGoing,
      session: course.session,
      department: course.department,
      level: course.level
    })
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

export async function searchCourses(
  query: string,
  user?: any
): Promise<Course[]> {
  if (!query.trim()) return [];

  try {
    const baseQueries = [
      Query.orderDesc("$updatedAt"),
      Query.limit(30),
    ];

    // if (user?.department) {
    //   baseQueries.push(Query.equal("department", user.department));
    // }

    // if (user?.level) {
    //   baseQueries.push(Query.equal("level", user.level));
    // }

    const [titleResults, codeResults, departmentResult] = await Promise.all([
      databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID,
        [Query.search("title", query), ...baseQueries]
      ),
      databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID,
        [Query.search("code", query), ...baseQueries]
      ),
      databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID,
        [Query.search("department", query), ...baseQueries]
      ),
    ]);

    const map = new Map<string, any>();

    [...titleResults.documents, ...codeResults.documents, ...departmentResult.documents].forEach(doc => {
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
      files: doc.files || [],
      isOnGoing: doc.isOnGoing,
      session: doc.session,
      department: doc.department,
      level: doc.level,
    }));

  } catch (err) {
    console.error("Failed to search courses", err);
    return [];
  }
}



export async function fetchCoursesByDepartment({
  department,
  limit = 5,
  offset = 0,
}: {
  department: string;
  limit?: number;
  offset?: number;
}) {
  const res = await databases.listDocuments(
    DATABASE_ID,
    COLLECTION_ID,
    [
      Query.equal("department", department),
      Query.limit(limit),
      Query.offset(offset),
      Query.orderDesc("$createdAt"),
    ]
  );

  return {
    courses: res.documents,
    total: res.total,
  };
}
