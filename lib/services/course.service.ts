// lib/services/course.service.ts

import { ID, Query } from "appwrite";
import { databases } from "@/lib/appwrite/server";

const DATABASE_ID = "69617e75000c6c010a75";
const COURSE_COLLECTION = "courses";
const POST_COLLECTION = "posts";

function mapCourse(doc: any) {
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
    user: doc.user,
  };
}

/* ================= COURSES ================= */

export async function createCourseService(data: any) {
  return databases.createDocument(
    DATABASE_ID,
    COURSE_COLLECTION,
    ID.unique(),
    data
  );
}

export async function fetchCoursesService(queries: any[]) {
  const res = await databases.listDocuments(
    DATABASE_ID,
    COURSE_COLLECTION,
    queries
  );

  return res.documents.map(mapCourse);
}

export async function fetchCoursesByAdminService(userId: string) {
  const res = await databases.listDocuments(
    DATABASE_ID,
    COURSE_COLLECTION,
    [
      Query.equal("user", userId),
      Query.orderDesc("$updatedAt"),
    ]
  );

  return res.documents.map(mapCourse);
}

export async function fetchCourseByIdService(courseId: string) {
  const doc = await databases.getDocument(
    DATABASE_ID,
    COURSE_COLLECTION,
    courseId
  );

  return mapCourse(doc);
}

export async function updateCourseService(courseId: string, data: any) {
  return databases.updateDocument(
    DATABASE_ID,
    COURSE_COLLECTION,
    courseId,
    data
  );
}

export async function deleteCourseService(courseId: string) {
  return databases.deleteDocument(
    DATABASE_ID,
    COURSE_COLLECTION,
    courseId
  );
}

/* ================= ADVANCED ================= */

export async function advancedSearchCoursesService(filters: any) {
  const queries: any[] = [
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
    COURSE_COLLECTION,
    queries
  );

  return res.documents.map(mapCourse);
}

export async function searchCoursesService(query: string) {
  const base = [
    Query.orderDesc("$updatedAt"),
    Query.limit(30),
  ];

  const [title, code, dept] = await Promise.all([
    databases.listDocuments(DATABASE_ID, COURSE_COLLECTION, [
      Query.search("title", query),
      ...base,
    ]),
    databases.listDocuments(DATABASE_ID, COURSE_COLLECTION, [
      Query.search("code", query),
      ...base,
    ]),
    databases.listDocuments(DATABASE_ID, COURSE_COLLECTION, [
      Query.search("department", query),
      ...base,
    ]),
  ]);

  const map = new Map();

  [...title.documents, ...code.documents, ...dept.documents].forEach((doc: any) => {
    map.set(doc.$id, doc);
  });

  return Array.from(map.values()).map(mapCourse);
}

export async function fetchCoursesByDepartmentService({
  department,
  limit,
  offset,
}: any) {
  const res = await databases.listDocuments(
    DATABASE_ID,
    COURSE_COLLECTION,
    [
      Query.equal("department", department),
      Query.limit(limit),
      Query.offset(offset),
      Query.orderDesc("$createdAt"),
    ]
  );

  return {
    courses: res.documents.map(mapCourse),
    total: res.total,
  };
}

/* ================= POSTS ================= */

export async function fetchPostsService(queries: any[]) {
  const res = await databases.listDocuments(
    DATABASE_ID,
    POST_COLLECTION,
    queries
  );

  return {
    posts: res.documents.map((doc: any) => ({
      id: doc.$id,
      images: doc.images ?? [],
      description: doc.description ?? "",
    })),
    lastId:
      res.documents.length > 0
        ? res.documents[res.documents.length - 1].$id
        : null,
  };
}

export async function createPostService(data: any) {
  return databases.createDocument(
    DATABASE_ID,
    POST_COLLECTION,
    ID.unique(),
    data
  );
}

export async function updatePostService(postId: string, data: any) {
  return databases.updateDocument(
    DATABASE_ID,
    POST_COLLECTION,
    postId,
    data
  );
}

export async function deletePostService(postId: string) {
  return databases.deleteDocument(
    DATABASE_ID,
    POST_COLLECTION,
    postId
  );
}

/* ================= SPECIAL ================= */

export async function appendFilesToCourseService(
  courseId: string,
  newUrls: string[]
) {
  const course = await databases.getDocument(
    DATABASE_ID,
    COURSE_COLLECTION,
    courseId
  );

  const existing = course.files || [];

  return databases.updateDocument(
    DATABASE_ID,
    COURSE_COLLECTION,
    courseId,
    {
      files: [...existing, ...newUrls],
    }
  );
}

export async function fetchRecentCoursesService() {
  const queries = [
    Query.orderDesc("$updatedAt"),
    Query.limit(15),
  ];

  return fetchCoursesService(queries);
}

export async function fetchCoursesForUserService(user: any) {
  const all = await databases.listDocuments(
    DATABASE_ID,
    COURSE_COLLECTION,
    [Query.orderDesc("$updatedAt"), Query.limit(100)]
  );

  const forYou: any[] = [];
  const others: any[] = [];

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