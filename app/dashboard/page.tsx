import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import DashboardOverview from "@/components/DashboardOverview";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const businesses = await prisma.business.findMany({
    where: {
      ownerId: session.user.id,
    },
    include: {
      services: {
        where: { isActive: true },
        orderBy: { name: 'asc' }
      },
      products: {
        where: { isActive: true },
        orderBy: { name: 'asc' }
      },
      appointments: {
        orderBy: { start: 'desc' },
        take: 5,
        include: {
          service: true,
          provider: true,
        }
      },
      _count: {
        select: {
          services: { where: { isActive: true } },
          products: { where: { isActive: true } },
          appointments: true,
        }
      }
    }
  });

  if (businesses.length === 0) {
    redirect('/onboarding');
  }

  const business = businesses[0]; // For now, handle single business

  // Convert Date objects to strings for the component
  const businessForComponent = {
    ...business,
    appointments: business.appointments.map(apt => ({
      ...apt,
      start: apt.start.toISOString(),
      end: apt.end.toISOString(),
    }))
  };

  return (
    <DashboardLayout business={business} user={session.user}>
      <DashboardOverview business={businessForComponent} />
    </DashboardLayout>
  );
}
