"use client";

import { useEffect, useState } from "react";
import { CITY_OPTIONS } from "../../lib/cities";
import { AppSettings, defaultSettings, loadSettings, saveSettings } from "../../lib/settings";
import { useLang } from "../../lib/i18n";

export default function SettingsPage() {
  const { lang, setLang, t } = useLang();
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [statusKey, setStatusKey] = useState<string>("");
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  const update = (patch: Partial<AppSettings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    setDirty(true);
  };

  const updateJamaat = (prayer: "fajr" | "dhuhr" | "asr" | "maghrib" | "isha", value: string) => {
    const next = {
      ...settings,
      jamaatTimes: {
        ...(settings.jamaatTimes ?? {}),
        [prayer]: value
      }
    };
    setSettings(next);
    setDirty(true);
  };

  const handleSave = () => {
    saveSettings(settings);
    setDirty(false);
    setStatusKey("settings.status.saved");
  };

  const handleGPS = () => {
    if (!navigator.geolocation) {
      setStatusKey("settings.status.notSupported");
      return;
    }
    setStatusKey("settings.status.detecting");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        update({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          useGPS: true
        });
        setStatusKey("settings.status.saved");
      },
      () => {
        setStatusKey("settings.status.denied");
      }
    );
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-6 py-16">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-3xl">{t("settings.title")}</h1>
        <p className="text-slate-300">{t("settings.subtitle")}</p>
      </header>

      <section className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">{t("settings.useGps")}</p>
            <p className="text-sm text-slate-400">{t("settings.gpsHint")}</p>
          </div>
          <button
            type="button"
            onClick={() => update({ useGPS: !settings.useGPS })}
            className={`relative inline-flex h-7 w-14 items-center rounded-full border px-1 transition ${
              settings.useGPS
                ? "border-brand-gold/60 bg-brand-gold/20"
                : "border-white/10 bg-brand-deep/70"
            }`}
            aria-pressed={settings.useGPS}
            aria-label="Toggle GPS usage"
          >
            <span
              className={`h-5 w-5 rounded-full transition ${
                settings.useGPS ? "translate-x-7 bg-brand-sand" : "translate-x-0 bg-slate-400"
              }`}
            />
          </button>
        </div>

        <button
          onClick={handleGPS}
          className="w-fit rounded-full border border-brand-teal/50 bg-brand-teal/10 px-5 py-2 text-xs uppercase tracking-[0.2em] text-brand-teal"
        >
          {t("settings.detect")}
        </button>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-slate-300">{t("settings.manualCity")}</label>
          <select
            value={settings.city ?? ""}
            onChange={(e) => {
              const city = CITY_OPTIONS.find((item) => item.name === e.target.value);
              update({
                city: city?.name,
                lat: city?.lat,
                lon: city?.lon,
                useGPS: false
              });
            }}
            className="rounded-xl border border-white/10 bg-brand-night px-4 py-3 text-slate-200"
          >
            <option value="">{lang === "bn" ? "শহর নির্বাচন করুন" : "Select city"}</option>
            {CITY_OPTIONS.map((city) => (
              <option key={city.name} value={city.name}>
                {city.name}, {city.country}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 md:grid-cols-3">
        <div className="flex flex-col gap-2">
          <label className="text-sm text-slate-300">{t("settings.mazhab")}</label>
          <select
            value={settings.school}
            onChange={(e) => update({ school: Number(e.target.value) as 0 | 1 })}
            className="rounded-xl border border-white/10 bg-brand-night px-4 py-3 text-slate-200"
          >
            <option value={0}>{lang === "bn" ? "শাফই" : "Shafi’i"}</option>
            <option value={1}>{lang === "bn" ? "হানাফি" : "Hanafi"}</option>
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm text-slate-300">{t("settings.reminderOffset")}</label>
          <input
            type="number"
            min={5}
            max={60}
            value={settings.reminderOffsetMin}
            onChange={(e) => update({ reminderOffsetMin: Number(e.target.value) })}
            className="rounded-xl border border-white/10 bg-brand-night px-4 py-3 text-slate-200"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm text-slate-300">{t("settings.imsakOffset")}</label>
          <input
            type="number"
            min={0}
            max={60}
            value={settings.imsakOffsetMin}
            onChange={(e) => update({ imsakOffsetMin: Number(e.target.value) })}
            className="rounded-xl border border-white/10 bg-brand-night px-4 py-3 text-slate-200"
          />
        </div>
      </section>

      <section className="grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="text-sm text-slate-300">{t("settings.language")}</label>
          <select
            value={lang}
            onChange={(e) => {
              setLang(e.target.value as "en" | "bn");
              setDirty(true);
            }}
            className="rounded-xl border border-white/10 bg-brand-night px-4 py-3 text-slate-200"
          >
            <option value="en">English</option>
            <option value="bn">বাংলা</option>
          </select>
        </div>
        <div className="text-sm text-slate-400">
          {lang === "bn"
            ? "ভাষা পরিবর্তন করলে সব কনটেন্ট বাংলায় দেখা যাবে।"
            : "Switch language to view all content in Bangla or English."}
        </div>
      </section>

      <section className="grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="text-sm text-slate-300">{t("settings.ramadanYear")}</label>
          <input
            type="number"
            value={settings.ramadanYear ?? new Date().getFullYear()}
            onChange={(e) => update({ ramadanYear: Number(e.target.value) })}
            className="rounded-xl border border-white/10 bg-brand-night px-4 py-3 text-slate-200"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm text-slate-300">{t("settings.ramadanMonth")}</label>
          <input
            type="number"
            min={1}
            max={12}
            value={settings.ramadanMonth ?? new Date().getMonth() + 1}
            onChange={(e) => update({ ramadanMonth: Number(e.target.value) })}
            className="rounded-xl border border-white/10 bg-brand-night px-4 py-3 text-slate-200"
          />
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h2 className="mb-4 text-sm uppercase tracking-[0.2em] text-brand-sand">
          {lang === "bn" ? "জামাত সময় (ঐচ্ছিক)" : "Jamaat Times (Optional)"}
        </h2>
        <div className="grid gap-4 md:grid-cols-5">
          {([
            ["fajr", lang === "bn" ? "ফজর" : "Fajr"],
            ["dhuhr", lang === "bn" ? "যুহর" : "Dhuhr"],
            ["asr", lang === "bn" ? "আসর" : "Asr"],
            ["maghrib", lang === "bn" ? "মাগরিব" : "Maghrib"],
            ["isha", lang === "bn" ? "ইশা" : "Isha"]
          ] as const).map(([key, label]) => (
            <label key={key} className="flex flex-col gap-2 text-sm text-slate-300">
              {label}
              <input
                type="time"
                value={settings.jamaatTimes?.[key] ?? ""}
                onChange={(e) => updateJamaat(key, e.target.value)}
                className="rounded-xl border border-white/10 bg-brand-night px-3 py-2 text-slate-200"
              />
            </label>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          className="btn-gold rounded-full px-6 py-2 text-xs uppercase tracking-[0.2em] disabled:opacity-40"
          disabled={!dirty}
        >
          {lang === "bn" ? "সেটিংস সেভ করুন" : "Save Settings"}
        </button>
        {dirty ? (
          <span className="text-xs uppercase tracking-[0.2em] text-brand-sand">
            {lang === "bn" ? "আনসেভড পরিবর্তন আছে" : "Unsaved changes"}
          </span>
        ) : null}
      </div>

      {statusKey ? <p className="text-sm text-brand-gold">{t(statusKey)}</p> : null}
    </main>
  );
}
