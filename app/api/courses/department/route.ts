import { NextRequest, NextResponse } from "next/server";
import { fetchCoursesByDepartmentService } from "@/lib/services/course.service";

export async function GET(req: NextRequest) {
  const department = req.nextUrl.searchParams.get("department");
  const limit = Number(req.nextUrl.searchParams.get("limit") ?? 10);
  const offset = Number(req.nextUrl.searchParams.get("offset") ?? 0);

  if (!department) {
    return NextResponse.json({ error: "department is required" }, { status: 400 });
  }

  const result = await fetchCoursesByDepartmentService({
    department,
    limit,
    offset,
  });

  return NextResponse.json(result);
}
