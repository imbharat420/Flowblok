import { NextResponse } from "next/server";
import { pagesController } from "@/server/pages/pages.controller";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const r = await pagesController.list(searchParams);
  return NextResponse.json(r.body, { status: r.status });
}
