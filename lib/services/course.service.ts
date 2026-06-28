// lib/services/course.service.ts

import { ID, Query } from "appwrite";
import { databases, storage } from "@/lib/appwrite/server";
import { trackEvent } from "@/lib/analytics/trackEvent";

const DATABASE_ID = "69617e75000c6c010a75";
const COURSE_COLLECTION = "courses";
const POST_COLLECTION = "posts";
const BUCKET_ID = "69617f7300331ea02ff5";

function mapCourse(doc: any) {
  return {
    id: doc.$id,
    title: doc.title,
    code: doc.code,
    description: doc.description,
    lecturer: doc.lecturer,
    university: doc.university || "",
    thumbnailId: doc.thumbnailId,
    thumbnailUrl: doc.thumbnailUrl,
    files: doc.files || [],
    isOnGoing: doc.isOnGoing,
    session: doc.session,
    department: doc.department,
    level: doc.level,
    price: doc.price,
    user: doc.user,
    analytics: typeof doc.analytics === "string" ? JSON.parse(doc.analytics) : doc.analytics,
    pageCount: doc?.pageCount || 0,
  };
}

/* ================= COURSES ================= */

export async function createCourseService(data: any) {
  const doc = await databases.createDocument(
    DATABASE_ID,
    COURSE_COLLECTION,
    ID.unique(),
    data
  );

  // --- Contest Performance Tracking ---
  try {
    const courseAuthorUserId = data.user;
    if (courseAuthorUserId) {
      const contRes = await databases.listDocuments(DATABASE_ID, "contributors", [
        Query.equal("user", courseAuthorUserId)
      ]);

      if (contRes.documents.length > 0) {
        const contributor = contRes.documents[0];

        if (contributor.joinedContest) {
          const perfRes = await databases.listDocuments(DATABASE_ID, "contest_performance", [
            Query.equal("contributors", contributor.$id)
          ]);

          if (perfRes.documents.length > 0) {
            const perf = perfRes.documents[0];

            const startDate = new Date("2026-06-26T00:00:00Z");
            if (new Date() >= startDate) {
              const diffTime = Math.max(0, new Date().getTime() - startDate.getTime());
              const dayNumber = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
              const dayKey = `day ${dayNumber}`;

              const coursesPoints = JSON.parse(perf.coursesPoints || "{}");
              coursesPoints[dayKey] = (coursesPoints[dayKey] || 0) + 1;

              await databases.updateDocument(DATABASE_ID, "contest_performance", perf.$id, {
                coursesPoints: JSON.stringify(coursesPoints)
              });
            }
          }
        }
      }
    }
  } catch (err) {
    console.error("Error updating contest performance on course creation:", err);
  }

  return doc;
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
    Query.equal("status", "live"),
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

  const [title, code, dept, university] = await Promise.all([
    databases.listDocuments(DATABASE_ID, COURSE_COLLECTION, [
      Query.search("title", query),
      Query.equal("status", "live"),
      ...base,
    ]),
    databases.listDocuments(DATABASE_ID, COURSE_COLLECTION, [
      Query.search("code", query),
      Query.equal("status", "live"),
      ...base,
    ]),
    databases.listDocuments(DATABASE_ID, COURSE_COLLECTION, [
      Query.search("department", query),
      Query.equal("status", "live"),
      ...base,
    ]),
    databases.listDocuments(DATABASE_ID, COURSE_COLLECTION, [
      Query.search("university", query),
      Query.equal("status", "live"),
      ...base,
    ]),
  ]);

  const map = new Map();

  [...title.documents, ...code.documents, ...dept.documents, ...university.documents].forEach((doc: any) => {
    map.set(doc.$id, doc);
  });

  trackEvent("SEARCH_PERFORMED", {
    distinctId: "anonymous",
    metadata: { query, resultsCount: map.size }
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
      Query.equal("status", "live"),
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

export async function fetchAllPostsService(queries: any[]) {
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

export async function fetchPostsAscService(courseId: string, limit = 10, cursor?: string) {
  const queries = [
    Query.equal("courses", courseId),
    Query.orderAsc("$createdAt"),
    Query.limit(limit),
  ];

  if (cursor) {
    queries.push(Query.cursorAfter(cursor));
  }

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

export async function createPostService(data: { courses: string; images: string[]; description: string }) {
  const post = await databases.createDocument(
    DATABASE_ID,
    POST_COLLECTION,
    ID.unique(),
    data
  );

  const course = await fetchCourseByIdService(data.courses);

  await updateCourseService(data.courses, {
    pageCount: (course.pageCount || 0) + data.images.length,
    lastOperation: "Now",
  });

  return post;
}

export async function updatePostService(postId: string, data: any) {
  if (data.images) {
    const oldPost = await databases.getDocument(DATABASE_ID, POST_COLLECTION, postId);
    const oldImagesCount = (oldPost.images || []).length;
    const newImagesCount = data.images.length;
    const diff = newImagesCount - oldImagesCount;

    if (diff !== 0) {
      const courseId = typeof oldPost.courses === 'string' ? oldPost.courses : (oldPost.courses?.$id || oldPost.courses);
      if (courseId) {
        const course = await fetchCourseByIdService(courseId);
        await updateCourseService(courseId, {
          pageCount: Math.max(0, (course.pageCount || 0) + diff)
        });
      }
    }
  }

  return databases.updateDocument(
    DATABASE_ID,
    POST_COLLECTION,
    postId,
    data
  );
}

export async function deletePostService(postId: string) {
  const post = await databases.getDocument(DATABASE_ID, POST_COLLECTION, postId);
  const imagesCount = (post.images || []).length;
  const courseId = typeof post.courses === 'string' ? post.courses : (post.courses?.$id || post.courses);

  if (courseId) {
    const course = await fetchCourseByIdService(courseId);
    await updateCourseService(courseId, {
      pageCount: Math.max(0, (course.pageCount || 0) - imagesCount)
    });
  }

  return databases.deleteDocument(
    DATABASE_ID,
    POST_COLLECTION,
    postId
  );
}

export async function deleteFileFromPostService(postId: string, fileUrl: string) {
  const post = await databases.getDocument(DATABASE_ID, POST_COLLECTION, postId);

  // Extract file ID from URL
  const match = fileUrl.match(/files\/([a-zA-Z0-9]+)\/view/);
  if (match) {
    const fileId = match[1];
    try {
      await storage.deleteFile(BUCKET_ID, fileId);
    } catch (err) {
      console.error("Storage deletion failed:", err);
    }
  }

  const updatedFiles = (post.images || []).filter((url: string) => url !== fileUrl);

  await databases.updateDocument(DATABASE_ID, POST_COLLECTION, postId, { images: updatedFiles });

  const courseId = typeof post.courses === 'string' ? post.courses : (post.courses?.$id || post.courses);
  if (courseId) {
    const course = await fetchCourseByIdService(courseId);
    await updateCourseService(courseId, {
      pageCount: Math.max(0, (course.pageCount || 0) - 1)
    });
  }

  return true;
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

export async function fetchForYouCoursesService(user: any, limit = 10, offset = 0) {
  const res = await databases.listDocuments(
    DATABASE_ID,
    COURSE_COLLECTION,
    [
      Query.equal("department", user.department),
      Query.equal("level", user.level),
      Query.limit(limit),
      Query.offset(offset),
      Query.orderDesc("$updatedAt"),
      Query.equal("status", "live"),
    ]
  );

  return res.documents.map(mapCourse);
}

/* ================= ANALYTICS ================= */

export async function recordCourseVisitService(courseId: string, userId: string) {
  // Fetch the course document
  const courseDoc = await databases.getDocument(
    DATABASE_ID,
    COURSE_COLLECTION,
    courseId
  );

  // analytics is stored as a JSON string in Appwrite — always parse it
  const defaultAnalytics = {
    avg_rating: 0,
    reached: [] as string[],
    visits_per_day: { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 },
  };

  let analytics = defaultAnalytics;

  if (courseDoc.analytics) {
    try {
      const parsed = typeof courseDoc.analytics === "string"
        ? JSON.parse(courseDoc.analytics)
        : courseDoc.analytics;

      // Merge parsed value with defaults so missing keys are always present
      analytics = {
        avg_rating: parsed.avg_rating ?? 0,
        reached: Array.isArray(parsed.reached) ? parsed.reached : [],
        visits_per_day: {
          ...defaultAnalytics.visits_per_day,
          ...(parsed.visits_per_day ?? {}),
        },
      };
    } catch {
      // Corrupted analytics string — fall back to defaults
      analytics = defaultAnalytics;
    }
  }

  // Update reached: add userId if not already present
  if (!analytics.reached.includes(userId)) {
    analytics.reached.push(userId);
  }

  // Update visits_per_day: increment current day
  const now = new Date();
  const day = new Intl.DateTimeFormat("en-NG", { weekday: "short" })
    .format(now)
    .toLowerCase(); // 'mon', 'tue', etc.

  if (day in analytics.visits_per_day) {
    (analytics.visits_per_day as Record<string, number>)[day] += 1;

    // Reset other days to 0 on Monday (weekly reset)
    if (day === "mon") {
      analytics.visits_per_day.tue = 0;
      analytics.visits_per_day.wed = 0;
      analytics.visits_per_day.thu = 0;
      analytics.visits_per_day.fri = 0;
      analytics.visits_per_day.sat = 0;
      analytics.visits_per_day.sun = 0;
    }
  }

  // Persist updated analytics back as a JSON string
  await databases.updateDocument(
    DATABASE_ID,
    COURSE_COLLECTION,
    courseId,
    { analytics: JSON.stringify(analytics) }
  );

  trackEvent("COURSE_VIEWED", {
    distinctId: userId,
    userId: userId,
    metadata: { courseId, title: courseDoc.title }
  });

  // --- Contest Performance Tracking ---
  try {
    const courseAuthorUserId = typeof courseDoc.user === "string" ? courseDoc.user : courseDoc.user?.$id;
    if (courseAuthorUserId && courseAuthorUserId !== userId) {
      // Fetch Contributor
      const contRes = await databases.listDocuments(DATABASE_ID, "contributors", [
        Query.equal("user", courseAuthorUserId)
      ]);

      if (contRes.documents.length > 0) {
        const contributor = contRes.documents[0];

        if (contributor.joinedContest) {
          // Fetch ContestPerformance
          const perfRes = await databases.listDocuments(DATABASE_ID, "contest_performance", [
            Query.equal("contributors", contributor.$id)
          ]);

          if (perfRes.documents.length > 0) {
            const perf = perfRes.documents[0];

            const startDate = new Date("2026-06-26T00:00:00Z");
            if (new Date() >= startDate) {
              const diffTime = Math.max(0, new Date().getTime() - startDate.getTime());
              const dayNumber = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
              const dayKey = `day ${dayNumber}`;

              const usersReachedIds = JSON.parse(perf.usersReachedIds || "{}");
              const uniqueUsersReached = JSON.parse(perf.uniqueUsersReached || "{}");
              const returningUsers = JSON.parse(perf.returningUsers || "{}");

              const todaysIds: string[] = usersReachedIds[dayKey] || [];

              if (!todaysIds.includes(userId)) {
                todaysIds.push(userId);
                usersReachedIds[dayKey] = todaysIds;

                // Check if user is returning (appeared in any previous day)
                let isReturning = false;
                for (const [key, ids] of Object.entries(usersReachedIds)) {
                  if (key !== dayKey && (ids as string[]).includes(userId)) {
                    isReturning = true;
                    break;
                  }
                }

                if (isReturning) {
                  returningUsers[dayKey] = (returningUsers[dayKey] || 0) + 1;
                }

                uniqueUsersReached[dayKey] = todaysIds.length;

                await databases.updateDocument(DATABASE_ID, "contest_performance", perf.$id, {
                  usersReachedIds: JSON.stringify(usersReachedIds),
                  uniqueUsersReached: JSON.stringify(uniqueUsersReached),
                  returningUsers: JSON.stringify(returningUsers)
                });
              }
            }
          }
        }
      }
    }
  } catch (err) {
    console.error("Error updating contest performance on visit:", err);
  }
}



export async function fetchNewCoursesService(limit = 10, offset = 0) {
  const res = await databases.listDocuments(
    DATABASE_ID,
    COURSE_COLLECTION,
    [
      Query.orderDesc("$createdAt"),
      Query.limit(limit),
      Query.offset(offset),
      Query.equal("status", "live"),
    ]
  );

  return res.documents.map(mapCourse);
}

export async function fetchPopularCoursesService(limit = 10, offset = 0) {
  const res = await databases.listDocuments(
    DATABASE_ID,
    COURSE_COLLECTION,
    [
      Query.orderDesc("rating"), // crude for now, we’ll refine later
      Query.limit(limit),
      Query.offset(offset),
      Query.equal("status", "live"),
    ]
  );

  return res.documents.map(mapCourse);
}

export async function fetchFreeCoursesService(limit = 10, offset = 0) {
  const res = await databases.listDocuments(
    DATABASE_ID,
    COURSE_COLLECTION,
    [
      Query.equal("isFree", true),
      Query.limit(limit),
      Query.offset(offset),
      Query.orderDesc("$createdAt"),
      Query.equal("status", "live"),
    ]
  );

  return res.documents.map(mapCourse);
}

export async function fetchRelatedCoursesService({
  department,
  level,
  limit = 10,
  offset = 0,
}: any) {
  const res = await databases.listDocuments(
    DATABASE_ID,
    COURSE_COLLECTION,
    [
      Query.equal("department", department),
      Query.equal("level", level),
      Query.limit(limit),
      Query.offset(offset),
      Query.orderDesc("$updatedAt"),
      Query.equal("status", "live"),
    ]
  );

  return res.documents.map(mapCourse);
}

export async function fetchUserLibraryCoursesService(courseIds: string[]) {
  if (!courseIds.length) return [];

  const res = await databases.listDocuments(
    DATABASE_ID,
    COURSE_COLLECTION,
    [
      Query.equal("$id", courseIds),
      Query.equal("status", "live"),
    ]
  );

  return res.documents.map(mapCourse);
}