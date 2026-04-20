import { NextResponse } from "next/server";
import { payForCourseService } from "@/lib/services/payments.service";

export async function POST(req: Request) {
  const body = await req.json();

  const result = await payForCourseService(body);

  return NextResponse.json(result);
}