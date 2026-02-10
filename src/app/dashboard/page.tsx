"use client";

import { useEffect, useState } from "react";
import ProgressRing from "../../components/ProgressRing";
import Badge from "../../components/Badge";
import {
  computeStreak,
  getTodayKey,
  isDailyComplete,
  loadIbadat,
  upsertToday,
  type DailyIbadat
} from "../../lib/tracker";
import { useLang } from "../../lib/i18n";

export default function DashboardPage() {
  const { t } = useLang();
  const [today, setToday] = useState<DailyIbadat | null>(null);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const data = loadIbadat();
    const key = getTodayKey();
    const entry = data.find((item) => item.date === key) ?? {
      date: key,
      roza: false,
      quran: false,
      dua: false
    };
    setToday(entry);
    setStreak(computeStreak(data));
  }, []);

  const toggle = (field: "roza" | "quran" | "dua") => {
    if (!today) return;
    const next = upsertToday({ [field]: !today[field] } as Partial<DailyIbadat>);
    setToday(next);
    setStreak(computeStreak(loadIbadat()));
  };

  const progressValue = today
    ? [today.roza, today.quran, today.dua].filter(Boolean).length
    : 0;

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-8 px-6 py-16">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-3xl">{t("dashboard.title")}</h1>
        <p className="text-slate-300">{t("dashboard.subtitle")}</p>
      </header>

      <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
        <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg text-slate-100">{t("dashboard.today")}</h2>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => toggle("roza")}
              className={`rounded-2xl border px-4 py-3 text-left transition ${
                today?.roza
                  ? "border-brand-gold/70 bg-brand-deep/80"
                  : "border-brand-gold/20 bg-brand-deep/70"
              }`}
            >
              {t("dashboard.roza")}
            </button>
            <button
              onClick={() => toggle("quran")}
              className={`rounded-2xl border px-4 py-3 text-left transition ${
                today?.quran
                  ? "border-brand-gold/70 bg-brand-deep/80"
                  : "border-brand-gold/20 bg-brand-deep/70"
              }`}
            >
              {t("dashboard.quran")}
            </button>
            <button
              onClick={() => toggle("dua")}
              className={`rounded-2xl border px-4 py-3 text-left transition ${
                today?.dua
                  ? "border-brand-gold/70 bg-brand-deep/80"
                  : "border-brand-gold/20 bg-brand-deep/70"
              }`}
            >
              {t("dashboard.dua")}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <ProgressRing value={progressValue} max={3} label={t("dashboard.completion")} />
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-brand-teal">{t("dashboard.streak")}</p>
            <p className="mt-3 font-display text-4xl text-brand-light">
              {streak} {t("dashboard.days")}
            </p>
          </div>
          {today && isDailyComplete(today) ? (
            <Badge title={t("dashboard.badgeEarned")} subtitle={t("dashboard.badgeEarnedSub")} />
          ) : (
            <Badge title={t("dashboard.badgeKeep")} subtitle={t("dashboard.badgeKeepSub")} />
          )}
        </div>
      </div>
    </main>
  );
}
