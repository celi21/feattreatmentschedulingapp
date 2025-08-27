import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // Legacy seed disabled - use the new business dashboard to set up your data
  // Providers and services are now business-specific in the new schema
  
  const treatments = await prisma.treatment.createMany({
    data: [
      { name: "Facial Basic", durationMinutes: 60, priceCents: 6000 },
      { name: "Body Contouring", durationMinutes: 90, priceCents: 12000 },
      { name: "Consultation", durationMinutes: 30, priceCents: 0 },
    ],
    skipDuplicates: true,
  });

  console.log("Legacy treatments seeded for backward compatibility.");
}

main().finally(async () => prisma.$disconnect());
