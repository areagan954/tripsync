import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TripPageClient from "./TripPageClient";

export default async function TripPage({
  params,
}: {
  params: { slug: string };
}) {
  const trip = await prisma.trip.findUnique({
    where: { slug: params.slug },
    include: {
      submissions: { include: { dates: true } },
      destinations: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!trip) notFound();

  return <TripPageClient trip={trip} />;
}
