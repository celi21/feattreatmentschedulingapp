import { prisma } from "@/lib/prisma";
import BookingForm from "@/components/BookingForm";

export const revalidate = 0;

export default async function Page() {
  const [treatments, providers] = await Promise.all([
    prisma.treatment.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }),
    prisma.provider.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }),
  ]);

  return (
    <div className="grid gap-6">
      <section className="card">
        <h1 className="text-2xl font-semibold mb-2">Book your treatment</h1>
        <p className="text-gray-600">Choose a treatment, pick a provider, and select an available time.</p>
      </section>
      <BookingForm treatments={treatments} providers={providers} />
    </div>
  );
}
