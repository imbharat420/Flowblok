import { NextResponse } from "next/server";
import { pagesController } from "@/server/pages/pages.controller";

export function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const r = pagesController.list(searchParams);
  return NextResponse.json(r.body, { status: r.status });
}
