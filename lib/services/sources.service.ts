import prisma from "@/lib/prisma";
import { randomUUID } from "crypto";

export type Source = {
  $id?: string;
  id?: string;
  name: string;
  clickCount: number;
  signUpCount: number;
  contributorCount: number;
};

function mapSource(doc: any): Source {
  if (!doc) return null as any;
  return {
    $id: doc.id,
    id: doc.id,
    name: doc.name || "",
    clickCount: doc.clickCount || 0,
    signUpCount: doc.signUpCount || 0,
    contributorCount: doc.contributorCount || 0,
  };
}

export async function getSourceByName(name: string): Promise<Source | null> {
  try {
    const doc = await prisma.source.findFirst({
      where: { name },
    });
    if (!doc) return null;
    return mapSource(doc);
  } catch (err) {
    console.error("Error fetching source:", err);
    return null;
  }
}

export async function createSource(name: string): Promise<Source> {
  const id = randomUUID();
  const doc = await prisma.source.create({
    data: {
      id,
      name,
      clickCount: 0,
      signUpCount: 0,
      contributorCount: 0,
    },
  });
  return mapSource(doc);
}

export async function trackSourceClickService(name: string): Promise<Source> {
  let source = await getSourceByName(name);
  if (!source) {
    source = await createSource(name);
  }
  
  const doc = await prisma.source.update({
    where: { id: source.id || source.$id! },
    data: {
      clickCount: (source.clickCount || 0) + 1,
    },
  });
  return mapSource(doc);
}

export async function trackSourceSignupService(name: string): Promise<Source | null> {
  let source = await getSourceByName(name);
  if (!source) {
    source = await createSource(name);
  }
  
  const doc = await prisma.source.update({
    where: { id: source.id || source.$id! },
    data: {
      signUpCount: (source.signUpCount || 0) + 1,
    },
  });
  return mapSource(doc);
}

export async function trackSourceContributorService(name: string): Promise<Source | null> {
  let source = await getSourceByName(name);
  if (!source) {
    source = await createSource(name);
  }
  
  const doc = await prisma.source.update({
    where: { id: source.id || source.$id! },
    data: {
      contributorCount: (source.contributorCount || 0) + 1,
    },
  });
  return mapSource(doc);
}
