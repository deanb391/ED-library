// lib/services/course.service.ts
import prisma from "@/lib/prisma";
import { getLfuCache, setLfuCache, clearLfuCacheNamespace } from "@/lib/lfu-cache";

function mapCourse(doc: any) {
  if (!doc) return null;
  return {
    id: doc.id,
    $id: doc.id,
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
    user: doc.user || doc.userId,
    userId: doc.userId,
    analytics: typeof doc.analytics === "string" ? JSON.parse(doc.analytics) : doc.analytics,
    pageCount: doc.pageCount || 0,
    rating: doc.rating,
    status: doc.status || "live",
    isFree: doc.isFree,
    $createdAt: doc.createdAt ? doc.createdAt.toISOString() : new Date().toISOString(),
    $updatedAt: doc.updatedAt ? doc.updatedAt.toISOString() : new Date().toISOString(),
  };
}

/* ================= COURSES ================= */

export async function createCourseService(data: any) {
  const generatedId = `crs_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  const doc = await prisma.course.create({
    data: {
      id: generatedId,
      title: data.title,
      code: data.code,
      description: data.description || null,
      lecturer: data.lecturer || null,
      thumbnailId: data.thumbnailId || null,
      thumbnailUrl: data.thumbnailUrl || null,
      files: Array.isArray(data.files) ? data.files : [],
      lastOperation: data.lastOperation || null,
      userId: data.user || data.userId || null,
      session: data.session || null,
      department: data.department || null,
      level: data.level ? parseInt(data.level, 10) : null,
      isOnGoing: data.isOnGoing !== false,
      price: data.price ? String(data.price) : null,
      university: data.university || null,
      analytics: typeof data.analytics === "object" ? JSON.stringify(data.analytics) : data.analytics || null,
      pageCount: data.pageCount ? parseInt(data.pageCount, 10) : 0,
      isFree: data.isFree !== undefined ? !!data.isFree : null,
      rating: data.rating ? parseFloat(data.rating) : null,
      status: data.status || "live",
    },
  });

  // Contest points tracking
  try {
    if (doc.userId) {
      const contributor = await prisma.contributor.findUnique({
        where: { userId: doc.userId },
      });

      if (contributor && contributor.joinedContest) {
        const perf = await prisma.contestPerformance.findFirst({
          where: { contributorId: contributor.id },
        });

        if (perf) {
          const startDate = new Date("2026-06-29T12:00:00Z");
          const now = new Date();
          if (now >= startDate) {
            const diffTime = Math.max(0, now.getTime() - startDate.getTime());
            const dayNumber = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
            const dayKey = `day ${dayNumber}`;

            const points = perf.coursesPoints ? JSON.parse(perf.coursesPoints) : {};
            points[dayKey] = (points[dayKey] || 0) + 1;

            await prisma.contestPerformance.update({
              where: { id: perf.id },
              data: { coursesPoints: JSON.stringify(points) },
            });
          }
        }
      }
    }
  } catch (err) {
    console.error("Error updating contest performance on course creation:", err);
  }

  await clearLfuCacheNamespace("course:lists");
  return mapCourse(doc)!;
}

export async function fetchCoursesService(params?: any) {
  const where: any = {};
  if (params?.department) where.department = { equals: params.department, mode: "insensitive" };
  if (params?.level) where.level = parseInt(params.level, 10);
  if (params?.isOnGoing !== undefined && params?.isOnGoing !== null) {
    where.isOnGoing = params.isOnGoing === true || params.isOnGoing === "true";
  }

  const courses = await prisma.course.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    take: params?.limit ? parseInt(params.limit, 10) : 30,
    skip: params?.offset ? parseInt(params.offset, 10) : 0,
  });

  return courses.map(mapCourse);
}

export async function fetchCoursesByAdminService(userId: string) {
  const courses = await prisma.course.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });
  return courses.map(mapCourse);
}

export async function fetchCourseByIdService(courseId: string) {
  const cached = await getLfuCache<any>("course:details", courseId);
  if (cached) return cached;

  const doc = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          avatar: true,
          email: true,
        },
      },
    },
  });

  if (!doc) {
    const error: any = new Error("Course not found");
    error.code = 404;
    throw error;
  }

  const mapped = mapCourse(doc);
  await setLfuCache("course:details", courseId, mapped, 200);
  return mapped;
}

export async function fetchCoursesByDepartmentService(
  departmentOrParams: string | { department: string; level?: number; limit?: number; offset?: number },
  levelParam?: number
) {
  let department = "";
  let level: number | undefined = undefined;
  let limit = 30;
  let offset = 0;

  if (typeof departmentOrParams === "string") {
    department = departmentOrParams;
    level = levelParam;
  } else if (departmentOrParams && typeof departmentOrParams === "object") {
    department = departmentOrParams.department;
    level = departmentOrParams.level;
    if (departmentOrParams.limit) limit = departmentOrParams.limit;
    if (departmentOrParams.offset) offset = departmentOrParams.offset;
  }

  const where: any = {
    department: { equals: department, mode: "insensitive" },
  };
  if (level) where.level = level;

  const courses = await prisma.course.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    take: limit,
    skip: offset,
  });
  return courses.map(mapCourse);
}

export async function advancedSearchCoursesService(params: {
  department?: string;
  level?: string | number;
  session?: string;
}) {
  const where: any = {};
  if (params.department) where.department = { equals: params.department, mode: "insensitive" };
  if (params.level) where.level = parseInt(String(params.level), 10);
  if (params.session) where.session = { equals: params.session, mode: "insensitive" };

  const courses = await prisma.course.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    take: 50,
  });
  return courses.map(mapCourse);
}

export async function fetchForYouCoursesService(userId: string) {
  try {
    const userDoc = await prisma.user.findUnique({ where: { id: userId } });
    const department = userDoc?.department;
    const level = userDoc?.level;

    const where: any = {};
    if (department) where.department = { equals: department, mode: "insensitive" };
    if (level) where.level = level;

    const courses = await prisma.course.findMany({
      where,
      orderBy: [{ rating: "desc" }, { updatedAt: "desc" }],
      take: 30,
    });

    if (courses.length === 0) {
      return fetchPopularCoursesService(20);
    }
    return courses.map(mapCourse);
  } catch (err) {
    console.error("fetchForYouCoursesService error:", err);
    return fetchPopularCoursesService(20);
  }
}

export async function searchCoursesService(query: string) {
  const courses = await prisma.course.findMany({
    where: {
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { code: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { lecturer: { contains: query, mode: "insensitive" } },
      ],
    },
    orderBy: { updatedAt: "desc" },
    take: 30,
  });
  return courses.map(mapCourse);
}

export async function fetchRecentCoursesService(limit = 10) {
  const courses = await prisma.course.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return courses.map(mapCourse);
}

export async function fetchNewCoursesService(limit = 10, offset = 0) {
  const courses = await prisma.course.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
  });
  return courses.map(mapCourse);
}

export async function fetchPopularCoursesService(limit = 10, offset = 0) {
  const courses = await prisma.course.findMany({
    orderBy: [{ rating: "desc" }, { updatedAt: "desc" }],
    take: limit,
    skip: offset,
  });
  return courses.map(mapCourse);
}

export async function fetchUserLibraryCoursesService(courseIds: string[]) {
  if (!courseIds || courseIds.length === 0) return [];
  const courses = await prisma.course.findMany({
    where: { id: { in: courseIds } },
  });
  return courses.map(mapCourse);
}

export async function fetchFreeCoursesService(limit = 10, offset = 0) {
  const courses = await prisma.course.findMany({
    where: { isFree: true },
    orderBy: { updatedAt: "desc" },
    take: limit,
    skip: offset,
  });
  return courses.map(mapCourse);
}

export async function updateCourseService(courseId: string, data: any) {
  const updated = await prisma.course.update({
    where: { id: courseId },
    data: {
      title: data.title !== undefined ? data.title : undefined,
      code: data.code !== undefined ? data.code : undefined,
      description: data.description !== undefined ? data.description : undefined,
      lecturer: data.lecturer !== undefined ? data.lecturer : undefined,
      thumbnailId: data.thumbnailId !== undefined ? data.thumbnailId : undefined,
      thumbnailUrl: data.thumbnailUrl !== undefined ? data.thumbnailUrl : undefined,
      files: Array.isArray(data.files) ? data.files : undefined,
      session: data.session !== undefined ? data.session : undefined,
      department: data.department !== undefined ? data.department : undefined,
      level: data.level ? parseInt(data.level, 10) : undefined,
      isOnGoing: data.isOnGoing !== undefined ? !!data.isOnGoing : undefined,
      price: data.price !== undefined ? String(data.price) : undefined,
      university: data.university !== undefined ? data.university : undefined,
      status: data.status !== undefined ? data.status : undefined,
      rating: data.rating !== undefined ? parseFloat(data.rating) : undefined,
      pageCount: data.pageCount !== undefined ? parseInt(data.pageCount, 10) : undefined,
      analytics: typeof data.analytics === "object" ? JSON.stringify(data.analytics) : data.analytics,
    },
  });

  await clearLfuCacheNamespace("course:lists");
  return mapCourse(updated);
}

export async function deleteCourseService(courseId: string) {
  await prisma.course.delete({
    where: { id: courseId },
  });
  await clearLfuCacheNamespace("course:lists");
  return { success: true };
}

export async function recordCourseVisitService(courseId: string, userId?: string) {
  try {
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) return null;

    let analytics: any = {};
    try {
      analytics = course.analytics ? JSON.parse(course.analytics) : {};
    } catch {
      analytics = {};
    }

    analytics.visits = (analytics.visits || 0) + 1;
    if (userId) {
      analytics.uniqueVisitors = analytics.uniqueVisitors || [];
      if (!analytics.uniqueVisitors.includes(userId)) {
        analytics.uniqueVisitors.push(userId);
      }
    }

    const updated = await prisma.course.update({
      where: { id: courseId },
      data: { analytics: JSON.stringify(analytics) },
    });

    return mapCourse(updated);
  } catch (error) {
    console.error("Failed to record course visit:", error);
    return null;
  }
}

export async function appendFilesToCourseService(courseId: string, newFiles: string[]) {
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) throw new Error("Course not found");

  const existingFiles = course.files || [];
  const updatedFiles = [...existingFiles, ...newFiles];

  const updated = await prisma.course.update({
    where: { id: courseId },
    data: { files: updatedFiles },
  });

  return mapCourse(updated);
}

/* ================= POSTS ================= */

export async function fetchPostsByCourseService(courseId: string) {
  const posts = await prisma.post.findMany({
    where: { courseId },
    orderBy: { createdAt: "desc" },
  });
  return posts.map(p => ({
    id: p.id,
    $id: p.id,
    description: p.description,
    images: p.images,
    courseId: p.courseId,
    $createdAt: p.createdAt.toISOString(),
    $updatedAt: p.updatedAt.toISOString(),
  }));
}

export async function fetchPostsService(courseId: string, options?: any) {
  const posts = await prisma.post.findMany({
    where: { courseId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  const mapped = posts.map(p => ({
    id: p.id,
    $id: p.id,
    description: p.description,
    images: p.images,
    courseId: p.courseId,
    $createdAt: p.createdAt.toISOString(),
    $updatedAt: p.updatedAt.toISOString(),
  }));
  return {
    documents: mapped,
    posts: mapped,
    total: mapped.length,
  };
}

export async function fetchAllPostsService(courseId: string, options?: any) {
  return fetchPostsService(courseId, options);
}

export async function createPostService(data: any) {
  const generatedId = `pst_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  const post = await prisma.post.create({
    data: {
      id: generatedId,
      description: data.description || null,
      images: Array.isArray(data.images) ? data.images : [],
      courseId: data.courses || data.courseId || null,
    },
  });

  return {
    id: post.id,
    $id: post.id,
    description: post.description,
    images: post.images,
    courseId: post.courseId,
    $createdAt: post.createdAt.toISOString(),
    $updatedAt: post.updatedAt.toISOString(),
  };
}

export async function updatePostService(postId: string, data: any) {
  const updated = await prisma.post.update({
    where: { id: postId },
    data: {
      description: data.description !== undefined ? data.description : undefined,
      images: Array.isArray(data.images) ? data.images : undefined,
      courseId: data.courses || data.courseId !== undefined ? (data.courses || data.courseId) : undefined,
    },
  });

  return {
    id: updated.id,
    $id: updated.id,
    description: updated.description,
    images: updated.images,
    courseId: updated.courseId,
    $createdAt: updated.createdAt.toISOString(),
    $updatedAt: updated.updatedAt.toISOString(),
  };
}

export async function deletePostService(postId: string) {
  await prisma.post.delete({
    where: { id: postId },
  });
  return { success: true };
}

export async function deleteFileFromPostService(postId: string, fileUrl: string) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
  });
  if (!post) return false;

  const images = (post.images || []).filter(img => img !== fileUrl);
  await prisma.post.update({
    where: { id: postId },
    data: { images },
  });
  return true;
}