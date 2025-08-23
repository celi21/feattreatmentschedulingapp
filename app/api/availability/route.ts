import { NextRequest, NextResponse } from "next/server";
import { getAvailability } from "@/lib/availability";

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const providerId = searchParams.get('providerId');
  const date = searchParams.get('date');
  if (!providerId || !date) {
    return NextResponse.json({ error: "Missing providerId or date" }, { status: 400 });
  }
  const slots = await getAvailability(providerId, date);
  return NextResponse.json({ slots });
}
