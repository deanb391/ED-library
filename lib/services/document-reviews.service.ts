import prisma from "@/lib/prisma";
import { getLfuCache, setLfuCache, invalidateLfuCache } from "@/lib/lfu-cache";
import { randomUUID } from "crypto";

export type DocumentReviewStatus = "pending" | "approved" | "rejected";

export type DocumentReviewRequest = {
  $id?: string;
  documents: string;
  courses: string;
  contributors: string;
  complaint: string;
  status: DocumentReviewStatus;
  adminReason?: string;
  $createdAt?: string;
};

export async function createDocumentReviewRequestService(data: { documents: string, courses: string, contributors: string, complaint: string }) {
  const id = randomUUID();
  const req = await prisma.documentReview.create({
    data: {
      id,
      documentId: data.documents,
      courseId: data.courses,
      contributorId: data.contributors,
      complaint: data.complaint,
      status: "pending",
      adminReason: "",
    },
  });
  await invalidateLfuCache("admin:document_reviews", "all");
  return {
    ...req,
    documents: req.documentId || "",
    courses: req.courseId || "",
    contributors: req.contributorId || "",
    $id: req.id,
    $createdAt: req.createdAt.toISOString(),
    $updatedAt: req.updatedAt.toISOString(),
  };
}

export async function fetchDocumentReviewRequestsService() {
  const cached = await getLfuCache<any>("admin:document_reviews", "all");
  if (cached) return cached;

  const docs = await prisma.documentReview.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const populated = await Promise.all(docs.map(async (doc) => {
    let documentDetails = null;
    let courseDetails = null;
    let userDetails = null;

    if (doc.documentId) {
      try { documentDetails = await prisma.document.findUnique({ where: { id: doc.documentId } }); } catch (e) { }
    }
    if (doc.courseId) {
      try { courseDetails = await prisma.course.findUnique({ where: { id: doc.courseId } }); } catch (e) { }
    }
    if (doc.contributorId) {
      try { userDetails = await prisma.user.findUnique({ where: { id: doc.contributorId } }); } catch (e) { }
    }

    return {
      ...doc,
      documents: doc.documentId,
      courses: doc.courseId,
      contributors: doc.contributorId,
      $id: doc.id,
      $createdAt: doc.createdAt.toISOString(),
      $updatedAt: doc.updatedAt.toISOString(),
      documentDetails,
      courseDetails,
      userDetails
    };
  }));

  await setLfuCache("admin:document_reviews", "all", populated, 20);

  return populated;
}

export async function resolveDocumentReviewRequestService(requestId: string, status: "approved" | "rejected", adminReason: string, documentId: any) {
  const getRelId = (val: any) => {
    if (!val) return null;
    if (Array.isArray(val)) return val[0]?.id || val[0]?.$id || val[0] || null;
    if (typeof val === 'object') return val.id || val.$id;
    return val;
  };

  const docIdStr = getRelId(documentId);

  const existing = await prisma.documentReview.findUnique({ where: { id: requestId } });
  if (!existing) throw new Error("Document review request not found");

  const reviewReq = await prisma.documentReview.update({
    where: { id: requestId },
    data: {
      status,
      adminReason,
    },
  });

  const finalDocIdStr = docIdStr || existing.documentId;

  if (finalDocIdStr) {
    if (status === "approved") {
      await prisma.document.update({
        where: { id: finalDocIdStr },
        data: {
          status: "approved",
          reviewReason: "Approved by Admin: " + adminReason,
        },
      });
    } else if (status === "rejected") {
      await prisma.document.update({
        where: { id: finalDocIdStr },
        data: {
          status: "rejected",
          reviewReason: "Rejected by Admin: " + adminReason,
        },
      });
    }
  }

  await invalidateLfuCache("admin:document_reviews", "all");

  return {
    ...reviewReq,
    documents: reviewReq.documentId,
    courses: reviewReq.courseId,
    contributors: reviewReq.contributorId,
    $id: reviewReq.id,
    $createdAt: reviewReq.createdAt.toISOString(),
    $updatedAt: reviewReq.updatedAt.toISOString(),
  };
}
