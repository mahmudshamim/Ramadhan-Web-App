import { loadJSON, saveJSON } from "./storage";

export type AppSettings = {
  useGPS: boolean;
  city?: string;
  lat?: number;
  lon?: number;
  school: 0 | 1;
  reminderOffsetMin: number;
  imsakOffsetMin: number;
  ramadanYear?: number;
  ramadanMonth?: number;
  jamaatTimes?: Partial<Record<"fajr" | "dhuhr" | "asr" | "maghrib" | "isha", string>>;
};

const SETTINGS_KEY = "rramadhan_settings_v1";

export const defaultSettings: AppSettings = {
  useGPS: true,
  school: 1,
  reminderOffsetMin: 10,
  imsakOffsetMin: 19,
  jamaatTimes: {}
};

export function loadSettings(): AppSettings {
  const saved = loadJSON<AppSettings>(SETTINGS_KEY);
  return { ...defaultSettings, ...(saved ?? {}) };
}

export function saveSettings(settings: AppSettings) {
  saveJSON(SETTINGS_KEY, settings);
}
