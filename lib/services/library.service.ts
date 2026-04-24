import { databases } from "@/lib/appwrite/server";
import { ID, Query } from "appwrite";
import { fetchUserLibraryCoursesService } from "./course.service";


const DATABASE_ID = "69617e75000c6c010a75";
const COLLECTION_ID = "library";

type AccessType = "one-time" | "subscription";

export type Library = {
  $id: string,
  user: string,
  oneTime: string,
  subscription: string,
  $createdAt: string,
  $updatedAt: string,
}

export async function addCourseToLibraryService(
  courseId: string,
  userId: string,
  type: AccessType
) {
  try {

    // 1. Find existing library
    const res = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_ID,
      [Query.equal("user", userId)]
    );

    let library = res.documents[0];

    // 2. If no library → create one
    if (!library) {
      const newDoc = await databases.createDocument(
        DATABASE_ID,
        COLLECTION_ID,
        ID.unique(),
        {
          user: userId,
          oneTime: JSON.stringify(type === "one-time" ? [courseId] : []),
          subscription: JSON.stringify(type === "subscription" ? [courseId] : []),
        }
      );

      return newDoc;
    }

    // 3. Parse existing fields safely
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

    // 4. Add course (no duplicates, please)
    if (type === "one-time") {
      if (!oneTime.includes(courseId)) {
        oneTime.push(courseId);
      }
    } else {
      if (!subscription.includes(courseId)) {
        subscription.push(courseId);
      }
    }

    // 5. Update document
    const updated = await databases.updateDocument(
      DATABASE_ID,
      COLLECTION_ID,
      library.$id,
      {
        oneTime: JSON.stringify(oneTime),
        subscription: JSON.stringify(subscription),
      }
    );

    return updated;
  } catch (error) {
    console.error("ADD COURSE TO LIBRARY ERROR:", error);
    throw error;
  }
}


export async function fetchLibraryByUserService(userId: string){
  const res = await databases.listDocuments(
    DATABASE_ID,
    COLLECTION_ID,
    [Query.equal("user", userId)]
  );

  if (res.documents.length === 0) return null;

  return res.documents[0];
}

export async function fetchLibraryCoursesService(user_id: string) {
  const library = await fetchLibraryByUserService(user_id);

  if(!library) return;

  const course_ids = [...(JSON.parse(library?.oneTime || "[]")), ...(JSON.parse(library?.subscription || "[]"))]

  const response = await fetchUserLibraryCoursesService(course_ids)

  return response;
}