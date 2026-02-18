export type RamadanDay = {
  gregorianDate: string;
  weekday: string;
  hijriDay: number;
  fajr: string;
  maghrib: string;
};

function sanitizeTime(value: string) {
  return value.split(" ")[0];
}

export async function fetchHijriCalendar(params: {
  latitude: number;
  longitude: number;
  hijriYear: number;
  hijriMonth: number;
  school: 0 | 1;
  adjustment?: number;
}) {
  const url = new URL(
    `https://api.aladhan.com/v1/hijriCalendar/${params.hijriYear}/${params.hijriMonth}`
  );
  url.searchParams.set("latitude", params.latitude.toString());
  url.searchParams.set("longitude", params.longitude.toString());
  url.searchParams.set("method", "2");
  url.searchParams.set("school", params.school.toString());

  const response = await fetch(url.toString());
  if (!response.ok) throw new Error("Failed to fetch Hijri calendar");
  const data = await response.json();

  const adjustment = params.adjustment ?? 0;

  const allDays = (data?.data ?? []).map((day: any) => ({
    gregorianDate: day?.date?.gregorian?.date ?? "",
    weekday: day?.date?.gregorian?.weekday?.en ?? "",
    hijriDay: Number(day?.date?.hijri?.day ?? 0) + adjustment,
    fajr: sanitizeTime(day?.timings?.Fajr ?? "05:00"),
    maghrib: sanitizeTime(day?.timings?.Maghrib ?? "18:00")
  })) as RamadanDay[];

  // Filter out days with invalid hijriDay (e.g., 0 or negative after adjustment)
  return allDays.filter((d) => d.hijriDay > 0);

}
