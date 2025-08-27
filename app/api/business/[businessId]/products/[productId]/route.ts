import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const productUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  priceCents: z.number().min(0).optional(),
  sku: z.string().optional(),
  isDigital: z.boolean().optional(),
  stockQuantity: z.number().nullable().optional(),
  imageUrl: z.string().optional(),
  isActive: z.boolean().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { businessId: string; productId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify business ownership and product exists
    const product = await prisma.product.findFirst({
      where: {
        id: params.productId,
        businessId: params.businessId,
        business: {
          ownerId: session.user.id,
        }
      }
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const data = productUpdateSchema.parse(body);

    const updatedProduct = await prisma.product.update({
      where: { id: params.productId },
      data,
    });

    return NextResponse.json({
      message: "Product updated successfully",
      product: updatedProduct,
    });

  } catch (error) {
    console.error("Product update error:", error);
    
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { businessId: string; productId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify business ownership and product exists
    const product = await prisma.product.findFirst({
      where: {
        id: params.productId,
        businessId: params.businessId,
        business: {
          ownerId: session.user.id,
        }
      }
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Check if product has pending orders
    const orderCount = await prisma.orderItem.count({
      where: {
        productId: params.productId,
        order: {
          status: {
            in: ['PENDING', 'PAID', 'PROCESSING'],
          }
        }
      }
    });

    if (orderCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete product with pending orders" },
        { status: 409 }
      );
    }

    await prisma.product.delete({
      where: { id: params.productId },
    });

    return NextResponse.json({
      message: "Product deleted successfully",
    });

  } catch (error) {
    console.error("Product deletion error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
