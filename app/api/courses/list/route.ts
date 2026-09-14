import { NextRequest } from "next/server";
import { CourseController } from "@/controllers/course.controller";

export async function GET(req: NextRequest) {
  return CourseController.list(req);
}