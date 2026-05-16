import { uploadToServer } from "../upload";

const jsonHeaders = {
  "Content-Type": "application/json",
};

export type Course = {
  id: string;
  title: string;
  code: string;
  description: string;
  lecturer?: string;
  university?: string;
  thumbnailId: string;
  thumbnailUrl: string;
  files?: string[];
  user?: any;
  isOnGoing: boolean;
  session: string;
  level: number;
  department: string;
  price?: string;
  analytics?: {
    avg_rating: number;
    reached: string[];
    visits_per_day: { mon: number; tue: number; wed: number; thu: number; fri: number; sat: number; sun: number };
  };
  pageCount: number;
};

export type Post = {
  id: string;
  images: string[];
  description: string;
};

export type PaginatedPosts = {
  posts: Post[];
  lastId: string | null;
};

const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

export function buildFileViewUrl(
  bucketId: string,
  fileId: string
) {
  return `${APPWRITE_ENDPOINT}/storage/buckets/${bucketId}/files/${fileId}/view?project=${PROJECT_ID}&mode=admin`;
}

export function buildDownloadUrlFromView(viewUrl: string) {
  if (!viewUrl) return "";
  return viewUrl.replace("/view", "/download").split("&mode=admin")[0];
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

export async function uploadThumbnail(file: File) {
  const url = await uploadToServer(file, "courses", "image");
  return {
    fileId: "",
    url: `${url}`,
  };
}

export async function uploadImage(file: File) {
  const compressed = await compressImage(file);
  const url = await uploadToServer(compressed, "posts", "image");
  return url;
}


export async function createCourse(data: any) {
  const res = await fetch("/api/courses/create", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(data),
  });

  return res.json();
}

export async function fetchCourses(user?: any,
  isOnGoing?: boolean
): Promise<Course[]> {
  const query = new URLSearchParams();

  if (user?.department) query.append("department", user.department);
  if (user?.level) query.append("level", user.level);
  if (typeof isOnGoing === "boolean") {
    query.append("isOnGoing", String(isOnGoing));
  }
  const res = await fetch(`/api/courses/list?${query}`);
  return res.json();
}

export async function fetchCourseById(courseId: string): Promise<Course> {
  const res = await fetch(`/api/courses/get?courseId=${encodeURIComponent(courseId)}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch course: ${res.statusText}`);
  }
  return res.json();
}

export async function editCourse(courseId: string, data: any) {
  const res = await fetch("/api/courses/update", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ courseId, data }),
  });

  return res.json();
}

export async function deleteCourse(courseId: string) {
  const res = await fetch("/api/courses/delete", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ courseId }),
  });

  return res.json();
}

export async function fetchCoursesByAdmin(userId: string) {
  const res = await fetch(`/api/courses/admin?userId=${encodeURIComponent(userId)}`);
  return res.json();
}

export async function advancedSearchCourses(filters: any) {
  const query = new URLSearchParams(filters);
  const res = await fetch(`/api/courses/advanced-search?${query}`);
  return res.json();
}

export async function fetchCoursesByDepartment(
  department: string,
  limit = 10,
  offset = 0
) {
  const query = new URLSearchParams({
    department,
    limit: limit.toString(),
    offset: offset.toString(),
  });

  const res = await fetch(`/api/courses/department?${query}`);
  return res.json();
}

export async function createPost(courseId: string, images: string[], description: string) {
  const res = await fetch("/api/posts/create", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ courseId, images, description }),
  });

  return res.json();
}

export async function editPost(postId: string, data: any) {
  const res = await fetch("/api/posts/update", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ postId, data }),
  });

  return res.json();
}

export async function deletePost(postId: string) {
  const res = await fetch("/api/posts/delete", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ postId }),
  });

  return res.json();
}

export async function searchCourses(q: string) {
  const res = await fetch(`/api/courses/search?q=${encodeURIComponent(q)}`);
  return res.json();
}

export async function appendFilesToCourse(courseId: string, urls: string[]) {
  const res = await fetch("/api/courses/append-files", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ courseId, urls }),
  });

  return res.json();
}

export async function fetchPosts(courseId: string, limit: number | string = 5, cursor?: string): Promise<PaginatedPosts> {
  const query = new URLSearchParams({ courseId, cursor: cursor || "", order: "desc", limit: String(limit) });
  const res = await fetch(`/api/posts/list?${query}`);
  return res.json();
}

export async function fetchPostsAsc(courseId: string, limit: number | string = 10, cursor?: string): Promise<PaginatedPosts> {
  const query = new URLSearchParams({ courseId, cursor: cursor || "", order: "asc", limit: String(limit) });
  const res = await fetch(`/api/posts/list?${query}`);
  return res.json();
}

export async function fetchAllPosts(courseId: string): Promise<PaginatedPosts> {
  const query = new URLSearchParams({ courseId });
  const res = await fetch(`/api/posts/fetch-all?${query}`);
  return res.json();
}

export async function fetchRecentCourses(): Promise<Course[]> {
  const res = await fetch("/api/courses/recent");
  return res.json();
}

export async function fetchCoursesForUser(user: any): Promise<
  Course[]
> {
  const res = await fetch("/api/courses/for-user", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ user }),
  });

  return res.json();
}


export async function fetchPopularCourses(limit = 10, offset = 0) {
  const query = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });

  const res = await fetch(`/api/courses/popular?${query}`);
  return res.json();
}

export async function fetchNewCourses(limit = 10, offset = 0) {
  const query = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });

  const res = await fetch(`/api/courses/new?${query}`);
  return res.json();
}

export async function fetchFreeCourses(limit = 10, offset = 0) {
  const query = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });

  const res = await fetch(`/api/courses/free?${query}`);
  return res.json();
}

export async function fetchRelatedCourse(user: any): Promise<Course[]> {
  const res = await fetch("/api/courses/for-user", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ user }),
  });

  return res.json();
}

export async function deleteFileFromPost(postId: string, fileUrl: string) {
  const res = await fetch("/api/posts/delete-file", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ postId, fileUrl }),
  });

  return res.json();
}

export async function recordCourseVisit(courseId: string, userId: string) {
  const res = await fetch("/api/courses/record-visit", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ courseId, userId }),
  });

  return res.json();
}