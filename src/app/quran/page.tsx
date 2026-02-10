"use client";

import { useEffect, useMemo, useState } from "react";
import { loadJSON, saveJSON } from "../../lib/storage";
import { useLang } from "../../lib/i18n";

type Ayah = {
  surah: string;
  ayah: string;
  arabic: string;
  bangla: string;
  english: string;
};

type Hadith = {
  source: string;
  text: string;
  reference: string;
};

type Surah = {
  name: string;
  verses: { ayah: string; text: string }[];
};

const BOOKMARK_KEY = "rramadhan_ayah_bookmarks";

export default function QuranPage() {
  const { t } = useLang();
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [hadiths, setHadiths] = useState<Hadith[]>([]);
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [bookmarks, setBookmarks] = useState<string[]>(() => loadJSON<string[]>(BOOKMARK_KEY) ?? []);

  useEffect(() => {
    Promise.all([
      fetch("/data/ayahs.json").then((res) => res.json()),
      fetch("/data/hadith.json").then((res) => res.json()),
      fetch("/data/surah_sample.json").then((res) => res.json())
    ])
      .then(([ayahData, hadithData, surahData]) => {
        setAyahs(ayahData);
        setHadiths(hadithData);
        setSurahs(surahData);
      })
      .catch(() => {
        setAyahs([]);
        setHadiths([]);
        setSurahs([]);
      });
  }, []);

  const ayahOfDay = useMemo(() => {
    if (!ayahs.length) return null;
    const index = new Date().getDate() % ayahs.length;
    return ayahs[index];
  }, [ayahs]);

  const toggleBookmark = (ayahId: string) => {
    const exists = bookmarks.includes(ayahId);
    const next = exists
      ? bookmarks.filter((id) => id !== ayahId)
      : [...bookmarks, ayahId];
    setBookmarks(next);
    saveJSON(BOOKMARK_KEY, next);
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-8 px-6 py-16">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-3xl">{t("quran.title")}</h1>
        <p className="text-slate-300">{t("quran.subtitle")}</p>
      </header>

      {ayahOfDay ? (
        <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-brand-teal">{t("quran.ayah")}</p>
              <h2 className="mt-2 text-xl text-slate-100">{ayahOfDay.surah} {ayahOfDay.ayah}</h2>
            </div>
            <button
              onClick={() => toggleBookmark(ayahOfDay.ayah)}
              className="rounded-full border border-brand-teal/50 px-4 py-2 text-xs uppercase tracking-[0.2em] text-brand-teal"
            >
              {bookmarks.includes(ayahOfDay.ayah) ? t("quran.bookmarked") : t("quran.bookmark")}
            </button>
          </div>
          <p className="mt-4 text-2xl text-slate-100">{ayahOfDay.arabic}</p>
          <p className="mt-3 text-base text-slate-200">{ayahOfDay.bangla}</p>
          <p className="mt-2 text-sm text-slate-300">{ayahOfDay.english}</p>
        </section>
      ) : (
        <p className="text-slate-300">{t("quran.ayahUnavailable")}</p>
      )}

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <h3 className="text-lg text-slate-100">{t("quran.hadith")}</h3>
          {hadiths.length ? (
            <p className="mt-4 text-slate-200">{hadiths[0].text}</p>
          ) : (
            <p className="mt-4 text-slate-300">{t("quran.hadithUnavailable")}</p>
          )}
          {hadiths.length ? (
            <p className="mt-2 text-sm text-slate-400">{hadiths[0].source} • {hadiths[0].reference}</p>
          ) : null}
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <h3 className="text-lg text-slate-100">{t("quran.bookmarks")}</h3>
          {bookmarks.length ? (
            <ul className="mt-3 flex flex-col gap-2 text-sm text-slate-200">
              {bookmarks.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-slate-400">{t("quran.noBookmarks")}</p>
          )}
        </div>
      </section>

      <section className="grid gap-6">
        <h3 className="text-lg text-slate-100">{t("quran.surah")}</h3>
        {surahs.map((surah) => (
          <div key={surah.name} className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h4 className="text-xl text-brand-light">{surah.name}</h4>
            <ul className="mt-4 flex flex-col gap-2 text-sm text-slate-200">
              {surah.verses.map((verse) => (
                <li key={verse.ayah}>
                  <span className="text-brand-teal">{verse.ayah}</span> {verse.text}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </main>
  );
}
