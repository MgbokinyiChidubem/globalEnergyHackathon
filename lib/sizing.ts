import type { Appliance, SystemSize } from "./types";

const INVERTER_SAFETY = 1.25;
const MOTOR_SURGE = 3;
const INVERTER_SURGE_RATING = 2;
const POWER_FACTOR = 0.8;
const NIGHT_SHARE = 0.5;
const AUTONOMY_DAYS = 1;
const DEPTH_OF_DISCHARGE = 0.8;
const BATTERY_EFFICIENCY = 0.9;
const DERATE = 0.75;
export const PANEL_W = 550;

const INVERTER_KVA = [1, 1.5, 2, 3, 3.5, 5, 7.5, 10];
const BATTERY_KWH = [2.5, 5, 7.5, 10, 15, 20];

/** Smallest standard size >= value; past the list, round up to a multiple of step. 0 stays 0. */
export function roundToSize(value: number, sizes: number[], step: number): number {
  if (value <= 0) return 0;
  return sizes.find((s) => s >= value) ?? Math.ceil(value / step) * step;
}

export function sizeSystem(appliances: Appliance[], sunHours: number): SystemSize {
  let dailyWh = 0, peakW = 0, surgeW = 0;
  for (const a of appliances) {
    dailyWh += a.watts * a.hours * a.qty;
    peakW += a.watts * a.qty;
    surgeW += a.watts * a.qty * (a.motor ? MOTOR_SURGE : 1);
  }
  const inverterW = Math.max(peakW * INVERTER_SAFETY, surgeW / INVERTER_SURGE_RATING);
  const inverterKVA = roundToSize(inverterW / POWER_FACTOR / 1000, INVERTER_KVA, 1);
  const batteryKWh = roundToSize(
    (dailyWh * NIGHT_SHARE * AUTONOMY_DAYS) / (DEPTH_OF_DISCHARGE * BATTERY_EFFICIENCY) / 1000,
    BATTERY_KWH,
    5,
  );
  const panelCount = sunHours > 0 ? Math.ceil(dailyWh / (sunHours * DERATE) / PANEL_W) : 0;
  return { dailyWh, peakW, surgeW, inverterKVA, batteryKWh, panelCount, panelW: panelCount * PANEL_W };
}
