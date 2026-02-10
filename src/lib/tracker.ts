import { loadJSON, saveJSON } from "./storage";

export type DailyIbadat = {
  date: string;
  roza: boolean;
  quran: boolean;
  dua: boolean;
};

const KEY = "rramadhan_ibadat_v1";

export function getTodayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function loadIbadat(): DailyIbadat[] {
  return loadJSON<DailyIbadat[]>(KEY) ?? [];
}

export function saveIbadat(entries: DailyIbadat[]) {
  saveJSON(KEY, entries);
}

export function upsertToday(update: Partial<DailyIbadat>, date = new Date()) {
  const key = getTodayKey(date);
  const all = loadIbadat();
  const existing = all.find((item) => item.date === key) ?? {
    date: key,
    roza: false,
    quran: false,
    dua: false
  };
  const next = { ...existing, ...update };
  const filtered = all.filter((item) => item.date !== key);
  const result = [...filtered, next].sort((a, b) => a.date.localeCompare(b.date));
  saveIbadat(result);
  return next;
}

export function computeStreak(entries: DailyIbadat[]) {
  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));
  let streak = 0;
  let cursor = new Date();
  for (const entry of sorted) {
    const key = getTodayKey(cursor);
    if (entry.date !== key) break;
    if (entry.roza) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

export function isDailyComplete(entry: DailyIbadat) {
  return entry.roza && entry.quran && entry.dua;
}
