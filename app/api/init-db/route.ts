import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    console.log("🚀 Starting database initialization...");

    // Try to execute raw SQL to create tables if they don't exist
    try {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "Treatment" (
          "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
          "name" TEXT UNIQUE NOT NULL,
          "durationMinutes" INTEGER NOT NULL,
          "priceCents" INTEGER NOT NULL,
          "isActive" BOOLEAN DEFAULT true,
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;

      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "Provider" (
          "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
          "name" TEXT NOT NULL,
          "email" TEXT UNIQUE NOT NULL,
          "bio" TEXT,
          "isActive" BOOLEAN DEFAULT true,
          "workStartHour" INTEGER DEFAULT 9,
          "workEndHour" INTEGER DEFAULT 17,
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;

      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "Appointment" (
          "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
          "clientName" TEXT NOT NULL,
          "clientEmail" TEXT NOT NULL,
          "notes" TEXT,
          "start" TIMESTAMP NOT NULL,
          "end" TIMESTAMP NOT NULL,
          "status" TEXT DEFAULT 'pending',
          "providerId" TEXT NOT NULL,
          "treatmentId" TEXT NOT NULL,
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;

      console.log("✅ Tables created successfully");
    } catch (error) {
      console.log("Tables might already exist, continuing...");
    }

    // Check if we have data
    let providerCount = 0;
    let treatmentCount = 0;
    
    try {
      providerCount = await prisma.provider.count();
      treatmentCount = await prisma.treatment.count();
    } catch (error) {
      console.log("Error counting records, but continuing...");
    }

    if (providerCount === 0) {
      console.log("🌱 Seeding providers...");
      await prisma.$executeRaw`
        INSERT INTO "Provider" ("id", "name", "email", "bio", "workStartHour", "workEndHour")
        VALUES 
          ('prov1', 'Alex Rivera', 'alex@example.com', 'Senior therapist', 9, 17),
          ('prov2', 'Sam Kim', 'sam@example.com', 'Skin specialist', 10, 18)
        ON CONFLICT ("email") DO NOTHING;
      `;
    }

    if (treatmentCount === 0) {
      console.log("🌱 Seeding treatments...");
      await prisma.$executeRaw`
        INSERT INTO "Treatment" ("id", "name", "durationMinutes", "priceCents")
        VALUES 
          ('treat1', 'Facial Basic', 60, 6000),
          ('treat2', 'Body Contouring', 90, 12000),
          ('treat3', 'Consultation', 30, 0)
        ON CONFLICT ("name") DO NOTHING;
      `;
    }

    // Get final counts
    const finalProviderCount = await prisma.provider.count();
    const finalTreatmentCount = await prisma.treatment.count();

    console.log("✅ Database initialization completed");

    return NextResponse.json({ 
      message: "Database initialized successfully!",
      providers: finalProviderCount,
      treatments: finalTreatmentCount,
      status: "ready"
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

export const POST = GET; // Allow both GET and POST requests
