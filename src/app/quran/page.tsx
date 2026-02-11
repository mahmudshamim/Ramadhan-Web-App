"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { loadJSON, saveJSON } from "../../lib/storage";
import { useLang } from "../../lib/i18n";
import { fetchRandomHadith, type HadithData } from "../../lib/hadith-api";
import { FiPlay, FiPause, FiVolume2 } from "react-icons/fi";

type Ayah = {
  surah: string;
  ayah: string;
  arabic: string;
  bangla: string;
  english: string;
};

type Surah = {
  number: number;
  name: string;
  arabicName?: string;
  englishNameTranslation?: string;
  verses: { ayah: string; text: string }[];
};

const BOOKMARK_KEY = "rramadhan_ayah_bookmarks";

export default function QuranPage() {
  const { t, lang } = useLang();
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [loadingHadith, setLoadingHadith] = useState(false);
  const [hadith, setHadith] = useState<HadithData | null>(null);
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  useEffect(() => {
    setBookmarks(loadJSON<string[]>(BOOKMARK_KEY) ?? []);
  }, []);
  const [currentAudio, setCurrentAudio] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Fetch Ayahs for "Ayah of the Day"
    fetch("/data/ayahs.json")
      .then((res) => res.json())
      .then(setAyahs)
      .catch(() => setAyahs([]));

    // Fetch Full Surah List from API
    fetch("https://api.alquran.cloud/v1/surah")
      .then((res) => res.json())
      .then((data) => {
        if (data.code === 200 && data.data) {
          const formattedSurahs: Surah[] = data.data.map((s: any) => ({
            number: s.number,
            name: s.englishName,
            arabicName: s.name,
            englishNameTranslation: s.englishNameTranslation,
            verses: new Array(s.numberOfAyahs).fill(0).map((_, i) => ({ ayah: `${s.number}:${i + 1}`, text: "" })) // Verses not needed for list view, just count
          }));
          setSurahs(formattedSurahs);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch surahs", err);
        // Fallback to sample if API fails
        fetch("/data/surah_sample.json").then((res) => res.json()).then(setSurahs).catch(() => setSurahs([]));
      });

    refreshHadith();
  }, []);

  const refreshHadith = () => {
    setLoadingHadith(true);
    fetchRandomHadith()
      .then(setHadith)
      .finally(() => setLoadingHadith(false));
  };

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

  const toggleAudio = (surahNumber: number) => {
    if (currentAudio === surahNumber && isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      // Using Mishary Rashid Alafasy audio
      const audioUrl = `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${surahNumber}.mp3`;
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      setCurrentAudio(surahNumber);
      setIsPlaying(true);

      audio.play().catch(e => {
        console.error("Audio playback error", e);
        setIsPlaying(false);
      });

      audio.onended = () => {
        setIsPlaying(false);
        setCurrentAudio(null);
      };
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-12 px-6 py-20 pb-32">
      <header className="flex flex-col gap-3 text-center">
        <h1 className="font-display text-4xl font-bold tracking-tight text-white md:text-5xl">
          {t("quran.title")}
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-slate-400">
          {t("quran.subtitle")}
        </p>
      </header>

      {ayahOfDay ? (
        <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 p-8 shadow-2xl md:p-12">
          <div className="absolute inset-0 bg-[url('/patterns/noise.png')] opacity-20 mix-blend-overlay"></div>
          <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-teal-500/20 blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl"></div>

          <div className="relative flex flex-col items-center text-center">
            <span className="mb-6 inline-flex items-center rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-teal-300 backdrop-blur-sm">
              {t("quran.ayah")}
            </span>

            <h2 className="font-amiri mb-6 max-w-3xl text-3xl leading-relaxed text-white md:text-5xl md:leading-relaxed">
              {ayahOfDay.arabic}
            </h2>

            <div className="flex flex-col gap-4">
              <p className="text-xl font-medium text-teal-100/90 md:text-2xl">
                {ayahOfDay.bangla}
              </p>
              <p className="text-lg text-teal-200/60 font-light">
                {ayahOfDay.english}
              </p>
            </div>

            <div className="mt-8 flex items-center gap-6">
              <div className="text-sm font-semibold tracking-wide text-teal-400">
                {ayahOfDay.surah} • {ayahOfDay.ayah}
              </div>
              <button
                onClick={() => toggleBookmark(ayahOfDay.ayah)}
                className={`group flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all ${bookmarks.includes(ayahOfDay.ayah)
                  ? "bg-teal-500 text-white shadow-lg shadow-teal-500/25"
                  : "bg-white/5 text-teal-300 hover:bg-white/10"
                  }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill={bookmarks.includes(ayahOfDay.ayah) ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-4 w-4"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                </svg>
                {bookmarks.includes(ayahOfDay.ayah)
                  ? t("quran.bookmarked")
                  : t("quran.bookmark")}
              </button>
            </div>
          </div>
        </section>
      ) : (
        <p className="text-center text-slate-400">{t("quran.ayahUnavailable")}</p>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 transition-colors hover:border-white/20 hover:bg-white/10">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100"></div>
          <div className="relative">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-lg font-medium text-emerald-300">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
                {t("quran.hadith")}
              </h3>
              <button
                onClick={refreshHadith}
                disabled={loadingHadith}
                className="rounded-full bg-white/5 p-2 text-emerald-300 transition-all hover:bg-emerald-500/20 hover:text-emerald-200 disabled:opacity-50"
                title="Refresh Hadith"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`h-4 w-4 ${loadingHadith ? 'animate-spin' : ''}`}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
              </button>
            </div>

            {hadith ? (
              <div className={`mt-6 flex flex-col gap-4 transition-opacity duration-300 ${loadingHadith ? 'opacity-50' : 'opacity-100'}`}>
                <p className="text-xl leading-relaxed text-slate-100">
                  &quot;{lang === "bn" ? hadith.bangla : hadith.english}&quot;
                </p>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <span className="font-medium text-emerald-400">{hadith.source}</span>
                  <span>•</span>
                  <span>{hadith.reference}</span>
                </div>
              </div>
            ) : (
              <div className="mt-6 flex h-40 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/5">
                {loadingHadith ? (
                  <p className="text-slate-400 animate-pulse">Loading...</p>
                ) : (
                  <p className="text-slate-400">{t("quran.hadithUnavailable")}</p>
                )}
              </div>
            )}
          </div>
        </section>

        <section className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 transition-colors hover:border-white/20 hover:bg-white/10">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100"></div>
          <div className="relative flex h-full flex-col">
            <h3 className="flex items-center gap-2 text-lg font-medium text-teal-300">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
              </svg>
              {t("quran.bookmarks")}
            </h3>

            {bookmarks.length ? (
              <ul className="mt-6 flex flex-col gap-3">
                {bookmarks.map((item) => (
                  <li key={item} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-3 transition-colors hover:bg-white/10">
                    <span className="font-medium text-slate-200">{item}</span>
                    <button
                      onClick={() => toggleBookmark(item)}
                      className="text-slate-500 hover:text-red-400"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                        <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-6 flex flex-1 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/5 text-center p-6">
                <div className="space-y-2">
                  <p className="text-slate-400">{t("quran.noBookmarks")}</p>
                  <p className="text-xs text-slate-500">Tap the bookmark icon on any ayah to save it here.</p>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      <section>
        <h3 className="mb-6 text-xl font-semibold text-white">{t("quran.surah")}</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {surahs.map((surah) => (
            <div
              key={surah.name}
              className={`group relative cursor-pointer overflow-hidden rounded-2xl border bg-white/5 p-6 transition-all hover:-translate-y-1 hover:border-teal-500/30 hover:shadow-xl hover:shadow-teal-500/5 items-stretch ${currentAudio === surah.number && isPlaying
                ? 'border-emerald-500/50 bg-emerald-500/10'
                : 'border-white/10 hover:bg-white/10'
                }`}
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-medium text-teal-100 group-hover:text-white transition-colors">
                    {surah.name}
                  </h4>
                  <p className="text-xs text-slate-400">{surah.englishNameTranslation}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right mr-2 hidden sm:block">
                    <p className="font-amiri text-lg text-emerald-400">{surah.arabicName}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleAudio(surah.number);
                    }}
                    className={`rounded-full p-2 transition-all ${currentAudio === surah.number && isPlaying
                      ? "bg-white text-emerald-600 shadow-lg"
                      : "bg-white/10 text-emerald-400 hover:bg-emerald-500 hover:text-white"
                      }`}
                  >
                    {currentAudio === surah.number && isPlaying ? (
                      <FiPause className="h-4 w-4" />
                    ) : (
                      <FiPlay className="h-4 w-4 ml-0.5" />
                    )}
                  </button>
                  <div className="rounded-full bg-white/5 px-2 py-1 text-xs text-slate-400 transition-colors group-hover:bg-teal-500/10 group-hover:text-teal-400">
                    {surah.verses.length} verses
                  </div>
                </div>
              </div>
              <div className="text-xs text-slate-500 mt-2">
                {surah.verses.length} Ayahs
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
