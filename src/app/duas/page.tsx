"use client";

import { useEffect, useState } from "react";
import { useLang } from "../../lib/i18n";

type LocalizedString = {
  en: string;
  bn: string;
};

type Dua = {
  title: LocalizedString;
  arabic: string;
  transliteration: LocalizedString;
  translation: LocalizedString;
};

type DuaData = {
  seheri: Dua;
  iftar: Dua;
};

export default function DuasPage() {
  const { lang, t } = useLang();
  const [data, setData] = useState<DuaData | null>(null);

  useEffect(() => {
    fetch("/data/duas.json")
      .then((res) => res.json())
      .then(setData)
      .catch(() => setData(null));
  }, []);

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-8 px-6 py-16">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-3xl">{t("duas.title")}</h1>
        <p className="text-slate-300">{t("duas.subtitle")}</p>
      </header>

      {data ? (
        <div className="grid gap-6">
          {[data.seheri, data.iftar].map((dua, idx) => (
            <section
              key={idx}
              className="rounded-3xl border border-white/10 bg-white/5 p-6"
            >
              <h2 className="text-xl text-brand-light">{dua.title[lang]}</h2>
              <p className="mt-4 font-arabic text-3xl leading-relaxed text-slate-100">{dua.arabic}</p>
              <p className="mt-3 text-sm text-slate-300">{dua.transliteration[lang]}</p>
              <p className="mt-2 text-base text-slate-200">{dua.translation[lang]}</p>
            </section>
          ))}
        </div>
      ) : (
        <p className="text-slate-300">{t("duas.unavailable")}</p>
      )}
    </main>
  );
}
