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
  isOnGoing: boolean;
  session: string;
  level: number;
  department: string;
  price?: string;
  analytics?: string,
  pageCount?: string,
};

export async function uploadThumbnail(file: File) {
  const url = await uploadToServer(file, "courses", "image");
  return {
    fileId: "",
    url:`${url}`,
  };
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

export async function fetchCourse(courseId: string) {
  const res = await fetch(`/api/courses/get?courseId=${encodeURIComponent(courseId)}`);
  return res.json();
}

export async function updateCourse(courseId: string, data: any) {
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

export async function createPost(data: {
  courseId: string;
  images: string[];
  description: string;
}) {
  const res = await fetch("/api/posts/create", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(data),
  });

  return res.json();
}

export async function updatePost(postId: string, data: any) {
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

export async function appendFiles(courseId: string, urls: string[]) {
  const res = await fetch("/api/courses/append-files", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ courseId, urls }),
  });

  return res.json();
}

export async function fetchPosts(courseId: string, cursor?: string) {
  const query = new URLSearchParams({ courseId, cursor: cursor || "" });
  const res = await fetch(`/api/posts/list?${query}`);
  return res.json();
}

export async function fetchAllPosts(courseId: string,) {
  const query = new URLSearchParams({ courseId});
  const res = await fetch(`/api/posts/fetch-all?${query}`);
  return res.json();
}

export async function fetchRecentCourses(): Promise<Course[]> {
  const res = await fetch("/api/courses/recent");
  return res.json();
}

export async function fetchCoursesForUser(user: any): Promise<{
  forYou: Course[];
  others: Course[];
}> {
  const res = await fetch("/api/courses/for-user", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ user }),
  });

  return res.json();
}