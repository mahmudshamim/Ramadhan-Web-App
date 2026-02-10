export function buildICS(params: {
  title: string;
  description?: string;
  start: Date;
  end: Date;
}) {
  const format = (date: Date) =>
    date
      .toISOString()
      .replace(/[-:]/g, "")
      .split(".")[0] + "Z";

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//R-Ramadhan//EN",
    "BEGIN:VEVENT",
    `UID:${Date.now()}@r-ramadhan`,
    `DTSTAMP:${format(new Date())}`,
    `DTSTART:${format(params.start)}`,
    `DTEND:${format(params.end)}`,
    `SUMMARY:${params.title}`,
    params.description ? `DESCRIPTION:${params.description}` : "",
    "END:VEVENT",
    "END:VCALENDAR"
  ].filter(Boolean);

  return lines.join("\n");
}

export function downloadICS(filename: string, icsText: string) {
  const blob = new Blob([icsText], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
