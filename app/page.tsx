import { prisma } from "@/lib/prisma";
import BookingForm from "@/components/BookingForm";

export const revalidate = 0;

export default async function Page() {
  try {
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
  } catch (error) {
    // Database tables don't exist yet
    return (
      <div className="grid gap-6">
        <section className="card">
          <h1 className="text-2xl font-semibold mb-2">Treatment Scheduler</h1>
          <p className="text-gray-600 mb-4">Welcome! Your app is deployed successfully.</p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 mb-2">Database Setup Required</h3>
            <p className="text-yellow-700 mb-3">
              The database needs to be initialized. Click the button below to set up your database tables and sample data.
            </p>
            <a 
              href="/api/init-db" 
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Initialize Database
            </a>
          </div>
        </section>
      </div>
    );
  }
}
