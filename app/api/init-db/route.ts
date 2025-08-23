import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    // Check if we're in production and if this is a first-time setup
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json({ error: "Only available in production" }, { status: 403 });
    }

    // Try to create some test data to verify database connection
    const providerCount = await prisma.provider.count();
    const treatmentCount = await prisma.treatment.count();

    if (providerCount === 0 || treatmentCount === 0) {
      // Create initial data
      await prisma.provider.createMany({
        data: [
          { name: "Alex Rivera", email: "alex@example.com", bio: "Senior therapist", workStartHour: 9, workEndHour: 17 },
          { name: "Sam Kim", email: "sam@example.com", bio: "Skin specialist", workStartHour: 10, workEndHour: 18 },
        ],
        skipDuplicates: true,
      });

      await prisma.treatment.createMany({
        data: [
          { name: "Facial Basic", durationMinutes: 60, priceCents: 6000 },
          { name: "Body Contouring", durationMinutes: 90, priceCents: 12000 },
          { name: "Consultation", durationMinutes: 30, priceCents: 0 },
        ],
        skipDuplicates: true,
      });

      return NextResponse.json({ 
        message: "Database initialized successfully",
        providers: 2,
        treatments: 3
      });
    }

    return NextResponse.json({ 
      message: "Database already initialized",
      providers: providerCount,
      treatments: treatmentCount
    });

  } catch (error) {
    console.error("Database initialization error:", error);
    return NextResponse.json({ 
      error: "Database initialization failed",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
