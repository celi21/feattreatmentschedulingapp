import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import dayjs from "dayjs";
import { prisma } from "@/lib/prisma";

export const runtime = 'nodejs';

const Body = z.object({
  treatmentId: z.string().min(1),
  providerId: z.string().min(1),
  start: z.string().datetime(),
  clientName: z.string().min(1),
  clientEmail: z.string().email(),
  notes: z.string().optional()
});

export async function POST(req: NextRequest) {
  // Legacy API route - disabled in favor of the new business-specific appointment system
  // Use /api/business/[businessId]/appointments instead
  return NextResponse.json({ 
    error: "This API endpoint has been deprecated. Use the business-specific appointment system instead." 
  }, { status: 410 });
}
