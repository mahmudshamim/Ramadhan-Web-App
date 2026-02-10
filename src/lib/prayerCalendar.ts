import type { PrayerTimes } from "./prayerTime";

export type CalendarDay = {
  date: string;
  readable: string;
  timings: PrayerTimes;
};

function sanitizeTime(value: string) {
  return value.split(" ")[0];
}

export async function fetchMonthlyCalendar(params: {
  latitude: number;
  longitude: number;
  month: number;
  year: number;
  school: 0 | 1;
}): Promise<CalendarDay[]> {
  const url = new URL("https://api.aladhan.com/v1/calendar");
  url.searchParams.set("latitude", params.latitude.toString());
  url.searchParams.set("longitude", params.longitude.toString());
  url.searchParams.set("month", params.month.toString());
  url.searchParams.set("year", params.year.toString());
  url.searchParams.set("method", "2");
  url.searchParams.set("school", params.school.toString());

  const response = await fetch(url.toString());
  if (!response.ok) throw new Error("Failed to fetch calendar");
  const data = await response.json();

  return (data?.data ?? []).map((day: any) => ({
    date: day?.date?.gregorian?.date ?? "",
    readable: day?.date?.gregorian?.weekday?.en ?? "",
    timings: {
      Fajr: sanitizeTime(day?.timings?.Fajr ?? "05:00"),
      Maghrib: sanitizeTime(day?.timings?.Maghrib ?? "18:00"),
      Sunrise: day?.timings?.Sunrise ? sanitizeTime(day.timings.Sunrise) : undefined,
      Dhuhr: day?.timings?.Dhuhr ? sanitizeTime(day.timings.Dhuhr) : undefined,
      Asr: day?.timings?.Asr ? sanitizeTime(day.timings.Asr) : undefined,
      Isha: day?.timings?.Isha ? sanitizeTime(day.timings.Isha) : undefined
    }
  }));
}
