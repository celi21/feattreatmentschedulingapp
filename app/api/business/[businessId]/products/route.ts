import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const productSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  priceCents: z.number().min(0),
  sku: z.string().optional(),
  isDigital: z.boolean().default(false),
  stockQuantity: z.number().nullable().optional(),
  imageUrl: z.string().optional(),
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
      }
    });

    if (!business) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const data = productSchema.parse(body);

    const product = await prisma.product.create({
      data: {
        ...data,
        businessId: business.id,
        isActive: true,
      }
    });

    return NextResponse.json({
      message: "Product created successfully",
      product,
    });

  } catch (error) {
    console.error("Product creation error:", error);
    
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
