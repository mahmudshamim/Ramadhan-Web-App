"use client";

import { useEffect, useState } from "react";
import { useLang } from "../../lib/i18n";

export default function TasbihPage() {
    const { t, lang } = useLang();
    const [count, setCount] = useState(0);
    const [target, setTarget] = useState(33);

    useEffect(() => {
        const savedCount = localStorage.getItem("tasbih_count");
        if (savedCount) setCount(parseInt(savedCount, 10));
    }, []);

    const increment = () => {
        const newCount = count + 1;
        setCount(newCount);
        localStorage.setItem("tasbih_count", newCount.toString());

        // Haptic feedback
        if (navigator.vibrate) {
            if (newCount % 33 === 0) {
                navigator.vibrate([100, 50, 100]); // Distinct vibration for 33, 66, 99...
            } else {
                navigator.vibrate(20); // Short vibration for regular count
            }
        }
    };

    const decrement = () => {
        if (count > 0) {
            const newCount = count - 1;
            setCount(newCount);
            localStorage.setItem("tasbih_count", newCount.toString());
            if (navigator.vibrate) navigator.vibrate(20);
        }
    };

    const reset = () => {
        if (confirm(lang === 'bn' ? 'আপনি কি গণনা রিসেট করতে চান?' : 'Are you sure you want to reset?')) {
            setCount(0);
            localStorage.setItem("tasbih_count", "0");
            if (navigator.vibrate) navigator.vibrate(50);
        }
    };

    return (
        <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-8 px-6 py-12">
            <header className="text-center">
                <h1 className="font-display text-4xl font-bold text-white mb-2">
                    {lang === 'bn' ? 'তাসবিহ' : 'Tasbih'}
                </h1>
                <p className="text-slate-400">
                    {lang === 'bn' ? 'ডিজিটাল কাউন্টার' : 'Digital Counter'}
                </p>
            </header>

            {/* Main Counter Display */}
            <div
                className="relative flex h-80 w-80 flex-col items-center justify-center rounded-full border-8 border-emerald-500/20 bg-gradient-to-br from-emerald-900/50 to-slate-900/50 shadow-[0_0_50px_rgba(16,185,129,0.1)] backdrop-blur-sm cursor-pointer active:scale-95 transition-transform select-none"
                onClick={increment}
            >
                <div className="absolute inset-0 rounded-full border border-white/5 bg-[url('/patterns/noise.png')] opacity-20"></div>

                <span className="text-8xl font-bold text-white tabular-nums tracking-tighter drop-shadow-2xl">
                    {count}
                </span>
                <span className="mt-2 text-sm font-medium text-emerald-400/60 uppercase tracking-widest">
                    {lang === 'bn' ? 'গণনা' : 'Count'}
                </span>

                {/* Circular Progress (Visual only for now) */}
                <svg className="absolute inset-0 h-full w-full -rotate-90 p-2" viewBox="0 0 100 100">
                    <circle
                        cx="50"
                        cy="50"
                        r="46"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="0.5"
                        className="text-white/10"
                    />
                    <circle
                        cx="50"
                        cy="50"
                        r="46"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeDasharray={289}
                        strokeDashoffset={289 - (289 * (count % 33)) / 33}
                        className="text-emerald-500 transition-all duration-300"
                        strokeLinecap="round"
                    />
                </svg>
            </div>

            {/* Controls */}
            <div className="flex w-full items-center justify-center gap-6">
                <button
                    onClick={reset}
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-red-400 transition-colors hover:bg-red-500/20 active:scale-95"
                    title="Reset"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                </button>

                <button
                    onClick={decrement}
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-white/5 text-slate-400 transition-colors hover:bg-white/10 active:scale-95"
                    title="Decrease"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                    </svg>
                </button>
            </div>

            <div className="text-center text-sm text-slate-500">
                <p>{lang === 'bn' ? 'স্ক্রিনে ট্যাপ করে গণনা করুন' : 'Tap the circle to count'}</p>
            </div>
        </main>
    );
}
