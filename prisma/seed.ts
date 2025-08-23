import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const providers = await prisma.provider.createMany({
    data: [
      { name: "Alex Rivera", email: "alex@example.com", bio: "Senior therapist", workStartHour: 9, workEndHour: 17 },
      { name: "Sam Kim", email: "sam@example.com", bio: "Skin specialist", workStartHour: 10, workEndHour: 18 },
    ],
    skipDuplicates: true,
  });

  const treatments = await prisma.treatment.createMany({
    data: [
      { name: "Facial Basic", durationMinutes: 60, priceCents: 6000 },
      { name: "Body Contouring", durationMinutes: 90, priceCents: 12000 },
      { name: "Consultation", durationMinutes: 30, priceCents: 0 },
    ],
    skipDuplicates: true,
  });

  console.log("Seed complete.");
}

main().finally(async () => prisma.$disconnect());
