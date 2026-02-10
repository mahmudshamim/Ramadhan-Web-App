"use client";

import { useLang } from "../../lib/i18n";

const charities = [
  {
    name: "BRAC",
    descriptionEn: "One of the largest development organizations in Bangladesh.",
    descriptionBn: "বাংলাদেশের অন্যতম বৃহৎ উন্নয়ন সংস্থা।",
    url: "https://www.brac.net/"
  },
  {
    name: "Islamic Relief Bangladesh",
    descriptionEn: "Humanitarian programs and Ramadan relief.",
    descriptionBn: "মানবিক কার্যক্রম ও রমাদান সহায়তা।",
    url: "https://islamic-relief.org/"
  },
  {
    name: "Anjuman Mufidul Islam",
    descriptionEn: "Social welfare and humanitarian services in Bangladesh.",
    descriptionBn: "বাংলাদেশে সামাজিক কল্যাণ ও মানবিক সেবা।",
    url: "https://www.anjumanmufidulislam.org/"
  }
];

export default function CharityPage() {
  const { t, lang } = useLang();
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-8 px-6 py-16">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-3xl">{t("charity.title")}</h1>
        <p className="text-slate-300">{t("charity.subtitle")}</p>
      </header>

      <section className="grid gap-4">
        {charities.map((charity) => (
          <div key={charity.name} className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl text-slate-100">{charity.name}</h2>
            <p className="mt-2 text-slate-300">
              {lang === "bn" ? charity.descriptionBn : charity.descriptionEn}
            </p>
            <a
              href={charity.url}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex rounded-full border border-brand-teal/50 px-4 py-2 text-xs uppercase tracking-[0.2em] text-brand-teal"
            >
              {t("charity.visit")}
            </a>
          </div>
        ))}
      </section>

      <p className="text-xs text-slate-400">{t("charity.notice")}</p>
    </main>
  );
}
