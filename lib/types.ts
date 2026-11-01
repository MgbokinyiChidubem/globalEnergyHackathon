export type Appliance = {
  name: string;
  watts: number;
  hours: number;
  qty: number;
  motor: boolean;
};

export type SystemSize = {
  dailyWh: number;
  peakW: number;
  surgeW: number;
  inverterKVA: number;
  batteryKWh: number;
  panelCount: number;
  panelW: number;
};
