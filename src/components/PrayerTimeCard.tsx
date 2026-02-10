import { formatTo12Hour } from "../lib/prayerTime";
import { Lang } from "../lib/i18n";

type PrayerTimeCardProps = {
  label: string;
  time: string;
  subtitle?: string;
  lang?: Lang;
};

export default function PrayerTimeCard({
  label,
  time,
  subtitle,
  lang = "en"
}: PrayerTimeCardProps) {
  return (
    <div className="flex h-[160px] flex-col justify-center gap-2 rounded-2xl border border-brand-gold/20 bg-brand-deep/70 p-6 shadow-lg backdrop-blur">
      <div className="text-xs uppercase tracking-[0.3em] text-brand-sand">
        {label}
      </div>
      <div className="text-3xl font-display text-brand-light">{formatTo12Hour(time, lang)}</div>
      {subtitle ? <p className="text-sm text-slate-300">{subtitle}</p> : null}
    </div>
  );
}
