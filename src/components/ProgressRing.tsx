type ProgressRingProps = {
  value: number;
  max: number;
  label: string;
};

export default function ProgressRing({ value, max, label }: ProgressRingProps) {
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(1, Math.max(0, value / max));
  const dash = circumference * (1 - progress);

  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg backdrop-blur">
      <svg width="120" height="120" viewBox="0 0 120 120" className="text-brand-teal">
        <circle
          cx="60"
          cy="60"
          r={radius}
          stroke="currentColor"
          strokeWidth="10"
          className="opacity-20"
          fill="none"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          stroke="currentColor"
          strokeWidth="10"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={dash}
          strokeLinecap="round"
          transform="rotate(-90 60 60)"
        />
        <text
          x="60"
          y="65"
          textAnchor="middle"
          className="fill-brand-light font-display text-xl"
        >
          {Math.round(progress * 100)}%
        </text>
      </svg>
      <p className="text-sm text-slate-200">{label}</p>
    </div>
  );
}
