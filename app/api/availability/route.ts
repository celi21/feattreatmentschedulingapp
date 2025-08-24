import { NextRequest, NextResponse } from "next/server";
import { getAvailability } from "@/lib/availability";

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const providerId = searchParams.get('providerId');
    const date = searchParams.get('date');
    
    console.log('Availability request:', { providerId, date });
    
    if (!providerId || !date) {
      return NextResponse.json({ error: "Missing providerId or date" }, { status: 400 });
    }
    
    const slots = await getAvailability(providerId, date);
    console.log('Generated slots:', slots.length);
    
    return NextResponse.json({ slots });
  } catch (error) {
    console.error('Availability API error:', error);
    return NextResponse.json({ 
      error: "Failed to get availability",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
