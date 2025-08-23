import dayjs from "dayjs";
import { prisma } from "./prisma";

export type Slot = { start: string; end: string };

export async function getAvailability(providerId: string, dateISO: string): Promise<Slot[]> {
  const provider = await prisma.provider.findUnique({ where: { id: providerId } });
  if (!provider || !provider.isActive) return [];

  const date = dayjs(dateISO);
  const startOfDay = date.hour(provider.workStartHour).minute(0).second(0).millisecond(0);
  const endOfDay = date.hour(provider.workEndHour).minute(0).second(0).millisecond(0);

  const appointments = await prisma.appointment.findMany({
    where: {
      providerId,
      status: { in: ['pending', 'confirmed', 'completed'] },
      start: { lt: endOfDay.toDate() },
      end: { gt: startOfDay.toDate() }
    },
    orderBy: { start: 'asc' }
  });

  // Build 30-min slots
  const slots: Slot[] = [];
  let cursor = startOfDay;
  while (cursor.add(30, 'minute').isSameOrBefore(endOfDay)) {
    const slotStart = cursor;
    const slotEnd = cursor.add(30, 'minute');

    const overlaps = appointments.some(a => {
      const aStart = dayjs(a.start);
      const aEnd = dayjs(a.end);
      return aStart.isBefore(slotEnd) && aEnd.isAfter(slotStart);
    });

    if (!overlaps) {
      slots.push({ start: slotStart.toISOString(), end: slotEnd.toISOString() });
    }
    cursor = slotEnd;
  }

  return slots;
}
