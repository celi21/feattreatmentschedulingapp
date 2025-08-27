import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PublicBookingPage from "@/components/PublicBookingPage";

interface PageProps {
  params: {
    slug: string;
  };
}

export default async function BookingPage({ params }: PageProps) {
  const business = await prisma.business.findUnique({
    where: {
      slug: params.slug,
      isActive: true,
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
      providers: {
        where: { isActive: true },
        orderBy: { name: 'asc' }
      }
    }
  });

  if (!business) {
    notFound();
  }

  return <PublicBookingPage business={business} />;
}

export async function generateStaticParams() {
  const businesses = await prisma.business.findMany({
    where: { isActive: true },
    select: { slug: true }
  });

  return businesses.map((business) => ({
    slug: business.slug,
  }));
}
