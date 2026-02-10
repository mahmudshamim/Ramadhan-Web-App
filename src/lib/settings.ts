import { loadJSON, saveJSON } from "./storage";

export type AppSettings = {
  useGPS: boolean;
  city?: string;
  lat?: number;
  lon?: number;
  school: 0 | 1;
  reminderOffsetMin: number;
  ramadanYear?: number;
  ramadanMonth?: number;
};

const SETTINGS_KEY = "rramadhan_settings_v1";

export const defaultSettings: AppSettings = {
  useGPS: true,
  school: 0,
  reminderOffsetMin: 10
};

export function loadSettings(): AppSettings {
  const saved = loadJSON<AppSettings>(SETTINGS_KEY);
  return { ...defaultSettings, ...(saved ?? {}) };
}

export function saveSettings(settings: AppSettings) {
  saveJSON(SETTINGS_KEY, settings);
}
