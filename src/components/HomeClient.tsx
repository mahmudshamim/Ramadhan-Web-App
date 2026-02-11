"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import PrayerTimeCard from "./PrayerTimeCard";
import CountdownTimer from "./CountdownTimer";
import Badge from "./Badge";
import { FiMoon, FiSunrise } from "react-icons/fi";
import { fetchPrayerTimes, toLocalDateTime, formatTo12Hour, type PrayerTimes } from "../lib/prayerTime";
import { scheduleIftarReminder, cancelReminder, getReminderStatus, restoreReminder } from "../lib/notifications";
import { loadJSON, saveJSON } from "../lib/storage";
import { AppSettings, defaultSettings, loadSettings, saveSettings } from "../lib/settings";
import { fetchHijriCalendar, type RamadanDay } from "../lib/hijriCalendar";
import PermissionModal from "./PermissionModal";
import { useLang } from "../lib/i18n";
import { toBanglaDigits, translateWeekday } from "../lib/i18n-utils";

type CachePayload = {
  today: PrayerTimes;
  tomorrow: PrayerTimes;
  updatedAt: string;
  school: 0 | 1;
  lat?: number;
  lon?: number;
};

const CACHE_KEY = "rramadhan_prayer_cache_v1";
const REMINDER_KEY = "rramadhan_reminder_set";
const RAMADAN_CACHE_KEY = "rramadhan_ramadan2026_cache_v1";

const fallbackTimes: PrayerTimes = {
  Fajr: "05:00",
  Maghrib: "18:00"
};

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

