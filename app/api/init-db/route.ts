import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    console.log("🚀 Starting database initialization...");

    // First, try to push the schema to create tables if they don't exist
    try {
      console.log("📋 Checking database connection...");
      await prisma.$connect();
      console.log("✅ Database connection successful");
    } catch (error) {
      console.error("❌ Database connection failed:", error);
      return NextResponse.json({ 
        error: "Database connection failed",
        details: error instanceof Error ? error.message : "Unknown error"
      }, { status: 500 });
    }

    // Check if tables exist by trying to count providers
    let providerCount = 0;
    let treatmentCount = 0;
    
    try {
      providerCount = await prisma.provider.count();
      treatmentCount = await prisma.treatment.count();
      console.log(`📊 Current data: ${providerCount} providers, ${treatmentCount} treatments`);
    } catch (error) {
      console.log("ℹ️ Tables don't exist yet, this is expected for first deployment");
      return NextResponse.json({ 
        error: "Database tables not created yet",
        message: "Run 'npx prisma db push' first to create tables",
        details: error instanceof Error ? error.message : "Unknown error"
      }, { status: 500 });
    }

    if (providerCount === 0 || treatmentCount === 0) {
      console.log("🌱 Seeding database with initial data...");
      
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

      console.log("✅ Database seeded successfully");
      return NextResponse.json({ 
        message: "Database initialized and seeded successfully",
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
    console.error("❌ Database initialization error:", error);
    return NextResponse.json({ 
      error: "Database initialization failed",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// Also allow GET requests for easier testing
export async function GET() {
  try {
    await prisma.$connect();
    const providerCount = await prisma.provider.count();
    const treatmentCount = await prisma.treatment.count();
    
    return NextResponse.json({ 
      message: "Database status check",
      providers: providerCount,
      treatments: treatmentCount,
      status: "connected"
    });
  } catch (error) {
    return NextResponse.json({ 
      error: "Database connection failed",
      details: error instanceof Error ? error.message : "Unknown error",
      status: "disconnected"
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
