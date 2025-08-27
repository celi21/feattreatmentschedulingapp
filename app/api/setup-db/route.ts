import { NextResponse } from "next/server";
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST() {
  try {
    console.log("🚀 Starting database setup...");

    // Push the Prisma schema to create tables
    console.log("📋 Creating database tables...");
    const { stdout, stderr } = await execAsync('npx prisma db push --force-reset');
    
    console.log("Prisma db push output:", stdout);
    if (stderr) {
      console.log("Prisma db push stderr:", stderr);
    }

    // Import the seed script and run it
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    console.log("🌱 Seeding database...");

    // Note: Provider seeding disabled - providers are now business-specific
    // Use the business dashboard to add providers to your business

    // Create initial treatments
    await prisma.treatment.createMany({
      data: [
        { name: "Facial Basic", durationMinutes: 60, priceCents: 6000 },
        { name: "Body Contouring", durationMinutes: 90, priceCents: 12000 },
        { name: "Consultation", durationMinutes: 30, priceCents: 0 },
      ],
      skipDuplicates: true,
    });

    await prisma.$disconnect();

    console.log("✅ Database setup completed successfully!");

    return NextResponse.json({
      message: "Database setup completed successfully",
      tables_created: true,
      data_seeded: true,
      providers: 2,
      treatments: 3
    });

  } catch (error) {
    console.error("❌ Database setup failed:", error);
    return NextResponse.json({
      error: "Database setup failed",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
