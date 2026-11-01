import type { NextRequest } from "next/server";
import { CITIES } from "@/lib/cities";
import { getSunHours } from "@/lib/sun";

export async function GET(request: NextRequest) {
  const city = CITIES.find((c) => c.id === request.nextUrl.searchParams.get("city"));
  if (!city) return Response.json({ error: "Unknown city" }, { status: 400 });
  return Response.json(await getSunHours(city));
}