export default function HomeClient() {
  const { t, lang } = useLang();
  const [mounted, setMounted] = useState(false);
  const [todayTimes, setTodayTimes] = useState<PrayerTimes>(fallbackTimes);
  const [tomorrowTimes, setTomorrowTimes] = useState<PrayerTimes>(fallbackTimes);
  const [statusKey, setStatusKey] = useState("status.loadingPrayer");
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [school, setSchool] = useState<0 | 1>(0);
  const [reminderOffset, setReminderOffset] = useState<number>(10);
  const [reminderMinutes, setReminderMinutes] = useState<number>(15); // Custom reminder time
  const [useGPS, setUseGPS] = useState<boolean>(true);
  const [manualCoords, setManualCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [ramadanDays, setRamadanDays] = useState<RamadanDay[]>([]);
  const [ramadanStatusKey, setRamadanStatusKey] = useState<string>("ramadan.status.loading");
  const [locationModeKey, setLocationModeKey] = useState<string>("ramadan.loc.default");
  const [reminderSet, setReminderSet] = useState<boolean>(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [permissionType, setPermissionType] = useState<"location" | "notification" | "location_denied" | "notification_denied">("location");

  // Initialization Effect (Run Once)
  useEffect(() => {
    setMounted(true);
    const cached = loadJSON<CachePayload>(CACHE_KEY);
    const savedReminder = loadJSON<boolean>(REMINDER_KEY);

    if (typeof savedReminder === "boolean") {
      setReminderSet(savedReminder);
    }

    const settings = loadSettings();
    setSchool(settings.school ?? defaultSettings.school);
    setReminderOffset(settings.reminderOffsetMin ?? defaultSettings.reminderOffsetMin);
    setUseGPS(settings.useGPS ?? defaultSettings.useGPS);

    if (settings.lat && settings.lon) {
      setManualCoords({ lat: settings.lat, lon: settings.lon });
    }

    if (cached) {
      setTodayTimes(cached.today);
      setTomorrowTimes(cached.tomorrow);
      setLastUpdated(cached.updatedAt);
    }
  }, []);

  // Data Fetching & Permission Effect
  useEffect(() => {
    if (!mounted) return;

    // Initial check for manual coords or offline status
    if (!navigator.onLine) {
      setStatusKey("status.offline");
      return;
    }

    if (!useGPS && manualCoords) {
      setStatusKey("status.usingCity");
      setCoords({ lat: manualCoords.lat, lon: manualCoords.lon });
      fetchWithCoords(manualCoords.lat, manualCoords.lon);
      return;
    }

    if (!navigator.geolocation) {
      setStatusKey("status.locationUnavailable");
      return;
    }

    // Check if permission is already granted
    navigator.permissions.query({ name: "geolocation" }).then((result) => {
      if (result.state === "granted") {
        requestLocation();
      } else if (result.state === "prompt") {
        setPermissionType("location");
        setShowPermissionModal(true);
      } else {
        setStatusKey("status.permissionDenied");
      }
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [school, useGPS, manualCoords, mounted]);

  const fetchWithCoords = async (latitude: number, longitude: number) => {
    try {
      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 1);

      const [todayResp, tomorrowResp] = await Promise.all([
        fetchPrayerTimes(latitude, longitude, today, school),
        fetchPrayerTimes(latitude, longitude, tomorrow, school)
      ]);

      setTodayTimes(todayResp.timings);
      setTomorrowTimes(tomorrowResp.timings);

      const updatedAt = new Date().toISOString();
      setLastUpdated(updatedAt);
      setStatusKey("status.updated");

      saveJSON(CACHE_KEY, {
        today: todayResp.timings,
        tomorrow: tomorrowResp.timings,
        updatedAt,
        school,
        lat: latitude,
        lon: longitude
      });
    } catch (error) {
      setStatusKey("status.updateFailed");
    }
  };

  const requestLocation = () => {
    setStatusKey("status.detecting");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setCoords({ lat, lon });

        // Persist to settings so other pages can use it
        const settings = loadSettings();
        if (settings.useGPS) {
          saveSettings({ ...settings, lat, lon });
        }

        fetchWithCoords(lat, lon);
      },
      () => {
        setStatusKey("status.permissionDenied");
      }
    );
  };

  useEffect(() => {
    const cached = loadJSON<RamadanDay[]>(RAMADAN_CACHE_KEY);
    if (cached?.length) {
      setRamadanDays(cached);
      setRamadanStatusKey("ramadan.status.offlineCache");
    }

    const resolveCoords = () => {
      if (coords) return coords;
      const settings = loadSettings();
      if (settings.lat && settings.lon) {
        setLocationModeKey(settings.useGPS ? "ramadan.loc.gps" : "ramadan.loc.manual");
        return { lat: settings.lat, lon: settings.lon };
      }
      setLocationModeKey("ramadan.loc.default");
      return { lat: 23.8103, lon: 90.4125 };
    };

    if (!navigator.onLine) {
      setRamadanStatusKey("ramadan.status.offline");
      return;
    }

    const activeCoords = resolveCoords();

    fetchHijriCalendar({
      latitude: activeCoords.lat,
      longitude: activeCoords.lon,
      hijriYear: 1447,
      hijriMonth: 9,
      school
    })
      .then((data) => {
        setRamadanDays(data);
        setRamadanStatusKey("ramadan.status.updated");
        saveJSON(RAMADAN_CACHE_KEY, data);
      })
      .catch(() => {
        setRamadanStatusKey("ramadan.status.failed");
      });
  }, [coords, school]);

  const { countdownTarget, countdownLabelKey } = useMemo(() => {
    const now = new Date();
    const today = new Date();

    // 1. Check if it's before Today's Sehri (Fajr)
    const todaySehri = toLocalDateTime(today, todayTimes.Fajr);
    if (now.getTime() < todaySehri.getTime()) {
      return {
        countdownTarget: todaySehri.toISOString(),
        countdownLabelKey: "countdown.nextSehri"
      };
    }

    // 2. Check if it's before Today's Iftar (Maghrib)
    const todayMaghrib = toLocalDateTime(today, todayTimes.Maghrib);
    if (now.getTime() < todayMaghrib.getTime()) {
      return {
        countdownTarget: todayMaghrib.toISOString(),
        countdownLabelKey: "countdown.nextIftar"
      };
    }

    // 3. Otherwise, it's after Iftar, target is Tomorrow's Sehri
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    const tomorrowSehri = toLocalDateTime(tomorrow, tomorrowTimes.Fajr);
    return {
      countdownTarget: tomorrowSehri.toISOString(),
      countdownLabelKey: "countdown.nextSehri"
    };
  }, [todayTimes, tomorrowTimes]);

  const handleReminder = async () => {
    if (reminderSet) {
      // Cancel existing reminder
      cancelReminder();
      setReminderSet(false);
      saveJSON(REMINDER_KEY, false);
    } else {
      // Check notification permission state
      if (Notification.permission === "granted") {
        scheduleReminder();
      } else if (Notification.permission === "default") {
        // Show soft permission modal
        setPermissionType("notification");
        setShowPermissionModal(true);
      } else {
        // Permission is denied
        setPermissionType("notification_denied");
        setShowPermissionModal(true);
      }
    }
  };

  const scheduleReminder = async () => {
    // Schedule new reminder with custom time
    const iftarTime = todayTimes.Maghrib || "6:00 PM";
    const success = await scheduleIftarReminder(iftarTime, lang, reminderMinutes);

    if (success) {
      setReminderSet(true);
      saveJSON(REMINDER_KEY, true);
      saveJSON("rramadhan_reminder_minutes", reminderMinutes); // Save preference
    }
  };

  const handlePermissionConfirm = () => {
    setShowPermissionModal(false);

    if (permissionType === "location") {
      requestLocation();
    } else if (permissionType === "notification") {
      scheduleReminder();
    }
    // For denied states, the modal just closes (it acts as an info dialog)
  };

  return (
    <section className="flex flex-col gap-8">
      {/* Enhanced Hero Section */}
      <div className="relative overflow-hidden rounded-[2.5rem] border border-brand-gold/10 bg-brand-deep/60 p-10 shadow-2xl backdrop-blur-xl lg:p-16">
        <div className="hero-moon opacity-40" />
        <div className="relative z-10 flex flex-col gap-8">
          <div className="flex items-center gap-3 text-brand-sand">
            <FiMoon className="text-2xl" />
            <span className="text-sm uppercase tracking-[0.5em]">
              {t("home.brand").split("").join(" ")}
            </span>
          </div>
          <h2 className="max-w-2xl font-display text-5xl leading-tight text-white lg:text-7xl">
            {t("home.title")}
          </h2>
          <p className="max-w-xl text-lg text-slate-300 lg:text-xl">{t("home.subtitle")}</p>
          <div className="flex flex-wrap gap-5">
            <Link href="/calendar">
              <button className="btn-gold min-w-[180px] rounded-full px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95">
                {t("home.explore")}
              </button>
            </Link>
            <Link href="/dashboard">
              <button className="min-w-[180px] rounded-full border border-white/10 bg-white/5 px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] transition-all hover:bg-white/10">
                {t("home.start")}
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="flex flex-col gap-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <PrayerTimeCard
              label={t("prayer.todaySehri")}
              time={todayTimes.Fajr}
              subtitle={t("prayer.fajrStart")}
            />
            <PrayerTimeCard
              label={t("prayer.todayIftar")}
              time={todayTimes.Maghrib}
              subtitle={t("prayer.maghribTime")}
              lang={lang}
            />
            <PrayerTimeCard
              label={t("prayer.tomorrowSehri")}
              time={tomorrowTimes.Fajr}
              subtitle={t("prayer.fajrStart")}
              lang={lang}
            />
            <PrayerTimeCard
              label={t("prayer.tomorrowIftar")}
              time={tomorrowTimes.Maghrib}
              subtitle={t("prayer.maghribTime")}
              lang={lang}
            />
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={handleReminder}
                className={`rounded-full px-6 py-2.5 text-xs uppercase tracking-[0.2em] transition-all hover:scale-105 ${reminderSet
                  ? "bg-slate-700 text-slate-300 hover:bg-slate-600 border border-slate-600"
                  : "btn-gold"
                  }`}
              >
                {reminderSet ? t("reminder.cancel") : t("reminder.set")}
              </button>
              {reminderSet && (
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm font-medium text-green-400">{t("reminder.active")}</span>
                </div>
              )}
            </div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">
              {t(statusKey)}
              {lastUpdated
                ? ` • ${t("status.lastUpdated")} ${new Date(lastUpdated).toLocaleTimeString()}`
                : ""}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="h-[160px]">
            {mounted ? (
              <CountdownTimer label={t(countdownLabelKey)} target={countdownTarget} />
            ) : (
              <div className="h-full rounded-2xl border border-brand-gold/20 bg-brand-deep/70 p-8 text-center shadow-lg backdrop-blur">
                <p className="text-xs uppercase tracking-[0.3em] text-brand-sand">
                  {t(countdownLabelKey)}
                </p>
                <div className="mt-4 flex items-center justify-center gap-4 font-display text-4xl">
                  <span>--</span>
                  <span className="text-brand-sand">:</span>
                  <span>--</span>
                  <span className="text-brand-sand">:</span>
                  <span>--</span>
                </div>
              </div>
            )}
          </div>

          {/* Daily Quote */}
          <div className="h-[160px]">
            <div className="h-full rounded-2xl border border-brand-gold/20 bg-gradient-to-br from-brand-deep/90 to-brand-deep/70 p-6 shadow-lg backdrop-blur relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-brand-gold/5 rounded-full -translate-y-10 translate-x-10" />
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-brand-gold/5 rounded-full translate-y-8 -translate-x-8" />

              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-brand-gold/70 mb-3">
                    {lang === "bn" ? "আজকের বাণী" : "Daily Quote"}
                  </p>
                  <p className="text-sm leading-relaxed text-slate-200 italic">
                    {lang === "bn"
                      ? "\"নিশ্চয়ই আল্লাহর স্মরণে অন্তর প্রশান্ত হয়।\""
                      : "\"Verily, in the remembrance of Allah do hearts find rest.\""}
                  </p>
                </div>
                <p className="text-xs text-brand-sand/60">
                  {lang === "bn" ? "— সূরা আর-রাদ ১৩:২৮" : "— Surah Ar-Ra'd 13:28"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="relative overflow-hidden rounded-3xl border border-brand-gold/30 bg-brand-deep/70 p-6 shadow-xl">
        {/* Decorative Frame */}
        <div className="ornament-frame absolute -left-10 -top-10 h-40 w-40 opacity-20 pointer-events-none" />
        <div className="ornament-frame absolute -right-10 -bottom-10 h-40 w-40 opacity-20 pointer-events-none rotate-180" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-brand-sand">{t("ramadan.title")}</p>
            <p className="text-sm text-slate-300">{t("ramadan.note")}</p>
          </div>
          <div className="flex flex-col items-end gap-1 text-xs uppercase tracking-[0.3em] text-slate-400">
            <span>{t(ramadanStatusKey)}</span>
            <span>{t(locationModeKey)}</span>
          </div>
        </div>
        <div className="mt-8">
          {/* Unified Timeline Layout (Responsive) */}
          <div className="flex flex-col gap-10">
            {(() => {
              const phases = [
                { key: "rahmah", start: 1, label: t("ramadan.phase.rahmah") },
                { key: "maghfirah", start: 11, label: t("ramadan.phase.maghfirah") },
                { key: "najat", start: 21, label: t("ramadan.phase.najat") }
              ];

              return phases.map((phase) => {
                const phaseDays = ramadanDays.filter(
                  (d) => d.hijriDay >= phase.start && d.hijriDay < phase.start + 10
                );

                if (phaseDays.length === 0) return null;

                return (
                  <div key={phase.key} className="flex flex-col gap-6">
                    {/* Phase Decorative Header */}
                    <div className="flex items-center gap-6">
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-brand-gold/30 to-transparent" />
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] uppercase tracking-[0.4em] text-brand-gold/60 font-medium mb-1">Ramadan Phase</span>
                        <h3 className="whitespace-nowrap text-center text-sm font-bold uppercase tracking-[0.2em] text-brand-sand">
                          {phase.label}
                        </h3>
                      </div>
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-brand-gold/30 to-transparent" />
                    </div>

                    <div className="grid grid-cols-1 gap-4 lg:gap-5">
                      {phaseDays.map((day) => {
                        const today = isToday(day.gregorianDate);
                        return (
                          <div
                            key={day.gregorianDate}
                            className={`group relative flex flex-col lg:flex-row lg:items-center justify-between overflow-hidden rounded-2xl border p-6 md:p-8 transition-all duration-500 ${today
                              ? "border-brand-gold bg-brand-gold/15 shadow-[0_0_40px_rgba(196,160,82,0.2)] ring-2 ring-brand-gold/50 z-10 scale-[1.02]"
                              : "border-brand-gold/10 bg-brand-deep/40 hover:border-brand-gold/30 hover:bg-brand-deep/60"
                              }`}
                          >
                            {/* Today Glow Effect Decor */}
                            {today && (
                              <div className="absolute inset-0 bg-gradient-to-r from-brand-gold/10 via-transparent to-brand-gold/10 pointer-events-none animate-pulse-slow" />
                            )}
                            {/* Day and Date Section (Timeline Node) */}
                            <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10 lg:min-w-[280px]">
                              <div className="relative flex items-center justify-center min-w-[80px] sm:min-w-[100px]">
                                {/* Timeline Line Accent - Hidden on mobile */}
                                <div className="hidden sm:block absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-gradient-to-b from-brand-gold/0 via-brand-gold/60 to-brand-gold/0 rounded-full" />

                                <div className="flex flex-col items-center sm:ml-4">
                                  <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.3em] text-brand-sand/50 font-bold mb-1">{t("ramadan.col.day")}</span>
                                  <span className="font-display text-5xl sm:text-6xl leading-none text-brand-sand drop-shadow-[0_0_10px_rgba(196,160,82,0.3)]">
                                    {lang === "bn" ? toBanglaDigits(day.hijriDay) : day.hijriDay}
                                  </span>
                                </div>
                              </div>

                              {/* Divider on mobile */}
                              <div className="h-px w-16 bg-brand-gold/20 sm:hidden" />

                              <div className="flex flex-col gap-1 sm:border-l border-brand-gold/10 sm:pl-6 sm:h-12 justify-center items-center sm:items-start text-center sm:text-left">
                                <span className="text-xl sm:text-2xl font-bold text-slate-100 leading-none">
                                  {lang === "bn" ? toBanglaDigits(day.gregorianDate) : day.gregorianDate}
                                </span>
                                <span className="text-xs uppercase tracking-[0.2em] text-slate-400 font-medium">
                                  {translateWeekday(day.weekday, lang)}
                                </span>
                              </div>
                            </div>

                            {/* Prayer Times Section */}
                            <div className="mt-8 lg:mt-0 flex flex-row items-center justify-between sm:justify-around lg:justify-end gap-4 sm:gap-12 lg:gap-20 px-2 sm:px-6 lg:px-10 border-t lg:border-t-0 lg:border-l border-brand-gold/10 pt-6 lg:pt-0 w-full lg:w-auto">
                              <div className="flex flex-col items-center lg:items-end gap-1">
                                <div className="flex items-center gap-2 text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-brand-sand/70 font-bold mb-1">
                                  <FiSunrise className="text-brand-gold text-xs" />
                                  {t("ramadan.col.sehri")}
                                </div>
                                <span className="text-xl sm:text-2xl font-black text-white leading-none">
                                  {formatTo12Hour(day.fajr, lang)}
                                </span>
                              </div>

                              <div className="h-10 w-px bg-brand-gold/10" />

                              <div className="flex flex-col items-center lg:items-start gap-1">
                                <div className="flex items-center gap-2 text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-brand-sand/70 font-bold mb-1">
                                  <FiMoon className="text-brand-gold text-xs" />
                                  {t("ramadan.col.iftar")}
                                </div>
                                <span className="text-xl sm:text-2xl font-black text-white leading-none">
                                  {formatTo12Hour(day.maghrib, lang)}
                                </span>
                              </div>
                            </div>

                            {/* Background Ornament for 'Today' */}
                            {today && (
                              <div className="absolute right-0 top-0 bottom-0 w-24 overflow-hidden pointer-events-none opacity-20 hidden lg:block">
                                <div className="ornament-frame absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-48 w-48 rotate-45" />
                              </div>
                            )}

                            {today && (
                              <div className="absolute right-0 top-0 overflow-hidden">
                                <div className="bg-brand-gold px-8 py-1.5 text-[9px] font-black uppercase text-brand-deep rotate-45 translate-x-8 sm:translate-x-6 translate-y-2 shadow-lg ring-1 ring-brand-deep/10">
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
      </section>

      <PermissionModal
        isOpen={showPermissionModal}
        onRequestClose={() => setShowPermissionModal(false)}
        onConfirm={handlePermissionConfirm}
        type={permissionType}
        title={t(
          permissionType === "location" ? "permission.loc.title" :
            permissionType === "notification" ? "permission.notif.title" :
              permissionType === "location_denied" ? "permission.loc.denied.title" :
                "permission.notif.denied.title"
        )}
        message={t(
          permissionType === "location" ? "permission.loc.message" :
            permissionType === "notification" ? "permission.notif.message" :
              permissionType === "location_denied" ? "permission.loc.denied.message" :
                "permission.notif.denied.message"
        )}
        confirmText={t(
          (permissionType === "location_denied" || permissionType === "notification_denied")
            ? "permission.close"
            : "permission.allow"
        )}
        cancelText={t(
          (permissionType === "location_denied" || permissionType === "notification_denied")
            ? "permission.later" // Or hidden?
            : "permission.later"
        )}
      />
    </section >
  );
}
