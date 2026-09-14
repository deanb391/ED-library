import { NextRequest } from "next/server";
import { AdController } from "@/controllers/ad.controller";

export async function GET(req: NextRequest) {
  return AdController.listAds(req);
}