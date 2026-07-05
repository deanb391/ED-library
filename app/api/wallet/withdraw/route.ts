import { NextResponse } from "next/server";
import { withdrawWalletService } from "@/lib/services/wallet.service";
import { getAuthenticatedUser } from "@/lib/appwrite/auth";

export async function POST(req: Request) {
  try {
    const { userId, amount } = await req.json();

    const user = await getAuthenticatedUser(req);
    if (!user || user.$id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const wallet = await withdrawWalletService(userId, amount);

    return NextResponse.json({ wallet });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}