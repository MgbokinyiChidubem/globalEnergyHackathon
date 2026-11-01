import type { City } from "./cities";

export type SunResult = { sunHours: number; source: "nasa" | "estimate" };

/** Annual mean all-sky surface irradiance (kWh/m²/day) == peak sun hours. Null if missing or out of 1–9. */
export function parsePowerResponse(json: unknown): number | null {
  const v = (json as { properties?: { parameter?: { ALLSKY_SFC_SW_DWN?: { ANN?: unknown } } } })?.properties
    ?.parameter?.ALLSKY_SFC_SW_DWN?.ANN;
  return typeof v === "number" && v >= 1 && v <= 9 ? v : null;
}

export async function getSunHours(city: City, fetchFn: typeof fetch = fetch): Promise<SunResult> {
  const url =
    "https://power.larc.nasa.gov/api/temporal/climatology/point?parameters=ALLSKY_SFC_SW_DWN&community=RE" +
    `&longitude=${city.lon}&latitude=${city.lat}&format=JSON`;
  try {
    const res = await fetchFn(url, { signal: AbortSignal.timeout(5000), next: { revalidate: 86400 } } as RequestInit);
    const v = res.ok ? parsePowerResponse(await res.json()) : null;
    if (v !== null) return { sunHours: v, source: "nasa" };
  } catch {
    // network error or timeout: fall through to estimate
  }
  return { sunHours: city.fallbackSunHours, source: "estimate" };
}
