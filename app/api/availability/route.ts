import { NextRequest, NextResponse } from "next/server";
import { getAvailability } from "@/lib/availability";

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  // Legacy API route - disabled in favor of the new business-specific availability system
  // Use /api/business/[businessId]/availability instead
  return NextResponse.json({ 
    error: "This API endpoint has been deprecated. Use the business-specific availability system instead." 
  }, { status: 410 });
}
