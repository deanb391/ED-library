// app/api/courses/list/route.ts

import { NextRequest, NextResponse } from "next/server";
import { fetchCoursesService } from "@/lib/services/course.service";
import { Query } from "appwrite";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const department = searchParams.get("department");
  const level = searchParams.get("level");
  const isOnGoing = searchParams.get("isOnGoing");

  const queries: any[] = [
    Query.orderDesc("$updatedAt"),
    Query.limit(15),
  ];

  if (department) queries.push(Query.equal("department", department));
  if (level) queries.push(Query.equal("level", Number(level)));
  if (isOnGoing !== null)
    queries.push(Query.equal("isOnGoing", isOnGoing === "true"));

  const courses = await fetchCoursesService(queries);

  return NextResponse.json(courses);
}