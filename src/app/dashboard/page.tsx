"use client";

import { useEffect, useState, useMemo } from "react";
import { useLang } from "../../lib/i18n";
import { loadSettings } from "../../lib/settings";
import { fetchPrayerTimes, formatTo12Hour, toLocalDateTime, type PrayerTimes } from "../../lib/prayerTime";
import { fetchRandomHadith, type HadithData } from "../../lib/hadith-api";
import { loadJSON, saveJSON } from "../../lib/storage";
import { FiCheckCircle, FiCircle, FiBook, FiCompass, FiCalendar, FiActivity, FiSunrise, FiMoon, FiSun } from "react-icons/fi";
import Link from "next/link";

type PrayerName = "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";

type DailyTracker = {
  date: string;
  prayers: Record<PrayerName, boolean>;
  quran: boolean;
  dua: boolean;
  roza: boolean;
};

const TRACKER_KEY = "rramadhan_daily_tracker_v1";

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

const prayerIcons: Record<PrayerName, typeof FiMoon> = {
  fajr: FiSunrise,
  dhuhr: FiSun,
  asr: FiSun,
  maghrib: FiMoon,
  isha: FiMoon,
};

export default function DashboardPage() {
  const { t, lang } = useLang();
  const [today, setToday] = useState<DailyTracker | null>(null);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [hadith, setHadith] = useState<HadithData | null>(null);
  const [hijriDate, setHijriDate] = useState<string>("");
  const [now, setNow] = useState(() => new Date());

  // Live clock tick
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    // Load today's tracker
    const allData = loadJSON<DailyTracker[]>(TRACKER_KEY) ?? [];
    const key = getTodayKey();
    const entry = allData.find((item) => item.date === key) ?? {
      date: key,
      prayers: { fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false },
      quran: false,
      dua: false,
      roza: false
    };
    setToday(entry);

    // Fetch prayer times
    const settings = loadSettings();
    const lat = settings.lat ?? 23.8103;
    const lon = settings.lon ?? 90.4125;
    fetchPrayerTimes(lat, lon, new Date(), settings.school)
      .then((data) => setPrayerTimes(data.timings))
      .catch(() => setPrayerTimes(null));

    // Fetch hadith
    fetchRandomHadith()
      .then(setHadith)
      .catch(() => setHadith(null));

    // Fetch Hijri date
    const todayDate = new Date();
    const dd = String(todayDate.getDate()).padStart(2, '0');
    const mm = String(todayDate.getMonth() + 1).padStart(2, '0');
    const yyyy = todayDate.getFullYear();
    const dateFormatted = `${dd}-${mm}-${yyyy}`;

    fetch(`https://api.aladhan.com/v1/gToH/${dateFormatted}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.code === 200 && data.data?.hijri) {
          const h = data.data.hijri;
          setHijriDate(`${h.day} ${h.month.ar} ${h.year}`);
        } else {
          setHijriDate("--");
        }
      })
      .catch(() => setHijriDate("--"));
  }, []);

  const togglePrayer = (prayer: PrayerName) => {
    if (!today) return;
    const updated = { ...today, prayers: { ...today.prayers, [prayer]: !today.prayers[prayer] } };
    setToday(updated);
    saveTracker(updated);
  };

  const toggleActivity = (field: "quran" | "dua" | "roza") => {
    if (!today) return;
    const updated = { ...today, [field]: !today[field] };
    setToday(updated);
    saveTracker(updated);
  };

  const saveTracker = (entry: DailyTracker) => {
    const allData = loadJSON<DailyTracker[]>(TRACKER_KEY) ?? [];
    const filtered = allData.filter((item) => item.date !== entry.date);
    const result = [...filtered, entry].sort((a, b) => a.date.localeCompare(b.date));
    saveJSON(TRACKER_KEY, result);
  };

  const completionPercentage = useMemo(() => {
    if (!today) return 0;
    const total = 8; // 5 prayers + quran + dua + roza
    const completed = Object.values(today.prayers).filter(Boolean).length +
      [today.quran, today.dua, today.roza].filter(Boolean).length;
    return Math.round((completed / total) * 100);
  }, [today]);

  const prayers: { name: PrayerName; label: string; time?: string }[] = [
    { name: "fajr", label: lang === "bn" ? "ফজর" : "Fajr", time: prayerTimes?.Fajr },
    { name: "dhuhr", label: lang === "bn" ? "যুহর" : "Dhuhr", time: prayerTimes?.Dhuhr },
    { name: "asr", label: lang === "bn" ? "আসর" : "Asr", time: prayerTimes?.Asr },
    { name: "maghrib", label: lang === "bn" ? "মাগরিব" : "Maghrib", time: prayerTimes?.Maghrib },
    { name: "isha", label: lang === "bn" ? "ইশা" : "Isha", time: prayerTimes?.Isha }
  ];

  // Determine next prayer and countdown
  const { nextPrayer, countdown, sortedPrayers } = useMemo(() => {
    if (!prayerTimes) return { nextPrayer: null, countdown: null, sortedPrayers: prayers };

    const todayDate = new Date();
    const prayerEntries = prayers
      .filter((p) => p.time)
      .map((p) => {
        const dt = toLocalDateTime(todayDate, p.time!);
        return { ...p, dateTime: dt, remaining: dt.getTime() - now.getTime() };
      });

    // Find the next upcoming prayer (remaining > 0)
    const upcoming = prayerEntries.filter((p) => p.remaining > 0);
    const next = upcoming.length > 0 ? upcoming[0] : null;

    let countdownStr: string | null = null;
    if (next) {
      const totalSec = Math.max(0, Math.floor(next.remaining / 1000));
      const h = Math.floor(totalSec / 3600);
      const m = Math.floor((totalSec % 3600) / 60);
      const s = totalSec % 60;
      countdownStr = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    }

    // Sort prayers: next prayer first, then upcoming, then passed
    const sorted = [...prayers].sort((a, b) => {
      if (!a.time || !b.time) return 0;
      const aTime = toLocalDateTime(todayDate, a.time).getTime();
      const bTime = toLocalDateTime(todayDate, b.time).getTime();
      const aUpcoming = aTime > now.getTime();
      const bUpcoming = bTime > now.getTime();
      if (aUpcoming && !bUpcoming) return -1;
      if (!aUpcoming && bUpcoming) return 1;
      return aTime - bTime;
    });

    return { nextPrayer: next, countdown: countdownStr, sortedPrayers: sorted };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prayerTimes, now, lang]);

  const quickLinks = [
    { href: "/quran", icon: FiBook, label: lang === "bn" ? "কুরআন" : "Quran" },
    { href: "/qibla", icon: FiCompass, label: lang === "bn" ? "কিবলা" : "Qibla" },
    { href: "/calendar", icon: FiCalendar, label: lang === "bn" ? "ক্যালেন্ডার" : "Calendar" },
    { href: "/tasbih", icon: FiActivity, label: lang === "bn" ? "তাসবিহ" : "Tasbih" }
  ];

  const isPrayerPassed = (time?: string) => {
    if (!time) return false;
    const dt = toLocalDateTime(new Date(), time);
    return now.getTime() > dt.getTime();
  };

  const isNextPrayer = (name: PrayerName) => nextPrayer?.name === name;

  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-8 px-4 sm:px-6 py-12 sm:py-16">
      {/* Header */}
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-3xl sm:text-4xl text-white">{t("dashboard.title")}</h1>
        <p className="text-slate-300">{t("dashboard.subtitle")}</p>
      </header>

      {/* Next Prayer Hero Card */}
      {nextPrayer && (
        <div className="relative overflow-hidden rounded-3xl border border-brand-gold/30 bg-gradient-to-br from-brand-deep/90 via-brand-deep/70 to-emerald-900/30 p-6 sm:p-8 shadow-2xl">
          {/* Decorative */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-brand-gold/5 rounded-full -translate-y-20 translate-x-20" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-full translate-y-16 -translate-x-16" />

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              {/* Prayer Icon */}
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-gold/20 border border-brand-gold/30">
                {(() => {
                  const Icon = prayerIcons[nextPrayer.name];
                  return <Icon className="h-8 w-8 text-brand-gold" />;
                })()}
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-brand-sand/70 mb-1">
                  {lang === "bn" ? "পরবর্তী নামাজ" : "Next Prayer"}
                </p>
                <h2 className="font-display text-3xl sm:text-4xl text-white">{nextPrayer.label}</h2>
                <p className="text-sm text-slate-400 mt-0.5">
                  {lang === "bn" ? "শুরু" : "Starts at"} {formatTo12Hour(nextPrayer.time!, lang)}
                </p>
              </div>
            </div>

            {/* Countdown */}
            <div className="flex flex-col items-center sm:items-end">
              <p className="text-xs uppercase tracking-[0.3em] text-brand-sand/70 mb-2">
                {lang === "bn" ? "বাকি সময়" : "Starts in"}
              </p>
              <div className="flex items-center gap-1 font-display text-4xl sm:text-5xl text-white tabular-nums">
                {countdown?.split(":").map((part, i) => (
                  <span key={i} className="flex items-center">
                    <span className="inline-block min-w-[2ch] text-center">{part}</span>
                    {i < 2 && <span className="text-brand-gold/60 mx-0.5">:</span>}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* If all prayers passed */}
      {!nextPrayer && prayerTimes && (
        <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-6 sm:p-8 text-center">
          <p className="text-2xl font-bold text-emerald-400">
            {lang === "bn" ? "আজকের সব নামাজের ওয়াক্ত শেষ!" : "All prayer times have passed for today!"}
          </p>
          <p className="text-slate-400 mt-2">
            {lang === "bn" ? "আগামীকালের জন্য প্রস্তুত থাকুন" : "Be ready for tomorrow"}
          </p>
        </div>
      )}

      {/* Top Stats Row */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {/* Hijri Date */}
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-6">
          <p className="text-xs uppercase tracking-wider text-emerald-400 mb-2">
            {lang === "bn" ? "হিজরি তারিখ" : "Hijri Date"}
          </p>
          <p className="text-2xl font-bold text-white">{hijriDate || "Loading..."}</p>
        </div>

        {/* Completion */}
        <div className="rounded-2xl border border-teal-500/20 bg-teal-500/10 p-6">
          <p className="text-xs uppercase tracking-wider text-teal-400 mb-2">
            {lang === "bn" ? "আজকের সম্পূর্ণতা" : "Today's Completion"}
          </p>
          <div className="flex items-end gap-2">
            <p className="text-2xl font-bold text-white">{completionPercentage}%</p>
            <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden mb-1.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-teal-400 to-emerald-400 transition-all duration-700"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Current Time */}
        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-6 sm:col-span-2 lg:col-span-1">
          <p className="text-xs uppercase tracking-wider text-blue-400 mb-2">
            {lang === "bn" ? "বর্তমান সময়" : "Current Time"}
          </p>
          <p className="text-2xl font-bold text-white tabular-nums">
            {now.toLocaleTimeString(lang === "bn" ? "bn-BD" : "en-US", { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        {/* Left Column */}
        <div className="flex flex-col gap-6">
          {/* Prayer Tracker - sorted by next waqt */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              {lang === "bn" ? "আজকের নামাজ" : "Today's Salah"}
            </h2>
            <div className="flex flex-col gap-3">
              {sortedPrayers.map((prayer) => {
                const isNext = isNextPrayer(prayer.name);
                const passed = isPrayerPassed(prayer.time);
                const Icon = prayerIcons[prayer.name];

                return (
                  <button
                    key={prayer.name}
                    onClick={() => togglePrayer(prayer.name)}
                    className={`flex items-center justify-between rounded-xl border p-4 transition-all ${isNext
                        ? "border-brand-gold/50 bg-brand-gold/10 ring-1 ring-brand-gold/30 shadow-lg shadow-brand-gold/5"
                        : today?.prayers[prayer.name]
                          ? "border-emerald-500/50 bg-emerald-500/10"
                          : passed
                            ? "border-white/5 bg-white/[0.02] opacity-60"
                            : "border-white/10 bg-white/5 hover:border-white/20"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      {today?.prayers[prayer.name] ? (
                        <FiCheckCircle className="h-5 w-5 text-emerald-400" />
                      ) : (
                        <FiCircle className={`h-5 w-5 ${isNext ? "text-brand-gold" : "text-slate-400"}`} />
                      )}
                      <Icon className={`h-4 w-4 ${isNext ? "text-brand-gold" : "text-slate-500"}`} />
                      <span className={`font-medium ${isNext ? "text-brand-gold" : "text-white"}`}>{prayer.label}</span>
                      {isNext && (
                        <span className="ml-2 rounded-full bg-brand-gold/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-gold">
                          {lang === "bn" ? "পরবর্তী" : "Next"}
                        </span>
                      )}
                      {passed && !isNext && !today?.prayers[prayer.name] && (
                        <span className="ml-2 rounded-full bg-white/5 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          {lang === "bn" ? "শেষ" : "Passed"}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {isNext && countdown && (
                        <span className="text-xs font-mono text-brand-gold/80 tabular-nums">
                          {countdown}
                        </span>
                      )}
                      {prayer.time && (
                        <span className={`text-sm ${isNext ? "text-brand-gold font-semibold" : "text-slate-400"}`}>
                          {formatTo12Hour(prayer.time, lang)}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Other Activities */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              {lang === "bn" ? "অন্যান্য ইবাদত" : "Other Activities"}
            </h2>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => toggleActivity("roza")}
                className={`flex items-center gap-3 rounded-xl border p-4 transition-all ${today?.roza
                  ? "border-emerald-500/50 bg-emerald-500/10"
                  : "border-white/10 bg-white/5 hover:border-white/20"
                  }`}
              >
                {today?.roza ? (
                  <FiCheckCircle className="h-5 w-5 text-emerald-400" />
                ) : (
                  <FiCircle className="h-5 w-5 text-slate-400" />
                )}
                <span className="font-medium text-white">{t("dashboard.roza")}</span>
              </button>
              <button
                onClick={() => toggleActivity("quran")}
                className={`flex items-center gap-3 rounded-xl border p-4 transition-all ${today?.quran
                  ? "border-emerald-500/50 bg-emerald-500/10"
                  : "border-white/10 bg-white/5 hover:border-white/20"
                  }`}
              >
                {today?.quran ? (
                  <FiCheckCircle className="h-5 w-5 text-emerald-400" />
                ) : (
                  <FiCircle className="h-5 w-5 text-slate-400" />
                )}
                <span className="font-medium text-white">{t("dashboard.quran")}</span>
              </button>
              <button
                onClick={() => toggleActivity("dua")}
                className={`flex items-center gap-3 rounded-xl border p-4 transition-all ${today?.dua
                  ? "border-emerald-500/50 bg-emerald-500/10"
                  : "border-white/10 bg-white/5 hover:border-white/20"
                  }`}
              >
                {today?.dua ? (
                  <FiCheckCircle className="h-5 w-5 text-emerald-400" />
                ) : (
                  <FiCircle className="h-5 w-5 text-slate-400" />
                )}
                <span className="font-medium text-white">{t("dashboard.dua")}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">
          {/* Quick Links */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              {lang === "bn" ? "দ্রুত লিঙ্ক" : "Quick Links"}
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-4 transition-all hover:border-teal-500/30 hover:bg-teal-500/10"
                >
                  <link.icon className="h-6 w-6 text-teal-400" />
                  <span className="text-sm font-medium text-white">{link.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Daily Hadith */}
          {hadith && (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                {lang === "bn" ? "আজকের হাদিস" : "Daily Hadith"}
              </h2>
              <p className="text-slate-200 leading-relaxed mb-3">
                &quot;{lang === "bn" ? hadith.bangla : hadith.english}&quot;
              </p>
              <p className="text-xs text-slate-400">
                {hadith.source} • {hadith.reference}
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
