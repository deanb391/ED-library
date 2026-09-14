import prisma from "@/lib/prisma";
import { fetchUserLibraryCoursesService } from "./course.service";
import { randomUUID } from "crypto";

type AccessType = "one-time" | "subscription";

export type Library = {
  $id: string;
  user: string;
  oneTime: string;
  subscription: string;
  $createdAt: string;
  $updatedAt: string;
};

export function mapLibrary(doc: any): Library {
  if (!doc) return null as any;
  return {
    $id: doc.id || doc.$id,
    user: doc.userId || doc.user || "",
    oneTime: doc.oneTime || "[]",
    subscription: doc.subscription || "[]",
    $createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : (doc.$createdAt || new Date().toISOString()),
    $updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : (doc.$updatedAt || new Date().toISOString()),
  };
}

export async function addCourseToLibraryService(
  courseId: string,
  userId: string,
  type: AccessType
) {
  try {
    let library = await prisma.library.findFirst({
      where: { userId },
    });

    if (!library) {
      const id = randomUUID();
      const newDoc = await prisma.library.create({
        data: {
          id,
          userId,
          oneTime: JSON.stringify(type === "one-time" ? [courseId] : []),
          subscription: JSON.stringify(type === "subscription" ? [courseId] : []),
        },
      });

      return mapLibrary(newDoc);
    }

    let oneTime: string[] = [];
    let subscription: string[] = [];

    try {
      oneTime = library.oneTime ? JSON.parse(library.oneTime) : [];
      if (!Array.isArray(oneTime)) oneTime = [];
    } catch {
      oneTime = [];
    }

    try {
      subscription = library.subscription
        ? JSON.parse(library.subscription)
        : [];
      if (!Array.isArray(subscription)) subscription = [];
    } catch {
      subscription = [];
    }

    if (type === "one-time") {
      if (!oneTime.includes(courseId)) {
        oneTime.push(courseId);
      }
    } else {
      if (!subscription.includes(courseId)) {
        subscription.push(courseId);
      }
    }

    const updated = await prisma.library.update({
      where: { id: library.id },
      data: {
        oneTime: JSON.stringify(oneTime),
        subscription: JSON.stringify(subscription),
      },
    });

    return mapLibrary(updated);
  } catch (error) {
    console.error("ADD COURSE TO LIBRARY ERROR:", error);
    throw error;
  }
}

export async function addSubscriptionsCoursesToLibraryService(
  courseIds: string[],
  userId: string
) {
  const { handleSubscriptionService } = await import("./subscriptions.service");

  try {
    const results = [];
    for (const id of courseIds) {
      await addCourseToLibraryService(id, userId, "subscription");
      const sub = await handleSubscriptionService(userId, id);
      results.push(sub);
    }
    return results;
  } catch (error) {
    console.error("ADD SUBSCRIPTIONS TO LIBRARY ERROR:", error);
    throw error;
  }
}

export async function fetchLibraryByUserService(userId: string) {
  const doc = await prisma.library.findFirst({
    where: { userId },
  });

  if (!doc) return null;

  return mapLibrary(doc);
}

export async function fetchLibraryCoursesService(user_id: string) {
  const library = await fetchLibraryByUserService(user_id);

  if (!library) return [];

  const course_ids = [...(JSON.parse(library?.oneTime || "[]")), ...(JSON.parse(library?.subscription || "[]"))];

  const response = await fetchUserLibraryCoursesService(course_ids);

  return response;
}