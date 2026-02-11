"use client";

import { useEffect, useState } from "react";
import { loadJSON, saveJSON } from "../../lib/storage";
import { loadSettings, saveSettings } from "../../lib/settings";
import { fetchHijriCalendar, type RamadanDay } from "../../lib/hijriCalendar";
import { useLang } from "../../lib/i18n";
import { formatTo12Hour } from "../../lib/prayerTime";
import { toBanglaDigits, translateWeekday } from "../../lib/i18n-utils";
import { FiSunrise, FiMoon } from "react-icons/fi";

const CACHE_KEY = "rramadhan_calendar_cache_v2";

function isToday(dateStr: string) {
  const [day, month, year] = dateStr.split("-").map(Number);
  if (!day || !month || !year) return false;
  const today = new Date();
  return (
    today.getDate() === day &&
    today.getMonth() + 1 === month &&
    today.getFullYear() === year
  );
}

export default function CalendarPage() {
  const { t, lang } = useLang();
  const [calendar, setCalendar] = useState<RamadanDay[]>([]);
  const [statusKey, setStatusKey] = useState("calendar.status.loading");

  useEffect(() => {
    const cached = loadJSON<RamadanDay[]>(CACHE_KEY);
    if (cached?.length) {
      setCalendar(cached);
      setStatusKey("calendar.status.offlineCache");
    }

    const settings = loadSettings();
    const hijriYear = 1447;
    const hijriMonth = 9; // Ramadan

    const loadCalendar = (latitude: number, longitude: number, statusPrefix = "calendar.status.updated") => {
      fetchHijriCalendar({
        latitude,
        longitude,
        hijriYear,
        hijriMonth,
        school: settings.school
      })
        .then((data) => {
          setCalendar(data);
          setStatusKey(statusPrefix);
          saveJSON(CACHE_KEY, data);
        })
        .catch(() => {
          setStatusKey("calendar.status.failed");
        });
    };

    const detectAndLoad = () => {
      if (typeof navigator !== "undefined" && navigator.geolocation) {
        setStatusKey("status.detecting");
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;
            saveSettings({ ...settings, lat, lon });
            loadCalendar(lat, lon, "status.updated");
          },
          () => {
            // Fallback to Dhaka if denied
            setStatusKey("ramadan.loc.default");
            loadCalendar(23.8103, 90.4125, "ramadan.loc.default");
          }
        );
      } else {
        // No geolocation support
        setStatusKey("ramadan.loc.default");
        loadCalendar(23.8103, 90.4125, "ramadan.loc.default");
      }
    };

    if (settings.lat && settings.lon) {
      if (navigator.onLine) {
        const mode = settings.useGPS ? "ramadan.loc.gps" : "ramadan.loc.manual";
        loadCalendar(settings.lat, settings.lon, mode);
      }
    } else {
      detectAndLoad();
    }
  }, []);

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-6 py-16">
      <section className="relative rounded-3xl border border-brand-gold/30 bg-brand-deep/70 p-6 shadow-xl overflow-hidden">
        {/* Decorative Frame */}
        <div className="ornament-frame absolute -left-10 -top-10 h-40 w-40 opacity-20 pointer-events-none" />
        <div className="ornament-frame absolute -right-10 -bottom-10 h-40 w-40 opacity-20 pointer-events-none rotate-180" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-display text-3xl">{t("calendar.title")}</h1>
          <p className="text-slate-300">{t("calendar.subtitle")}</p>
        </div>
      </section>

      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{t(statusKey)}</p>

      <div className="relative min-h-[400px]">
        {/* Unified Timeline Layout (Responsive) */}
        <div className="flex flex-col gap-12">
          {(() => {
            const phases = [
              { key: "rahmah", start: 1, label: t("ramadan.phase.rahmah") },
              { key: "maghfirah", start: 11, label: t("ramadan.phase.maghfirah") },
              { key: "najat", start: 21, label: t("ramadan.phase.najat") }
            ];

            return phases.map((phase) => {
              const phaseDays = calendar.filter(
                (d) => d.hijriDay >= phase.start && d.hijriDay < phase.start + 10
              );

              if (phaseDays.length === 0) return null;

              return (
                <div key={phase.key} className="flex flex-col gap-8">
                  {/* Phase Decorative Header */}
                  <div className="flex items-center gap-8">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-brand-gold/40 to-transparent" />
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] uppercase tracking-[0.5em] text-brand-gold/70 font-bold mb-1">Phase Marker</span>
                      <h3 className="whitespace-nowrap text-center text-lg font-bold uppercase tracking-[0.3em] text-brand-sand">
                        {phase.label}
                      </h3>
                    </div>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-brand-gold/40 to-transparent" />
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    {phaseDays.map((day) => {
                      const today = isToday(day.gregorianDate);
                      return (
                        <div
                          key={day.gregorianDate}
                          className={`group relative flex flex-col lg:flex-row lg:items-center justify-between overflow-hidden rounded-[2rem] border p-6 md:p-8 transition-all duration-500 ${today
                            ? "border-brand-gold bg-brand-gold/20 shadow-[0_0_60px_rgba(196,160,82,0.25)] ring-2 ring-brand-gold/60 z-10 scale-[1.02]"
                            : "border-brand-gold/10 bg-brand-deep/50 hover:border-brand-gold/30 hover:bg-brand-deep/80 shadow-2xl"
                            }`}
                        >
                          {/* Today Glow Effect Decor */}
                          {today && (
                            <div className="absolute inset-0 bg-gradient-to-r from-brand-gold/15 via-transparent to-brand-gold/15 pointer-events-none animate-pulse-slow" />
                          )}
                          {/* Day and Date Section (Timeline Node) */}
                          <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10 lg:min-w-[350px]">
                            <div className="relative flex items-center justify-center min-w-[100px] sm:min-w-[120px]">
                              {/* Timeline Line Accent - Hidden on mobile, visible on sm+ */}
                              <div className="hidden sm:block absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-20 bg-gradient-to-b from-brand-gold/0 via-brand-gold/60 to-brand-gold/0 rounded-full" />

                              <div className="flex flex-col items-center sm:ml-6">
                                <span className="text-[10px] uppercase tracking-[0.4em] text-brand-sand/60 font-black mb-1">{t("ramadan.col.day")}</span>
                                <span className="font-display text-6xl sm:text-7xl leading-none text-brand-sand drop-shadow-[0_0_15px_rgba(196,160,82,0.4)]">
                                  {lang === "bn" ? toBanglaDigits(day.hijriDay) : day.hijriDay}
                                </span>
                              </div>
                            </div>

                            {/* Divider on mobile */}
                            <div className="h-px w-20 bg-brand-gold/20 sm:hidden" />

                            <div className="flex flex-col gap-1 sm:gap-2 sm:border-l-2 border-brand-gold/10 sm:pl-10 sm:h-20 justify-center items-center sm:items-start text-center sm:text-left">
                              <span className="text-2xl sm:text-3xl font-black text-slate-100 leading-none">
                                {lang === "bn" ? toBanglaDigits(day.gregorianDate) : day.gregorianDate}
                              </span>
                              <div className="flex items-center gap-3 sm:gap-4 mt-1 sm:mt-0">
                                <span className="h-1 sm:h-1.5 w-8 sm:w-10 bg-brand-gold/40 rounded-full" />
                                <span className="text-xs sm:text-sm uppercase tracking-[0.3em] text-slate-400 font-bold">
                                  {translateWeekday(day.weekday, lang)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Prayer Times Section */}
                          <div className="mt-8 lg:mt-0 flex flex-row items-center justify-between sm:justify-around lg:justify-end gap-4 sm:gap-12 lg:gap-24 px-2 sm:px-6 lg:px-16 border-t lg:border-t-0 lg:border-l border-brand-gold/10 pt-6 lg:pt-0 w-full lg:w-auto">
                            <div className="flex flex-col items-center lg:items-end gap-1 sm:gap-2">
                              <div className="flex items-center gap-2 text-[9px] sm:text-[11px] uppercase tracking-[0.2em] sm:tracking-[0.3em] text-brand-sand/80 font-black mb-1">
                                <FiSunrise className="text-brand-gold text-sm sm:text-base" />
                                {t("ramadan.col.sehri")}
                              </div>
                              <span className="text-2xl sm:text-3xl font-black text-white leading-none">
                                {formatTo12Hour(day.fajr, lang)}
                              </span>
                            </div>

                            <div className="h-10 sm:h-16 w-px bg-brand-gold/20" />

                            <div className="flex flex-col items-center lg:items-start gap-1 sm:gap-2">
                              <div className="flex items-center gap-2 text-[9px] sm:text-[11px] uppercase tracking-[0.2em] sm:tracking-[0.3em] text-brand-sand/80 font-black mb-1">
                                <FiMoon className="text-brand-gold text-sm sm:text-base" />
                                {t("ramadan.col.iftar")}
                              </div>
                              <span className="text-2xl sm:text-3xl font-black text-white leading-none">
                                {formatTo12Hour(day.maghrib, lang)}
                              </span>
                            </div>
                          </div>

                          {/* Background Glows and Ornaments */}
                          {today && (
                            <div className="absolute -left-20 -top-20 h-64 w-64 bg-brand-gold/5 blur-[100px] pointer-events-none" />
                          )}

                          {today && (
                            <div className="absolute right-0 top-0 overflow-hidden">
                              <div className="bg-brand-gold px-12 py-2.5 text-[10px] sm:text-[11px] font-black uppercase text-brand-deep rotate-45 translate-x-12 sm:translate-x-10 translate-y-3 sm:translate-y-4 shadow-2xl ring-2 ring-brand-deep/10">
                                {t("ramadan.today")}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            });
          })()}
        </div>
      </div>
    </main>
  );
}
