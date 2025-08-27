import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import ProductsManager from "@/components/ProductsManager";

export default async function ProductsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const business = await prisma.business.findFirst({
    where: {
      ownerId: session.user.id,
    },
    include: {
      products: {
        orderBy: { name: 'asc' }
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

  if (!business) {
    redirect('/onboarding');
  }

  return (
    <DashboardLayout business={business} user={session.user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600">Manage your product catalog and inventory</p>
        </div>
        
        <ProductsManager business={business} />
      </div>
    </DashboardLayout>
  );
}
