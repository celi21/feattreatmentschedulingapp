import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const serviceUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  durationMinutes: z.number().min(15).optional(),
  priceCents: z.number().min(0).optional(),
  category: z.string().optional(),
  isActive: z.boolean().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { businessId: string; serviceId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify business ownership and service exists
    const service = await prisma.service.findFirst({
      where: {
        id: params.serviceId,
        businessId: params.businessId,
        business: {
          ownerId: session.user.id,
        }
      }
    });

    if (!service) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const data = serviceUpdateSchema.parse(body);

    const updatedService = await prisma.service.update({
      where: { id: params.serviceId },
      data,
    });

    return NextResponse.json({
      message: "Service updated successfully",
      service: updatedService,
    });

  } catch (error) {
    console.error("Service update error:", error);
    
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
  { params }: { params: { businessId: string; serviceId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify business ownership and service exists
    const service = await prisma.service.findFirst({
      where: {
        id: params.serviceId,
        businessId: params.businessId,
        business: {
          ownerId: session.user.id,
        }
      }
    });

    if (!service) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }

    // Check if service has appointments
    const appointmentCount = await prisma.appointment.count({
      where: {
        serviceId: params.serviceId,
        status: {
          in: ['PENDING', 'CONFIRMED'],
        }
      }
    });

    if (appointmentCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete service with existing appointments" },
        { status: 409 }
      );
    }

    await prisma.service.delete({
      where: { id: params.serviceId },
    });

    return NextResponse.json({
      message: "Service deleted successfully",
    });

  } catch (error) {
    console.error("Service deletion error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
