import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export async function GET(
  request: NextRequest,
  { params }: { params: { businessId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get('providerId');
    const date = searchParams.get('date');

    if (!providerId || !date) {
      return NextResponse.json(
        { error: "Provider ID and date are required" },
        { status: 400 }
      );
    }

    // Get provider and business info
    const provider = await prisma.provider.findFirst({
      where: {
        id: providerId,
        businessId: params.businessId,
        isActive: true,
      },
      include: {
        business: true,
      }
    });

    if (!provider) {
      return NextResponse.json(
        { error: "Provider not found" },
        { status: 404 }
      );
    }

    const business = provider.business;
    const requestDate = dayjs(date).tz(business.timezone);
    
    // Don't allow booking in the past
    if (requestDate.isBefore(dayjs().tz(business.timezone), 'day')) {
      return NextResponse.json({ slots: [] });
    }

    // Generate time slots based on provider's working hours
    const slots = [];
    const workStart = requestDate.hour(provider.workStartHour).minute(0).second(0);
    const workEnd = requestDate.hour(provider.workEndHour).minute(0).second(0);
    
    // Get existing appointments for this provider on this date
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        providerId: provider.id,
        start: {
          gte: workStart.toDate(),
          lt: workEnd.toDate(),
        },
        status: {
          in: ['PENDING', 'CONFIRMED'],
        },
      },
      orderBy: { start: 'asc' },
    });

    // Generate 30-minute slots (can be made configurable)
    const slotDuration = 30; // minutes
    let currentSlot = workStart;

    while (currentSlot.isBefore(workEnd)) {
      const slotEnd = currentSlot.add(slotDuration, 'minute');
      
      // Check if this slot conflicts with any existing appointment
      const hasConflict = existingAppointments.some(appointment => {
        const appointmentStart = dayjs(appointment.start).tz(business.timezone);
        const appointmentEnd = dayjs(appointment.end).tz(business.timezone);
        
        return (
          currentSlot.isBefore(appointmentEnd) && slotEnd.isAfter(appointmentStart)
        );
      });

      // Don't show slots in the past (within the current day)
      const now = dayjs().tz(business.timezone);
      const isInPast = requestDate.isSame(now, 'day') && currentSlot.isBefore(now);

      if (!hasConflict && !isInPast) {
        slots.push({
          start: currentSlot.toISOString(),
          end: slotEnd.toISOString(),
        });
      }

      currentSlot = currentSlot.add(slotDuration, 'minute');
    }

    return NextResponse.json({ slots });

  } catch (error) {
    console.error("Availability error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
