import dayjs from "dayjs";
import { prisma } from "./prisma";

export type Slot = { start: string; end: string };

export async function getAvailability(providerId: string, dateISO: string): Promise<Slot[]> {
  try {
    console.log('Getting availability for:', { providerId, dateISO });
    
    const provider = await prisma.provider.findUnique({ where: { id: providerId } });
    if (!provider || !provider.isActive) {
      console.log('Provider not found or inactive');
      return [];
    }

    console.log('Provider found:', provider.name);
    
    const date = dayjs(dateISO);
    const startOfDay = date.hour(provider.workStartHour).minute(0).second(0).millisecond(0);
    const endOfDay = date.hour(provider.workEndHour).minute(0).second(0).millisecond(0);

    console.log('Work hours:', { 
      start: startOfDay.format(), 
      end: endOfDay.format() 
    });

    const appointments = await prisma.appointment.findMany({
      where: {
        providerId,
        status: { in: ['PENDING', 'CONFIRMED', 'COMPLETED'] },
        start: { lt: endOfDay.toDate() },
        end: { gt: startOfDay.toDate() }
      },
      orderBy: { start: 'asc' }
    });

    console.log('Found appointments:', appointments.length);

    // Build 30-min slots
    const slots: Slot[] = [];
    let cursor = startOfDay;
    let iterations = 0;
    const maxIterations = 100; // Safety check
    
    while (cursor.valueOf() < endOfDay.valueOf() && iterations < maxIterations) {
      const slotStart = cursor;
      const slotEnd = cursor.add(30, 'minute');

      // Stop if slot end goes beyond work hours
      if (slotEnd.valueOf() > endOfDay.valueOf()) {
        break;
      }

      const overlaps = appointments.some(a => {
        const aStart = dayjs(a.start);
        const aEnd = dayjs(a.end);
        return aStart.valueOf() < slotEnd.valueOf() && aEnd.valueOf() > slotStart.valueOf();
      });

      if (!overlaps) {
        slots.push({ start: slotStart.toISOString(), end: slotEnd.toISOString() });
      }
      
      cursor = slotEnd;
      iterations++;
    }

    console.log('Generated slots:', slots.length);
    return slots;
  } catch (error) {
    console.error('Error in getAvailability:', error);
    return [];
  }
}
