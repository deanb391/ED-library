import { NextResponse } from "next/server";
import { verifyAccount } from "@/lib/services/withdrawals.service";

export async function POST(req: Request) {
  const body = await req.json();

  const result = await verifyAccount(body);

  return NextResponse.json(result);
}