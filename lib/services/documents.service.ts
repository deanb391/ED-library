import prisma from "@/lib/prisma";
import { randomUUID } from "crypto";

export type DocumentStatus = "pending" | "approved" | "rejected";

export type CourseDocument = {
  $id?: string;
  courses: string;
  user: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  description?: string;
  status: DocumentStatus;
  reviewReason?: string;
  $createdAt?: string;
};

export async function createDocumentService(data: Omit<CourseDocument, "$id" | "status" | "reviewReason" | "$createdAt">) {
  const id = randomUUID();
  const doc = await prisma.document.create({
    data: {
      id,
      courseId: data.courses,
      userId: data.user,
      fileUrl: data.fileUrl,
      fileName: data.fileName,
      fileSize: data.fileSize,
      fileType: data.fileType,
      description: data.description || "",
      status: "pending",
      reviewReason: "",
    },
  });

  try {
    if (data.user) {
      const contributor = await prisma.contributor.findFirst({
        where: { userId: data.user },
      });

      if (contributor && contributor.joinedContest) {
        const perf = await prisma.contestPerformance.findFirst({
          where: { contributorId: contributor.id },
        });

        if (perf) {
          const startDate = new Date("2026-06-29T12:00:00Z");
          if (new Date() >= startDate) {
            const diffTime = Math.max(0, new Date().getTime() - startDate.getTime());
            const dayNumber = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
            const dayKey = `day ${dayNumber}`;

            const uploadsCreated = JSON.parse(perf.uploadsCreated || "{}");
            uploadsCreated[dayKey] = (uploadsCreated[dayKey] || 0) + 1;

            await prisma.contestPerformance.update({
              where: { id: perf.id },
              data: {
                uploadsCreated: JSON.stringify(uploadsCreated),
              },
            });
          }
        }
      }
    }
  } catch (err) {
    console.error("Error updating contest performance on document upload:", err);
  }

  return {
    ...doc,
    courses: doc.courseId || "",
    user: doc.userId || "",
    $id: doc.id,
    $createdAt: doc.createdAt.toISOString(),
    $updatedAt: doc.updatedAt.toISOString(),
  };
}

export async function fetchDocumentsService(courseId: string) {
  const docs = await prisma.document.findMany({
    where: { courseId },
    orderBy: { createdAt: 'desc' },
  });

  return docs.map((d) => ({
    ...d,
    courses: d.courseId || "",
    user: d.userId || "",
    $id: d.id,
    $createdAt: d.createdAt.toISOString(),
    $updatedAt: d.updatedAt.toISOString(),
  }));
}

export async function deleteDocumentService(documentId: string) {
  await prisma.document.delete({
    where: { id: documentId },
  });
  return { success: true };
}
