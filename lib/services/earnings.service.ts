import prisma from "@/lib/prisma";
import { randomUUID } from "crypto";

export async function createEarningService(data: {
  amount: number;
  description: string;
  courses?: string;
  type: string;
  contributorId: string;
}) {
  const id = randomUUID();
  const doc = await prisma.earning.create({
    data: {
      id,
      amount: data.amount,
      description: data.description,
      courses: data.courses || "",
      type: data.type,
      contributorId: data.contributorId,
    },
  });

  return {
    ...doc,
    contributors: doc.contributorId || "",
    $id: doc.id,
    $createdAt: doc.createdAt.toISOString(),
    $updatedAt: doc.updatedAt.toISOString(),
  };
}

export async function fetchContributorEarningsService(contributorId: string) {
  const docs = await prisma.earning.findMany({
    where: { contributorId },
    orderBy: { createdAt: 'desc' },
  });

  return docs.map((doc) => ({
    ...doc,
    contributors: doc.contributorId || "",
    $id: doc.id,
    $createdAt: doc.createdAt.toISOString(),
    $updatedAt: doc.updatedAt.toISOString(),
  }));
}