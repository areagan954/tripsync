"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { customAlphabet } from "nanoid";

const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 8);

export async function createTrip(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  if (!name) throw new Error("Trip name is required");

  const slug = nanoid();
  await prisma.trip.create({ data: { name, slug } });
  redirect(`/trip/${slug}`);
}

export async function submitAvailability(
  tripId: number,
  dates: string[]
): Promise<{ ok: true }> {
  if (dates.length === 0) return { ok: true };
  await prisma.submission.create({
    data: {
      tripId,
      dates: { create: dates.map((date) => ({ date })) },
    },
  });
  return { ok: true };
}

export async function addDestination(
  tripId: number,
  label: string
): Promise<{ id: number; label: string }> {
  label = label.trim();
  if (!label) throw new Error("Label required");
  const dest = await prisma.destinationOption.create({
    data: { tripId, label },
    select: { id: true, label: true },
  });
  return dest;
}

export async function deleteDestination(id: number): Promise<void> {
  await prisma.destinationOption.delete({ where: { id } });
}
