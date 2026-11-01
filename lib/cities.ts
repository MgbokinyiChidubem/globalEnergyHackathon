export type City = { id: string; name: string; lat: number; lon: number; fallbackSunHours: number };

// Nigerian cities only: prices.json is a naira price table.
// fallbackSunHours: approximate annual peak sun hours, used when NASA POWER is unreachable.
export const CITIES: City[] = [
  { id: "lagos", name: "Lagos", lat: 6.52, lon: 3.38, fallbackSunHours: 4.5 },
  { id: "abuja", name: "Abuja", lat: 9.08, lon: 7.4, fallbackSunHours: 5.5 },
  { id: "kano", name: "Kano", lat: 12.0, lon: 8.52, fallbackSunHours: 6.0 },
  { id: "port-harcourt", name: "Port Harcourt", lat: 4.82, lon: 7.03, fallbackSunHours: 4.3 },
  { id: "ibadan", name: "Ibadan", lat: 7.38, lon: 3.95, fallbackSunHours: 4.8 },
  { id: "enugu", name: "Enugu", lat: 6.45, lon: 7.51, fallbackSunHours: 4.9 },
  { id: "kaduna", name: "Kaduna", lat: 10.52, lon: 7.44, fallbackSunHours: 5.8 },
  { id: "maiduguri", name: "Maiduguri", lat: 11.85, lon: 13.16, fallbackSunHours: 6.2 },
];
