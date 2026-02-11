"use client";

import { useEffect, useState } from "react";
import { useLang } from "../../lib/i18n";

type NameOfAllah = {
    id: number;
    arabic: string;
    transliteration: string;
    en_meaning: string;
    bn_meaning: string;
};

export default function NamesPage() {
    const { t, lang } = useLang();
    const [names, setNames] = useState<NameOfAllah[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetch("/data/names.json")
            .then((res) => res.json())
            .then((data) => {
                setNames(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Failed to load names", err);
                setLoading(false);
            });
    }, []);

    const filteredNames = names.filter((name) =>
        name.transliteration.toLowerCase().includes(search.toLowerCase()) ||
        name.en_meaning.toLowerCase().includes(search.toLowerCase()) ||
        name.bn_meaning.includes(search)
    );

    return (
        <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 py-12">
            <header className="flex flex-col gap-4 text-center md:text-left md:flex-row md:items-end md:justify-between">
                <div>
                    <h1 className="font-display text-4xl font-bold text-white mb-2">
                        {lang === 'bn' ? 'আসমাউল হুসনা' : 'Asma Ul Husna'}
                    </h1>
                    <p className="text-slate-400 max-w-xl">
                        {lang === 'bn'
                            ? 'আল্লাহর ৯৯টি গুণবাচক নাম ও অর্থ।'
                            : 'The 99 Beautiful Names of Allah and their meanings.'}
                    </p>
                </div>

                <div className="w-full md:w-auto">
                    <input
                        type="text"
                        placeholder={lang === 'bn' ? 'অনুসন্ধান...' : 'Search names...'}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-slate-200 placeholder-slate-500 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 md:w-64"
                    />
                </div>
            </header>

            {loading ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-32 animate-pulse rounded-2xl bg-white/5"></div>
                    ))}
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredNames.map((name) => (
                        <div
                            key={name.id}
                            className="group relative flex flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 text-center transition-all hover:border-emerald-500/30 hover:bg-white/10 hover:shadow-xl hover:shadow-emerald-500/5"
                        >
                            <div className="absolute right-3 top-3 text-xs font-bold text-slate-600 group-hover:text-emerald-500/50">
                                #{name.id}
                            </div>

                            <h3 className="font-amiri text-3xl text-white mb-1 group-hover:scale-110 transition-transform duration-300">
                                {name.arabic}
                            </h3>

                            <div className="flex flex-col gap-0.5">
                                <p className="font-medium text-emerald-400">
                                    {name.transliteration}
                                </p>
                                <p className="text-sm text-slate-400">
                                    {lang === 'bn' ? name.bn_meaning : name.en_meaning}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && filteredNames.length === 0 && (
                <div className="mt-12 text-center text-slate-500">
                    <p>{lang === 'bn' ? 'কোনো নাম পাওয়া যায়নি।' : 'No names found matching your search.'}</p>
                </div>
            )}
        </main>
    );
}
