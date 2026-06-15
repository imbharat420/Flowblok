// GET /api/components — the block registry for the page builder.
import { NextResponse } from "next/server";
import { componentsService } from "@/server/components/components.service";

export function GET() {
  return NextResponse.json({ items: componentsService.list() });
}
