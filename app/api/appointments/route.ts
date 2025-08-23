import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import dayjs from "dayjs";
import { prisma } from "@/lib/prisma";

export const runtime = 'nodejs';

const Body = z.object({
  treatmentId: z.string().min(1),
  providerId: z.string().min(1),
  start: z.string().datetime(),
  clientName: z.string().min(1),
  clientEmail: z.string().email(),
  notes: z.string().optional()
});

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const { treatmentId, providerId, start, clientName, clientEmail, notes } = parsed.data;

  const treatment = await prisma.treatment.findUnique({ where: { id: treatmentId } });
  if (!treatment || !treatment.isActive) {
    return NextResponse.json({ error: "Invalid treatment" }, { status: 400 });
  }

  const provider = await prisma.provider.findUnique({ where: { id: providerId } });
  if (!provider || !provider.isActive) {
    return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
  }

  const startDt = dayjs(start);
  const endDt = startDt.add(treatment.durationMinutes, 'minute');

  // Conflict check
  const overlap = await prisma.appointment.findFirst({
    where: {
      providerId,
      status: { in: ['pending', 'confirmed', 'completed'] },
      start: { lt: endDt.toDate() },
      end: { gt: startDt.toDate() }
    }
  });
  if (overlap) {
    return NextResponse.json({ error: "Slot no longer available" }, { status: 409 });
  }

  const appt = await prisma.appointment.create({
    data: {
      clientName, clientEmail, notes,
      start: startDt.toDate(),
      end: endDt.toDate(),
      providerId, treatmentId,
      status: 'pending'
    }
  });

  return NextResponse.json({ id: appt.id, status: appt.status });
}
