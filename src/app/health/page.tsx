"use client";

import { useEffect, useState } from "react";
import { loadWater, updateToday } from "../../lib/water";
import { useLang } from "../../lib/i18n";

export default function HealthPage() {
  const { t, lang } = useLang();
  const [glasses, setGlasses] = useState(0);
  const tips =
    lang === "bn"
      ? [
          "ইফতারে পানি ও খেজুর দিয়ে শুরু করুন।",
          "সেহরিতে কার্ব ও প্রোটিনের ব্যালান্স রাখুন।",
          "অতিরিক্ত লবণ এড়ালে তৃষ্ণা কমে।",
          "ইফতারের পরে হালকা হাঁটাহাঁটি করুন।",
          "সুযোগ হলে আগে ঘুমান ও বিশ্রাম নিন।"
        ]
      : [
          "Start Iftar with water and dates for gentle digestion.",
          "Balance Sehri with complex carbs and protein.",
          "Avoid overly salty foods to reduce thirst.",
          "Take short walks after Iftar to aid digestion.",
          "Sleep early if possible and plan rest breaks."
        ];

  useEffect(() => {
    const entry = loadWater().find((item) => item.date === new Date().toISOString().slice(0, 10));
    if (entry) setGlasses(entry.glasses);
  }, []);

  const adjust = (delta: number) => {
    const next = Math.max(0, glasses + delta);
    setGlasses(next);
    updateToday(next);
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-8 px-6 py-16">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-3xl">{t("health.title")}</h1>
        <p className="text-slate-300">{t("health.subtitle")}</p>
      </header>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-lg text-slate-100">{t("health.water")}</h2>
        <div className="mt-4 flex items-center gap-4">
          <button
            onClick={() => adjust(-1)}
            className="rounded-full border border-white/10 px-4 py-2 text-slate-200"
          >
            -
          </button>
          <p className="text-3xl text-brand-light">{glasses} glasses</p>
          <button
            onClick={() => adjust(1)}
            className="rounded-full border border-brand-teal/50 px-4 py-2 text-brand-teal"
          >
            +
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-400">{t("health.saved")}</p>
      </section>

      <section className="grid gap-3">
        {tips.map((tip) => (
          <div key={tip} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-slate-200">
            {tip}
          </div>
        ))}
      </section>
    </main>
  );
}
