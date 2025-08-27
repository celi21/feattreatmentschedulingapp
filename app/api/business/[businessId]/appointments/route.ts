import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const appointmentSchema = z.object({
  serviceId: z.string(),
  providerId: z.string(),
  start: z.string(), // ISO string
  clientName: z.string().min(1),
  clientEmail: z.string().email(),
  clientPhone: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { businessId: string } }
) {
  try {
    const body = await request.json();
    const data = appointmentSchema.parse(body);

    // Get business, service, and provider info
    const [business, service, provider] = await Promise.all([
      prisma.business.findUnique({
        where: { id: params.businessId, isActive: true }
      }),
      prisma.service.findFirst({
        where: { id: data.serviceId, businessId: params.businessId, isActive: true }
      }),
      prisma.provider.findFirst({
        where: { id: data.providerId, businessId: params.businessId, isActive: true }
      }),
    ]);

    if (!business || !service || !provider) {
      return NextResponse.json(
        { error: "Business, service, or provider not found" },
        { status: 404 }
      );
    }

    const startTime = dayjs(data.start).tz(business.timezone);
    const endTime = startTime.add(service.durationMinutes, 'minute');

    // Check if the slot is still available
    const conflictingAppointment = await prisma.appointment.findFirst({
      where: {
        providerId: provider.id,
        status: {
          in: ['PENDING', 'CONFIRMED'],
        },
        OR: [
          {
            start: {
              lt: endTime.toDate(),
            },
            end: {
              gt: startTime.toDate(),
            },
          },
        ],
      },
    });

    if (conflictingAppointment) {
      return NextResponse.json(
        { error: "This time slot is no longer available" },
        { status: 409 }
      );
    }

    // Calculate fees (2.9% platform fee)
    const totalCents = service.priceCents;
    const platformFeeCents = Math.round(totalCents * 0.029);

    // Create the appointment
    const appointment = await prisma.appointment.create({
      data: {
        businessId: business.id,
        serviceId: service.id,
        providerId: provider.id,
        clientName: data.clientName,
        clientEmail: data.clientEmail,
        clientPhone: data.clientPhone,
        notes: data.notes,
        start: startTime.toDate(),
        end: endTime.toDate(),
        totalCents,
        platformFeeCents,
        status: 'PENDING',
      },
      include: {
        service: true,
        provider: true,
        business: true,
      },
    });

    // TODO: Send confirmation email
    // TODO: Create Stripe payment intent for payment processing

    return NextResponse.json({
      message: "Appointment booked successfully",
      appointment: {
        id: appointment.id,
        start: appointment.start,
        end: appointment.end,
        service: appointment.service.name,
        provider: appointment.provider.name,
        totalCents: appointment.totalCents,
      },
    });

  } catch (error) {
    console.error("Appointment booking error:", error);
    
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
