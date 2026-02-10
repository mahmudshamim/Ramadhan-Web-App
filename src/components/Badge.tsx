import { useLang } from "../lib/i18n";

type BadgeProps = {
  title: string;
  subtitle?: string;
};

export default function Badge({ title, subtitle }: BadgeProps) {
  const { t } = useLang();
  return (
    <div className="flex h-full flex-col justify-center gap-1 rounded-2xl border border-brand-gold/20 bg-gradient-to-br from-brand-deep to-brand-emerald p-4 shadow-lg">
      <p className="text-xs uppercase tracking-[0.25em] text-brand-sand">{t("home.badgeMain")}</p>
      <p className="font-display text-lg text-brand-light">{title}</p>
      {subtitle ? <p className="text-sm text-slate-200">{subtitle}</p> : null}
    </div>
  );
}
