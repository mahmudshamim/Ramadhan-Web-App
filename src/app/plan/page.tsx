"use client";

import { useEffect, useState } from "react";
import { loadJSON, saveJSON } from "../../lib/storage";
import { useLang } from "../../lib/i18n";

const PLAN_KEY = "rramadhan_plan_v1";

type PlanData = {
  quranTarget: string;
  sleepPattern: string;
  energyLevel: string;
  focusArea: string;
  planText: string;
};

export default function PlanPage() {
  const { t } = useLang();
  const [form, setForm] = useState<Omit<PlanData, "planText">>({
    quranTarget: "plan.target.juz1",
    sleepPattern: "plan.sleep.taraweeh",
    energyLevel: "plan.energy.medium",
    focusArea: "plan.focus.quran"
  });
  const [plan, setPlan] = useState<string>("");

  useEffect(() => {
    const saved = loadJSON<PlanData>(PLAN_KEY);
    if (saved) {
      setForm({
        quranTarget: saved.quranTarget,
        sleepPattern: saved.sleepPattern,
        energyLevel: saved.energyLevel,
        focusArea: saved.focusArea
      });
      setPlan(saved.planText);
    }
  }, []);

  const labelFor = (value: string) => (value.startsWith("plan.") ? t(value) : value);

  const generatePlan = () => {
    const planText = t("plan.template")
      .replace("{quran}", labelFor(form.quranTarget))
      .replace("{focus}", labelFor(form.focusArea))
      .replace("{energy}", labelFor(form.energyLevel))
      .replace("{sleep}", labelFor(form.sleepPattern))
      .trim();

    const payload: PlanData = { ...form, planText };
    setPlan(planText);
    saveJSON(PLAN_KEY, payload);
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-8 px-6 py-16">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-3xl">{t("plan.title")}</h1>
        <p className="text-slate-300">{t("plan.subtitle")}</p>
      </header>

      <section className="grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm text-slate-300">
          {t("plan.quranTarget")}
          <select
            value={form.quranTarget}
            onChange={(e) => setForm({ ...form, quranTarget: e.target.value })}
            className="rounded-xl border border-white/10 bg-brand-night px-4 py-3 text-slate-200"
          >
            <option value="plan.target.juz1">{t("plan.target.juz1")}</option>
            <option value="plan.target.juzHalf">{t("plan.target.juzHalf")}</option>
            <option value="plan.target.surah3">{t("plan.target.surah3")}</option>
          </select>
        </label>
        <label className="flex flex-col gap-2 text-sm text-slate-300">
          {t("plan.energy")}
          <select
            value={form.energyLevel}
            onChange={(e) => setForm({ ...form, energyLevel: e.target.value })}
            className="rounded-xl border border-white/10 bg-brand-night px-4 py-3 text-slate-200"
          >
            <option value="plan.energy.high">{t("plan.energy.high")}</option>
            <option value="plan.energy.medium">{t("plan.energy.medium")}</option>
            <option value="plan.energy.low">{t("plan.energy.low")}</option>
          </select>
        </label>
        <label className="flex flex-col gap-2 text-sm text-slate-300">
          {t("plan.sleep")}
          <select
            value={form.sleepPattern}
            onChange={(e) => setForm({ ...form, sleepPattern: e.target.value })}
            className="rounded-xl border border-white/10 bg-brand-night px-4 py-3 text-slate-200"
          >
            <option value="plan.sleep.taraweeh">{t("plan.sleep.taraweeh")}</option>
            <option value="plan.sleep.split">{t("plan.sleep.split")}</option>
            <option value="plan.sleep.early">{t("plan.sleep.early")}</option>
          </select>
        </label>
        <label className="flex flex-col gap-2 text-sm text-slate-300">
          {t("plan.focus")}
          <select
            value={form.focusArea}
            onChange={(e) => setForm({ ...form, focusArea: e.target.value })}
            className="rounded-xl border border-white/10 bg-brand-night px-4 py-3 text-slate-200"
          >
            <option value="plan.focus.quran">{t("plan.focus.quran")}</option>
            <option value="plan.focus.charity">{t("plan.focus.charity")}</option>
            <option value="plan.focus.family">{t("plan.focus.family")}</option>
          </select>
        </label>
      </section>

      <button
        onClick={generatePlan}
        className="w-fit rounded-full border border-brand-teal/50 bg-brand-teal/10 px-6 py-3 text-xs uppercase tracking-[0.2em] text-brand-teal"
      >
        {t("plan.generate")}
      </button>

      {plan ? (
        <section className="whitespace-pre-line rounded-3xl border border-white/10 bg-white/5 p-6 text-slate-200">
          {plan}
        </section>
      ) : null}
    </main>
  );
}
