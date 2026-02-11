"use client";

import { useEffect, useState, useMemo } from "react";
import { useLang } from "../../lib/i18n";
import { loadSettings } from "../../lib/settings";
import { fetchPrayerTimes, formatTo12Hour, type PrayerTimes } from "../../lib/prayerTime";
import { fetchRandomHadith, type HadithData } from "../../lib/hadith-api";
import { loadJSON, saveJSON } from "../../lib/storage";
import { FiCheckCircle, FiCircle, FiBook, FiCompass, FiCalendar, FiActivity } from "react-icons/fi";
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

export default function DashboardPage() {
  const { t, lang } = useLang();
  const [today, setToday] = useState<DailyTracker | null>(null);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [hadith, setHadith] = useState<HadithData | null>(null);
  const [hijriDate, setHijriDate] = useState<string>("");

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
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    const dateFormatted = `${dd}-${mm}-${yyyy}`;

    fetch(`https://api.aladhan.com/v1/gToH/${dateFormatted}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.code === 200 && data.data?.hijri) {
          const h = data.data.hijri;
          setHijriDate(`${h.day} ${h.month.en} ${h.year}`);
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

  const quickLinks = [
    { href: "/quran", icon: FiBook, label: lang === "bn" ? "কুরআন" : "Quran" },
    { href: "/qibla", icon: FiCompass, label: lang === "bn" ? "কিবলা" : "Qibla" },
    { href: "/calendar", icon: FiCalendar, label: lang === "bn" ? "ক্যালেন্ডার" : "Calendar" },
    { href: "/tasbih", icon: FiActivity, label: lang === "bn" ? "তাসবিহ" : "Tasbih" }
  ];

  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-8 px-4 sm:px-6 py-12 sm:py-16">
      {/* Header */}
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-3xl sm:text-4xl text-white">{t("dashboard.title")}</h1>
        <p className="text-slate-300">{t("dashboard.subtitle")}</p>
      </header>

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
          <p className="text-2xl font-bold text-white">{completionPercentage}%</p>
        </div>

        {/* Next Prayer */}
        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-6 sm:col-span-2 lg:col-span-1">
          <p className="text-xs uppercase tracking-wider text-blue-400 mb-2">
            {lang === "bn" ? "পরবর্তী নামাজ" : "Next Prayer"}
          </p>
          <p className="text-2xl font-bold text-white">
            {prayers.find(p => !today?.prayers[p.name])?.label || (lang === "bn" ? "সব সম্পন্ন!" : "All Done!")}
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        {/* Left Column */}
        <div className="flex flex-col gap-6">
          {/* Prayer Tracker */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              {lang === "bn" ? "আজকের নামাজ" : "Today's Prayers"}
            </h2>
            <div className="flex flex-col gap-3">
              {prayers.map((prayer) => (
                <button
                  key={prayer.name}
                  onClick={() => togglePrayer(prayer.name)}
                  className={`flex items-center justify-between rounded-xl border p-4 transition-all ${today?.prayers[prayer.name]
                    ? "border-emerald-500/50 bg-emerald-500/10"
                    : "border-white/10 bg-white/5 hover:border-white/20"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    {today?.prayers[prayer.name] ? (
                      <FiCheckCircle className="h-5 w-5 text-emerald-400" />
                    ) : (
                      <FiCircle className="h-5 w-5 text-slate-400" />
                    )}
                    <span className="font-medium text-white">{prayer.label}</span>
                  </div>
                  {prayer.time && (
                    <span className="text-sm text-slate-400">
                      {formatTo12Hour(prayer.time, lang)}
                    </span>
                  )}
                </button>
              ))}
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
                "{lang === "bn" ? hadith.bangla : hadith.english}"
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
