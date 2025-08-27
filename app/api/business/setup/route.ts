import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const setupSchema = z.object({
  businessSlug: z.string(),
  description: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  website: z.string().optional(),
  primaryColor: z.string().default('#3B82F6'),
  timezone: z.string().default('America/New_York'),
  services: z.array(z.object({
    name: z.string().min(1),
    durationMinutes: z.number().min(1),
    priceCents: z.number().min(0),
    description: z.string().optional(),
  })).default([]),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const data = setupSchema.parse(body);

    // Verify the user owns this business
    const business = await prisma.business.findFirst({
      where: {
        slug: data.businessSlug,
        ownerId: session.user.id,
      }
    });

    if (!business) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    // Update business and create services in transaction
    await prisma.$transaction(async (tx) => {
      // Update business details
      await tx.business.update({
        where: { id: business.id },
        data: {
          description: data.description,
          phone: data.phone,
          address: data.address,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          website: data.website,
          primaryColor: data.primaryColor,
          timezone: data.timezone,
        }
      });

      // Create services
      if (data.services.length > 0) {
        await tx.service.createMany({
          data: data.services.map(service => ({
            ...service,
            businessId: business.id,
          }))
        });
      }

      // Create default provider (business owner)
      await tx.provider.create({
        data: {
          name: `${session.user.firstName} ${session.user.lastName}`,
          email: session.user.email,
          businessId: business.id,
        }
      });
    });

    return NextResponse.json({
      message: "Business setup completed successfully",
    });

  } catch (error) {
    console.error("Business setup error:", error);
    
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
