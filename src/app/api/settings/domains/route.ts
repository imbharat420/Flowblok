// HTTP adapter for the domains collection — delegates to the controller.
import { NextRequest, NextResponse } from "next/server";
import { settingsController } from "@/server/settings/settings.controller";
import { requireCapability } from "@/server/guard";

export function GET() {
  // The snapshot already carries domains; expose them standalone for convenience.
  const result = settingsController.snapshot();
  const body = result.body as { domains: unknown };
  return NextResponse.json(body.domains, { status: result.status });
}

export async function POST(req: NextRequest) {
  const gate = await requireCapability("manage_settings");
  if (!gate.ok) return NextResponse.json(gate.body, { status: gate.status });
  const body = await req.json().catch(() => null);
  const result = settingsController.addDomain(body);
  return NextResponse.json(result.body, { status: result.status });
}
