import { NextResponse } from "next/server";
import { createEarningService } from "@/lib/services/earnings.service";

export async function POST(req: Request) {
  const body = await req.json();

  const earning = await createEarningService(body);

  return NextResponse.json({ earning });
}