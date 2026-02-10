"use client";

import { useMemo, useState } from "react";
import { useLang } from "../../lib/i18n";

export default function ZakatPage() {
  const { t } = useLang();
  const [values, setValues] = useState({
    cash: 0,
    gold: 0,
    silver: 0,
    savings: 0,
    debt: 0
  });

  const total = useMemo(() => {
    const gross = values.cash + values.gold + values.silver + values.savings;
    const net = Math.max(0, gross - values.debt);
    const zakat = net * 0.025;
    return { gross, net, zakat };
  }, [values]);

  const handleChange = (field: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [field]: Number(e.target.value) || 0 });
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-8 px-6 py-16">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-3xl">{t("zakat.title")}</h1>
        <p className="text-slate-300">{t("zakat.subtitle")}</p>
      </header>

      <section className="grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 md:grid-cols-2">
        {([
          ["cash", t("zakat.cash")],
          ["gold", t("zakat.gold")],
          ["silver", t("zakat.silver")],
          ["savings", t("zakat.savings")],
          ["debt", t("zakat.debt")]
        ] as const).map(([field, label]) => (
          <label key={field} className="flex flex-col gap-2 text-sm text-slate-300">
            {label}
            <input
              type="number"
              min={0}
              value={values[field]}
              onChange={handleChange(field)}
              className="rounded-xl border border-white/10 bg-brand-night px-4 py-3 text-slate-200"
            />
          </label>
        ))}
      </section>

      <section className="grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 md:grid-cols-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{t("zakat.total")}</p>
          <p className="mt-2 text-2xl text-slate-100">{total.gross.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{t("zakat.net")}</p>
          <p className="mt-2 text-2xl text-slate-100">{total.net.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{t("zakat.due")}</p>
          <p className="mt-2 text-2xl text-brand-gold">{total.zakat.toFixed(2)}</p>
        </div>
      </section>

      <p className="text-sm text-slate-400">{t("zakat.notice")}</p>
    </main>
  );
}
