import { NextResponse } from "next/server";
import { apisController } from "@/server/apis/apis.controller";

export function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const r = apisController.list(searchParams);
  return NextResponse.json(r.body, { status: r.status });
}
