"use client";

import { useEffect, useMemo, useState } from "react";

type CountdownTimerProps = {
  target: string;
  label?: string;
};

function formatDuration(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return {
    hours: hours.toString().padStart(2, "0"),
    minutes: minutes.toString().padStart(2, "0"),
    seconds: seconds.toString().padStart(2, "0")
  };
}

export default function CountdownTimer({ target, label }: CountdownTimerProps) {
  const targetDate = useMemo(() => new Date(target), [target]);
  const [now, setNow] = useState(() => new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const { hours, minutes, seconds } = formatDuration(targetDate.getTime() - now.getTime());
  const display = mounted ? { hours, minutes, seconds } : { hours: "--", minutes: "--", seconds: "--" };

  return (
    <div className="flex h-full flex-col justify-center rounded-2xl border border-brand-gold/20 bg-brand-deep/70 p-5 text-center shadow-lg backdrop-blur">
      <p className="text-xs uppercase tracking-[0.3em] text-brand-sand">
        {label ?? "Countdown"}
      </p>
      <div className="mt-3 flex items-center justify-center gap-3 font-display text-4xl">
        <span>{display.hours}</span>
        <span className="text-brand-teal">:</span>
        <span>{display.minutes}</span>
        <span className="text-brand-teal">:</span>
        <span>{display.seconds}</span>
      </div>
    </div>
  );
}
