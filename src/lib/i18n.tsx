"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

export type Lang = "en" | "bn";

const STORAGE_KEY = "rramadhan_lang_v1";

const STRINGS: Record<Lang, Record<string, string>> = {
  en: {
    "nav.home": "Home",
    "nav.dashboard": "Dashboard",
    "nav.calendar": "Calendar",
    "nav.quran": "Quran",
    "nav.duas": "Duas",
    "nav.zakat": "Zakat",
    "nav.charity": "Charity",
    "nav.health": "Health",
    "nav.plan": "Plan",
    "nav.settings": "Settings",

    "home.brand": "R-Ramadhan",
    "home.title": "Your personal Ramadan companion",
    "home.subtitle": "Every prayer. Every dua. Every day.",
    "home.explore": "Explore Now",
    "home.start": "Start Tracking",
    "home.badgeMain": "Daily Badge",
    "home.badgeTitle": "Consistency",
    "home.badgeSub": "Keep your Roza streak alive.",

    "prayer.todaySehri": "Today Sehri",
    "prayer.todayIftar": "Today Iftar",
    "prayer.tomorrowSehri": "Tomorrow Sehri",
    "prayer.tomorrowIftar": "Tomorrow Iftar",
    "prayer.fajrStart": "Fajr start",
    "prayer.maghribTime": "Maghrib time",

    "countdown.nextIftar": "Time to Iftar",
    "countdown.nextSehri": "Time to Sehri",
    "reminder.set": "Set Iftar Reminder",
    "reminder.cancel": "Cancel Reminder",
    "reminder.active": "Reminder Active",
    "reminder.notifyBefore": "Notify me",
    "reminder.minutes": "min before",
    "reminder.marked": "Marked as set",

    "status.loadingPrayer": "Loading prayer times...",
    "status.offline": "Offline — showing last saved data.",
    "status.locationUnavailable": "Location unavailable — showing last saved data.",
    "status.detecting": "Detecting location...",
    "status.updated": "Live prayer times updated.",
    "status.updateFailed": "Could not update live data — showing last saved data.",
    "status.permissionDenied": "Location permission denied — showing last saved data.",
    "status.usingCity": "Using saved city location.",
    "status.lastUpdated": "Last updated",

    "ramadan.title": "Ramadan 2026 Calendar",
    "ramadan.note": "Hijri 1447 • Dates may vary by moon sighting.",
    "ramadan.status.loading": "Loading Ramadan 2026 calendar...",
    "ramadan.status.offline": "Offline — showing last saved calendar.",
    "ramadan.status.updated": "Ramadan 2026 calendar updated.",
    "ramadan.status.failed": "Could not update Ramadan 2026 calendar.",
    "ramadan.status.offlineCache": "Offline cache loaded.",
    "ramadan.loc.gps": "Using GPS (saved)",
    "ramadan.loc.manual": "Using manual city",
    "ramadan.loc.default": "Using Dhaka default",

    "ramadan.col.day": "Ramadan Day",
    "ramadan.col.date": "Date",
    "ramadan.col.weekday": "Weekday",
    "ramadan.col.sehri": "Sehri",
    "ramadan.col.iftar": "Iftar",
    "ramadan.col.status": "Status",
    "ramadan.today": "Today",

    "ramadan.phase.rahmah": "Rahmah 10 days",
    "ramadan.phase.maghfirah": "Maghfirah 10 days",
    "ramadan.phase.najat": "Najat 10 days",

    "settings.title": "Settings",
    "settings.subtitle": "Control mazhab, location, and reminder behavior.",
    "settings.useGps": "Use GPS Location",
    "settings.gpsHint": "Recommended for accurate prayer times.",
    "settings.detect": "Detect GPS Now",
    "settings.manualCity": "Manual City (Fallback)",
    "settings.mazhab": "Mazhab",
    "settings.reminderOffset": "Reminder Offset (minutes)",
    "settings.ramadanYear": "Ramadan Calendar Year",
    "settings.ramadanMonth": "Ramadan Month (1-12)",
    "settings.language": "Language",
    "settings.status.notSupported": "Geolocation not supported on this device.",
    "settings.status.detecting": "Detecting location...",
    "settings.status.saved": "Location saved.",
    "settings.status.denied": "Location permission denied.",

    "permission.loc.title": "Enable Location",
    "permission.loc.message": "We need your location to show accurate Sehri & Iftar times for your area. Your location data is processed locally and never stored on our servers.",
    "permission.notif.title": "Enable Notifications",
    "permission.notif.message": "Get timely reminders 15 minutes before Iftar so you never miss the moment. We promise not to spam you.",
    "permission.allow": "Allow Access",
    "permission.later": "Maybe Later",
    "permission.settings": "Open Settings",
    "permission.close": "Close",
    "permission.loc.denied.title": "Location Access Denied",
    "permission.loc.denied.message": "We cannot show accurate local timings without location access. Please enable location in your browser settings.",
    "permission.notif.denied.title": "Notifications Blocked",
    "permission.notif.denied.message": "We cannot send reminders because notifications are blocked. Please enable them in your browser settings.",

    "dashboard.title": "Ibadat Dashboard",
    "dashboard.subtitle": "Track your Ramadan progress and streaks.",
    "dashboard.today": "Today’s Checklist",
    "dashboard.roza": "Roza Completed",
    "dashboard.quran": "Quran Reading Done",
    "dashboard.dua": "Duas Completed",
    "dashboard.completion": "Daily Completion",
    "dashboard.streak": "Roza Streak",
    "dashboard.days": "days",
    "dashboard.badgeEarned": "Daily Badge Earned",
    "dashboard.badgeKeep": "Keep Going",
    "dashboard.badgeEarnedSub": "MashaAllah! Keep it up.",
    "dashboard.badgeKeepSub": "Complete all tasks to earn a badge.",

    "calendar.title": "Ramadan Calendar",
    "calendar.subtitle": "Full month timetable with Sehri & Iftar.",
    "calendar.status.loading": "Loading calendar...",
    "calendar.status.offlineCache": "Offline cache loaded.",
    "calendar.status.offline": "Offline — showing last saved calendar.",
    "calendar.status.needLocation": "Set location in Settings to load calendar.",
    "calendar.status.updated": "Calendar updated.",
    "calendar.status.failed": "Could not update calendar — showing last saved data.",

    "duas.title": "Sehri & Iftar Duas",
    "duas.subtitle": "Offline-ready duas with transliteration.",
    "duas.unavailable": "Could not load duas.",

    "quran.title": "Quran & Hadith",
    "quran.subtitle": "Ayah of the day, bookmarks, and selected surahs.",
    "quran.ayah": "Ayah of the Day",
    "quran.ayahUnavailable": "Ayah data unavailable.",
    "quran.bookmark": "Bookmark",
    "quran.bookmarked": "Bookmarked",
    "quran.hadith": "Hadith of the Day",
    "quran.hadithUnavailable": "Hadith data unavailable.",
    "quran.bookmarks": "Bookmarks",
    "quran.noBookmarks": "No bookmarks yet.",
    "quran.surah": "Selected Surahs (Offline)",

    "plan.title": "My Ramadan Plan",
    "plan.subtitle": "Personalize a daily routine based on your goals.",
    "plan.generate": "Generate Plan",
    "plan.quranTarget": "Quran Target",
    "plan.energy": "Energy Level",
    "plan.sleep": "Sleep Pattern",
    "plan.focus": "Focus Area",
    "plan.target.juz1": "1 juz/day",
    "plan.target.juzHalf": "1/2 juz/day",
    "plan.target.surah3": "3 surahs/day",
    "plan.energy.high": "High",
    "plan.energy.medium": "Medium",
    "plan.energy.low": "Low",
    "plan.sleep.taraweeh": "Sleep after Taraweeh",
    "plan.sleep.split": "Split sleep blocks",
    "plan.sleep.early": "Early sleep after Isha",
    "plan.focus.quran": "Quran + Dua",
    "plan.focus.charity": "Charity + Dhikr",
    "plan.focus.family": "Family + Reflection",
    "plan.template": "Morning: Wake up for Sehri, set intention, read {quran}.\nDaytime: Keep hydration plan, short dhikr between tasks.\nBefore Maghrib: Review duas and prepare for Iftar.\nNight: Taraweeh, 10-15 minutes reflection, plan for tomorrow.\nFocus: {focus}. Energy level: {energy}. Sleep: {sleep}.",

    "zakat.title": "Zakat Calculator",
    "zakat.subtitle": "Estimate 2.5% of your net eligible assets.",
    "zakat.cash": "Cash",
    "zakat.gold": "Gold Value",
    "zakat.silver": "Silver Value",
    "zakat.savings": "Savings/Investments",
    "zakat.debt": "Debt & Liabilities",
    "zakat.total": "Total Assets",
    "zakat.net": "Net Eligible",
    "zakat.due": "Zakat Due (2.5%)",
    "zakat.notice": "This calculator provides an estimate only. Consult a local scholar for precise rulings.",

    "charity.title": "Charity Directory",
    "charity.subtitle": "Trusted Bangladesh charities (external links only).",
    "charity.notice": "We do not process donations. You will be redirected to external sites.",
    "charity.visit": "Visit website",

    "health.title": "Health & Wellness",
    "health.subtitle": "Gentle reminders for hydration and nutrition.",
    "health.water": "Water Intake (Iftar → Sehri)",
    "health.saved": "Saved locally on this device."
  },
  bn: {
    "nav.home": "হোম",
    "nav.dashboard": "ড্যাশবোর্ড",
    "nav.calendar": "ক্যালেন্ডার",
    "nav.quran": "কুরআন",
    "nav.duas": "দোয়া",
    "nav.zakat": "যাকাত",
    "nav.charity": "দান",
    "nav.health": "স্বাস্থ্য",
    "nav.plan": "পরিকল্পনা",
    "nav.settings": "সেটিংস",

    "home.brand": "আর-রমাদান",
    "home.title": "আপনার ব্যক্তিগত রমাদান সহচর",
    "home.subtitle": "প্রতিটি নামাজ। প্রতিটি দোয়া। প্রতিদিন।",
    "home.explore": "এক্সপ্লোর করুন",
    "home.start": "ট্র্যাকিং শুরু",
    "home.badgeMain": "দৈনিক ব্যাজ",
    "home.badgeTitle": "নিয়মিততা",
    "home.badgeSub": "আপনার রোজা স্ট্রিক ধরে রাখুন।",

    "prayer.todaySehri": "আজকের সেহরি",
    "prayer.todayIftar": "আজকের ইফতার",
    "prayer.tomorrowSehri": "আগামীকালের সেহরি",
    "prayer.tomorrowIftar": "আগামীকালের ইফতার",
    "prayer.fajrStart": "ফজর শুরু",
    "prayer.maghribTime": "মাগরিব সময়",

    "countdown.nextIftar": "ইফতার বাকি",
    "countdown.nextSehri": "সেহরি বাকি",
    "reminder.set": "ইফতার রিমাইন্ডার সেট",
    "reminder.marked": "সেট করা হয়েছে",

    "status.loadingPrayer": "নামাজের সময় লোড হচ্ছে...",
    "status.offline": "অফলাইন — শেষ সেভ করা তথ্য দেখানো হচ্ছে।",
    "status.locationUnavailable": "লোকেশন পাওয়া যায়নি — শেষ সেভ করা তথ্য দেখানো হচ্ছে।",
    "status.detecting": "লোকেশন খোঁজা হচ্ছে...",
    "status.updated": "নতুন নামাজের সময় আপডেট হয়েছে।",
    "status.updateFailed": "লাইভ ডাটা আপডেট হয়নি — শেষ সেভ করা তথ্য দেখানো হচ্ছে।",
    "status.permissionDenied": "লোকেশন অনুমতি নেই — শেষ সেভ করা তথ্য দেখানো হচ্ছে।",
    "status.usingCity": "সেভ করা সিটি ব্যবহার হচ্ছে।",
    "status.lastUpdated": "শেষ আপডেট",

    "ramadan.title": "রমাদান ২০২৬ ক্যালেন্ডার",
    "ramadan.note": "হিজরি ১৪৪৭ • চাঁদ দেখার উপর তারিখ পরিবর্তন হতে পারে।",
    "ramadan.status.loading": "রমাদান ২০২৬ ক্যালেন্ডার লোড হচ্ছে...",
    "ramadan.status.offline": "অফলাইন — শেষ সেভ করা ক্যালেন্ডার দেখানো হচ্ছে।",
    "ramadan.status.updated": "রমাদান ২০২৬ ক্যালেন্ডার আপডেট হয়েছে।",
    "ramadan.status.failed": "রমাদান ২০২৬ ক্যালেন্ডার আপডেট হয়নি।",
    "ramadan.status.offlineCache": "অফলাইন ক্যাশ লোড হয়েছে।",
    "ramadan.loc.gps": "GPS ব্যবহার হচ্ছে",
    "ramadan.loc.manual": "ম্যানুয়াল সিটি ব্যবহার হচ্ছে",
    "ramadan.loc.default": "ঢাকা ডিফল্ট ব্যবহার হচ্ছে",

    "ramadan.col.day": "রমাদান দিন",
    "ramadan.col.date": "তারিখ",
    "ramadan.col.weekday": "বার",
    "ramadan.col.sehri": "সেহরি",
    "ramadan.col.iftar": "ইফতার",
    "ramadan.col.status": "স্ট্যাটাস",
    "ramadan.today": "আজ",

    "ramadan.phase.rahmah": "রাহমাহ ১০ দিন",
    "ramadan.phase.maghfirah": "মাগফিরাহ ১০ দিন",
    "ramadan.phase.najat": "নাজাত ১০ দিন",

    "settings.title": "সেটিংস",
    "settings.subtitle": "মাযহাব, লোকেশন ও রিমাইন্ডার নিয়ন্ত্রণ করুন।",
    "settings.useGps": "GPS লোকেশন ব্যবহার",
    "settings.gpsHint": "সঠিক নামাজের সময়ের জন্য প্রস্তাবিত।",
    "settings.detect": "GPS খুঁজুন",
    "settings.manualCity": "ম্যানুয়াল সিটি (ফলব্যাক)",
    "settings.mazhab": "মাযহাব",
    "settings.reminderOffset": "রিমাইন্ডার অফসেট (মিনিট)",
    "settings.ramadanYear": "রমাদান ক্যালেন্ডার বছর",
    "settings.ramadanMonth": "রমাদান মাস (১-১২)",
    "settings.language": "ভাষা",
    "settings.status.notSupported": "এই ডিভাইসে লোকেশন সাপোর্ট নেই।",
    "settings.status.detecting": "লোকেশন খোঁজা হচ্ছে...",
    "settings.status.saved": "লোকেশন সেভ হয়েছে।",
    "settings.status.denied": "লোকেশন অনুমতি নেই।",

    "permission.loc.title": "লোকেশন চালু করুন",
    "permission.loc.message": "আপনার এলাকার সঠিক সেহরি ও ইফতারের সময় দেখানোর জন্য লোকেশন প্রয়োজন। আপনার তথ্য নিরাপদ থাকবে।",
    "permission.notif.title": "নোটিফিকেশন চালু করুন",
    "permission.notif.message": "ইফতারের ১৫ মিনিট আগে রিমাইন্ডার পেতে নোটিফিকেশন চালু করুন। আমরা অহেতুক নোটিফিকেশন পাঠাব না।",
    "permission.allow": "অনুমতি দিন",
    "permission.later": "পরে দেখব",
    "permission.settings": "সেটিংস খুলুন",
    "permission.close": "বন্ধ করুন",
    "permission.loc.denied.title": "লোকেশন নামঞ্জুর করা হয়েছে",
    "permission.loc.denied.message": "লোকেশন অ্যাক্সেস ছাড়া আমরা সঠিক সময় দেখাতে পারছি না। দয়া করে ব্রাউজার সেটিংস থেকে লোকেশন চালু করুন।",
    "permission.notif.denied.title": "নোটিফিকেশন ব্লক করা",
    "permission.notif.denied.message": "নোটিফিকেশন ব্লক থাকার কারণে আমরা রিমাইন্ডার পাঠাতে পারছি না। দয়া করে সেটিংস থেকে অনুমতি দিন।",

    "dashboard.title": "ইবাদাত ড্যাশবোর্ড",
    "dashboard.subtitle": "রমাদানের অগ্রগতি এবং স্ট্রিক দেখুন।",
    "dashboard.today": "আজকের তালিকা",
    "dashboard.roza": "রোজা সম্পন্ন",
    "dashboard.quran": "কুরআন পড়া হয়েছে",
    "dashboard.dua": "দোয়া সম্পন্ন",
    "dashboard.completion": "দৈনিক সম্পূর্ণতা",
    "dashboard.streak": "রোজা স্ট্রিক",
    "dashboard.days": "দিন",
    "dashboard.badgeEarned": "আজকের ব্যাজ অর্জিত",
    "dashboard.badgeKeep": "চালিয়ে যান",
    "dashboard.badgeEarnedSub": "মাশাআল্লাহ! চালিয়ে যান।",
    "dashboard.badgeKeepSub": "সব কাজ পূর্ণ করলে ব্যাজ পাবেন।",

    "calendar.title": "রমাদান ক্যালেন্ডার",
    "calendar.subtitle": "পূর্ণ মাসের সেহরি ও ইফতার সময়সূচি।",
    "calendar.status.loading": "ক্যালেন্ডার লোড হচ্ছে...",
    "calendar.status.offlineCache": "অফলাইন ক্যাশ লোড হয়েছে।",
    "calendar.status.offline": "অফলাইন — শেষ সেভ করা ক্যালেন্ডার দেখানো হচ্ছে।",
    "calendar.status.needLocation": "ক্যালেন্ডার লোড করতে সেটিংসে লোকেশন দিন।",
    "calendar.status.updated": "ক্যালেন্ডার আপডেট হয়েছে।",
    "calendar.status.failed": "ক্যালেন্ডার আপডেট হয়নি — শেষ সেভ করা ডাটা দেখানো হচ্ছে।",

    "duas.title": "সেহরি ও ইফতার দোয়া",
    "duas.subtitle": "অফলাইন দোয়া ও উচ্চারণ।",
    "duas.unavailable": "দোয়া লোড করা যায়নি।",

    "quran.title": "কুরআন ও হাদিস",
    "quran.subtitle": "আজকের আয়াত, বুকমার্ক ও নির্বাচিত সূরা।",
    "quran.ayah": "আজকের আয়াত",
    "quran.ayahUnavailable": "আজকের আয়াত পাওয়া যায়নি।",
    "quran.bookmark": "বুকমার্ক",
    "quran.bookmarked": "বুকমার্ক হয়েছে",
    "quran.hadith": "আজকের হাদিস",
    "quran.hadithUnavailable": "আজকের হাদিস পাওয়া যায়নি।",
    "quran.bookmarks": "বুকমার্কসমূহ",
    "quran.noBookmarks": "এখনও কোনো বুকমার্ক নেই।",
    "quran.surah": "নির্বাচিত সূরা (অফলাইন)",

    "plan.title": "আমার রমাদান পরিকল্পনা",
    "plan.subtitle": "আপনার লক্ষ্য অনুযায়ী দৈনিক রুটিন তৈরি করুন।",
    "plan.generate": "পরিকল্পনা তৈরি করুন",
    "plan.quranTarget": "কুরআন টার্গেট",
    "plan.energy": "এনার্জি লেভেল",
    "plan.sleep": "ঘুমের ধরন",
    "plan.focus": "ফোকাস এরিয়া",
    "plan.target.juz1": "১ জুজ/দিন",
    "plan.target.juzHalf": "১/২ জুজ/দিন",
    "plan.target.surah3": "৩ সূরা/দিন",
    "plan.energy.high": "উচ্চ",
    "plan.energy.medium": "মাঝারি",
    "plan.energy.low": "কম",
    "plan.sleep.taraweeh": "তারাবির পর ঘুম",
    "plan.sleep.split": "ভাগ করে ঘুম",
    "plan.sleep.early": "এশার পর আগেভাগে ঘুম",
    "plan.focus.quran": "কুরআন + দোয়া",
    "plan.focus.charity": "দান + জিকির",
    "plan.focus.family": "পরিবার + আত্মসমালোচনা",
    "plan.template": "সকাল: সেহরিতে উঠুন, নিয়ত করুন, {কুরআন} পড়ুন।\nদিন: পানি পরিকল্পনা বজায় রাখুন, ছোট জিকির করুন।\nমাগরিবের আগে: দোয়া রিভিউ করুন ও ইফতার প্রস্তুতি নিন।\nরাত: তারাবি, ১০-১৫ মিনিট ভাবনা, আগামী দিনের পরিকল্পনা।\nফোকাস: {focus}। এনার্জি: {energy}। ঘুম: {sleep}।",

    "zakat.title": "যাকাত ক্যালকুলেটর",
    "zakat.subtitle": "যোগ্য সম্পদের ২.৫% হিসাব করুন।",
    "zakat.cash": "নগদ টাকা",
    "zakat.gold": "স্বর্ণের মূল্য",
    "zakat.silver": "রূপার মূল্য",
    "zakat.savings": "সঞ্চয়/বিনিয়োগ",
    "zakat.debt": "ঋণ ও দায়",
    "zakat.total": "মোট সম্পদ",
    "zakat.net": "নেট যোগ্য সম্পদ",
    "zakat.due": "যাকাত (২.৫%)",
    "zakat.notice": "এই হিসাবটি আনুমানিক। সঠিক নির্দেশনার জন্য আলেমের পরামর্শ নিন।",

    "charity.title": "দাতব্য ডিরেক্টরি",
    "charity.subtitle": "বাংলাদেশের বিশ্বস্ত সংস্থার তালিকা।",
    "charity.notice": "আমরা দান গ্রহণ করি না। আপনাকে বাহ্যিক সাইটে নেওয়া হবে।",
    "charity.visit": "ওয়েবসাইট দেখুন",

    "health.title": "স্বাস্থ্য ও সুস্থতা",
    "health.subtitle": "পানি ও পুষ্টির জন্য কোমল রিমাইন্ডার।",
    "health.water": "পানি গ্রহণ (ইফতার → সেহরি)",
    "health.saved": "এই ডিভাইসে সেভ হয়।"
  }
};

interface I18nContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(STORAGE_KEY) as Lang | null;
    if (saved === "en" || saved === "bn") {
      setLangState(saved);
    }
  }, []);

  const updateLang = useCallback((next: Lang) => {
    setLangState(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, next);
    }
  }, []);

  const t = useCallback(
    (key: string) => STRINGS[lang][key] ?? STRINGS.en[key] ?? key,
    [lang]
  );

  const Provider = I18nContext.Provider;
  return (
    <Provider value={{ lang, setLang: updateLang, t }}>
      {children}
    </Provider>
  );
}

export function useLang() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error("useLang must be used within an I18nProvider");
  }
  return context;
}
