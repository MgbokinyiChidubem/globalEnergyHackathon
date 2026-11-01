import { CITIES } from "./cities";
import type { SunResult } from "./sun";

/** Browser-side sun lookup. Never throws: network or server failure falls back to the city's estimate. */
export async function fetchSun(cityId: string, fetchFn: typeof fetch = fetch): Promise<SunResult> {
  try {
    const res = await fetchFn(`/api/sun?city=${encodeURIComponent(cityId)}`);
    if (res.ok) return await res.json();
  } catch {
    // offline or blocked: use the estimate below
  }
  const city = CITIES.find((c) => c.id === cityId) ?? CITIES[0];
  return { sunHours: city.fallbackSunHours, source: "estimate" };
}
