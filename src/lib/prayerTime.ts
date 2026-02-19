export type PrayerTimes = {
  Fajr: string;
  Sunrise?: string;
  Dhuhr?: string;
  Asr?: string;
  Maghrib: string;
  Isha?: string;
};

export type PrayerTimeResponse = {
  date: string;
  timings: PrayerTimes;
};

function formatDate(date: Date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear());
  return `${day}-${month}-${year}`;
}

function sanitizeTime(value: string) {
  return value.split(" ")[0];
}

export async function fetchPrayerTimes(
  latitude: number,
  longitude: number,
  date: Date,
  school: 0 | 1
): Promise<PrayerTimeResponse> {
  const formattedDate = formatDate(date);
  const url = new URL(`https://api.aladhan.com/v1/timings/${formattedDate}`);
  url.searchParams.set("latitude", latitude.toString());
  url.searchParams.set("longitude", longitude.toString());
  url.searchParams.set("method", "2");
  url.searchParams.set("school", school.toString());

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error("Failed to fetch prayer times");
  }
  const data = await response.json();
  const timings = data?.data?.timings ?? {};

  return {
    date: formattedDate,
    timings: {
      Fajr: sanitizeTime(timings.Fajr ?? "05:00"),
      Sunrise: timings.Sunrise ? sanitizeTime(timings.Sunrise) : undefined,
      Dhuhr: timings.Dhuhr ? sanitizeTime(timings.Dhuhr) : undefined,
      Asr: timings.Asr ? sanitizeTime(timings.Asr) : undefined,
      Maghrib: sanitizeTime(timings.Maghrib ?? "18:00"),
      Isha: timings.Isha ? sanitizeTime(timings.Isha) : undefined
    }
  };
}

import { toBanglaDigits } from "./i18n-utils";
import { Lang } from "./i18n";

export function toLocalDateTime(date: Date, time24: string) {
  const [hour, minute] = time24.split(":").map(Number);
  const next = new Date(date);
  next.setHours(hour ?? 0, minute ?? 0, 0, 0);
  return next;
}

export function formatTo12Hour(time24: string, lang: Lang = "en"): string {
  if (!time24) return "";
  const [hourStr, minuteStr] = time24.split(":");
  let hour = parseInt(hourStr, 10);
  let ampm = hour >= 12 ? "PM" : "AM";

  if (lang === "bn") {
    ampm = hour >= 12 ? "অপরাহ্ণ" : "পূর্বাহ্ণ";
  }

  hour = hour % 12;
  hour = hour ? hour : 12; // the hour '0' should be '12'

  const result = `${hour}:${minuteStr} ${ampm}`;
  return lang === "bn" ? toBanglaDigits(result) : result;
}

export function shiftTime(time24: string, offsetMinutes: number): string {
  if (!time24) return time24;
  const [hourStr, minuteStr] = time24.split(":");
  const hour = Number(hourStr);
  const minute = Number(minuteStr);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return time24;

  const totalMinutes = ((hour * 60 + minute + offsetMinutes) % 1440 + 1440) % 1440;
  const nextHour = Math.floor(totalMinutes / 60);
  const nextMinute = totalMinutes % 60;
  return `${String(nextHour).padStart(2, "0")}:${String(nextMinute).padStart(2, "0")}`;
}
