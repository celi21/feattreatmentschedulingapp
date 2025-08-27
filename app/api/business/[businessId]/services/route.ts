import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const serviceSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  durationMinutes: z.number().min(15),
  priceCents: z.number().min(0),
  category: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { businessId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify business ownership
    const business = await prisma.business.findFirst({
      where: {
        id: params.businessId,
        ownerId: session.user.id,
      },
      include: {
        _count: {
          select: {
            services: { where: { isActive: true } }
          }
        }
      }
    });

    if (!business) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    // Check service limits for Free tier
    if (business.subscriptionTier === 'FREE' && business._count.services >= 8) {
      return NextResponse.json(
        { error: "Service limit reached. Upgrade to add more services." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const data = serviceSchema.parse(body);

    const service = await prisma.service.create({
      data: {
        ...data,
        businessId: business.id,
        isActive: true,
      }
    });

    return NextResponse.json({
      message: "Service created successfully",
      service,
    });

  } catch (error) {
    console.error("Service creation error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
