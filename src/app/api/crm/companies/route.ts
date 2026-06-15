import { NextResponse } from "next/server";
import { crmController } from "@/server/crm/crm.controller";

export function GET() {
  const r = crmController.companies();
  return NextResponse.json(r.body, { status: r.status });
}
