import { loadJSON, saveJSON } from "./storage";

const KEY = "rramadhan_water_v1";

export type WaterEntry = {
  date: string;
  glasses: number;
};

export function getDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function loadWater(): WaterEntry[] {
  return loadJSON<WaterEntry[]>(KEY) ?? [];
}

export function saveWater(entries: WaterEntry[]) {
  saveJSON(KEY, entries);
}

export function updateToday(glasses: number) {
  const key = getDateKey();
  const all = loadWater();
  const next = all.filter((item) => item.date !== key).concat({ date: key, glasses });
  saveWater(next);
  return glasses;
}
