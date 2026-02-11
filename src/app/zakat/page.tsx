"use client";

import { useMemo, useState } from "react";
import { useLang } from "../../lib/i18n";
import { FiDollarSign, FiBriefcase, FiCreditCard, FiActivity, FiInfo } from "react-icons/fi";

const GOLD_PRICE_PER_GRAM_BDT = 11000; // Approx default
const SILVER_PRICE_PER_GRAM_BDT = 140; // Approx default
const NISAB_GOLD_GRAMS = 87.48;
const NISAB_SILVER_GRAMS = 612.36;

export default function ZakatPage() {
  const { t, lang } = useLang();

  // State for all assets and liabilities
  const [assets, setAssets] = useState({
    goldGrams: 0,
    silverGrams: 0,
    cashInHand: 0,
    cashInBank: 0,
    shares: 0,
    merchandise: 0,
    otherSavings: 0,
    moneyOwedToYou: 0,
  });

  const [liabilities, setLiabilities] = useState({
    debts: 0,
    expenses: 0,
  });

  const [prices, setPrices] = useState({
    gold: GOLD_PRICE_PER_GRAM_BDT,
    silver: SILVER_PRICE_PER_GRAM_BDT,
  });

  const [activeTab, setActiveTab] = useState<"assets" | "liabilities" | "settings">("assets");

  // Calculations
  const calculations = useMemo(() => {
    // 1. Calculate Wealth
    const goldValue = assets.goldGrams * prices.gold;
    const silverValue = assets.silverGrams * prices.silver;
    const cashValue = assets.cashInHand + assets.cashInBank + assets.otherSavings + assets.moneyOwedToYou;
    const businessValue = assets.shares + assets.merchandise;

    const totalGross = goldValue + silverValue + cashValue + businessValue;
    const totalLiabilities = liabilities.debts + liabilities.expenses;
    const netAssets = Math.max(0, totalGross - totalLiabilities);

    // 2. Check Nisab (Standard is Silver Nisab for caution, but often Gold is used for Gold-only wealth)
    // Using Silver Nisab is safer for the poor (lower threshold)
    const nisabThreshold = NISAB_SILVER_GRAMS * prices.silver;
    const isEligible = netAssets >= nisabThreshold;

    const zakatDue = isEligible ? netAssets * 0.025 : 0;

    return {
      goldValue,
      silverValue,
      cashValue,
      businessValue,
      totalGross,
      totalLiabilities,
      netAssets,
      nisabThreshold,
      isEligible,
      zakatDue
    };
  }, [assets, liabilities, prices]);

  const handleAssetChange = (field: keyof typeof assets) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setAssets({ ...assets, [field]: Number(e.target.value) || 0 });
  };

  const handleLiabilityChange = (field: keyof typeof liabilities) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setLiabilities({ ...liabilities, [field]: Number(e.target.value) || 0 });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(lang === 'bn' ? 'bn-BD' : 'en-US', {
      style: 'currency',
      currency: 'BDT',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-8 px-6 py-12 pb-32">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-4xl font-bold text-white">
          {lang === 'bn' ? 'যাকাত ক্যালকুলেটর' : 'Zakat Calculator'}
        </h1>
        <p className="text-slate-400 max-w-2xl">
          {lang === 'bn'
            ? 'আপনার মোট সম্পদ এবং দায়ের হিসাব করে সঠিক যাকাতের পরিমাণ নির্ণয় করুন।'
            : 'Calculate your exact Zakat liability based on your assets and deductible liabilities.'}
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column: Input Forms */}
        <div className="lg:col-span-2 space-y-6">

          {/* Tabs */}
          <div className="flex gap-2 p-1 bg-white/5 rounded-xl backdrop-blur-sm">
            <button
              onClick={() => setActiveTab("assets")}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all ${activeTab === "assets" ? "bg-brand-gold text-brand-deep shadow-lg" : "text-slate-400 hover:text-white"
                }`}
            >
              {lang === 'bn' ? 'সম্পদ (Assets)' : 'Assets'}
            </button>
            <button
              onClick={() => setActiveTab("liabilities")}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all ${activeTab === "liabilities" ? "bg-brand-gold text-brand-deep shadow-lg" : "text-slate-400 hover:text-white"
                }`}
            >
              {lang === 'bn' ? 'দায় (Liabilities)' : 'Liabilities'}
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all ${activeTab === "settings" ? "bg-brand-gold text-brand-deep shadow-lg" : "text-slate-400 hover:text-white"
                }`}
            >
              {lang === 'bn' ? 'মূল্য (Rates)' : 'Rates'}
            </button>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
            {activeTab === "assets" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                <h3 className="text-xl font-semibold text-emerald-400 flex items-center gap-2">
                  <FiBriefcase />
                  {lang === 'bn' ? 'স্বর্ণ ও রৌপ্য' : 'Gold & Silver'}
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm text-slate-300">{lang === 'bn' ? 'স্বর্ণ (গ্রাম)' : 'Gold (grams)'}</span>
                    <input type="number" min="0" value={assets.goldGrams || ''} onChange={handleAssetChange('goldGrams')}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-gold focus:outline-none"
                      placeholder="0" />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm text-slate-300">{lang === 'bn' ? 'রৌপ্য (গ্রাম)' : 'Silver (grams)'}</span>
                    <input type="number" min="0" value={assets.silverGrams || ''} onChange={handleAssetChange('silverGrams')}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-gold focus:outline-none"
                      placeholder="0" />
                  </label>
                </div>

                <hr className="border-white/5 my-6" />

                <h3 className="text-xl font-semibold text-emerald-400 flex items-center gap-2">
                  <FiDollarSign />
                  {lang === 'bn' ? 'নগদ অর্থ' : 'Cash & Savings'}
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm text-slate-300">{lang === 'bn' ? 'নগদ টাকা' : 'Cash in Hand'}</span>
                    <input type="number" min="0" value={assets.cashInHand || ''} onChange={handleAssetChange('cashInHand')}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-gold focus:outline-none"
                      placeholder="0" />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm text-slate-300">{lang === 'bn' ? 'ব্যাংক ব্যালেন্স' : 'Cash in Bank'}</span>
                    <input type="number" min="0" value={assets.cashInBank || ''} onChange={handleAssetChange('cashInBank')}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-gold focus:outline-none"
                      placeholder="0" />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm text-slate-300">{lang === 'bn' ? 'অন্যান্য সঞ্চয়' : 'Other Savings'}</span>
                    <input type="number" min="0" value={assets.otherSavings || ''} onChange={handleAssetChange('otherSavings')}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-gold focus:outline-none"
                      placeholder="0" />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm text-slate-300">{lang === 'bn' ? 'পাওনা টাকা' : 'Money Owed to You'}</span>
                    <input type="number" min="0" value={assets.moneyOwedToYou || ''} onChange={handleAssetChange('moneyOwedToYou')}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-gold focus:outline-none"
                      placeholder="0" />
                  </label>
                </div>

                <hr className="border-white/5 my-6" />

                <h3 className="text-xl font-semibold text-emerald-400 flex items-center gap-2">
                  <FiActivity />
                  {lang === 'bn' ? 'ব্যবসায়িক সম্পদ' : 'Investments'}
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm text-slate-300">{lang === 'bn' ? 'শেয়ার / স্টক' : 'Shares / Stocks'}</span>
                    <input type="number" min="0" value={assets.shares || ''} onChange={handleAssetChange('shares')}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-gold focus:outline-none"
                      placeholder="0" />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm text-slate-300">{lang === 'bn' ? 'ব্যবসায়িক পণ্য' : 'Business Merchandise'}</span>
                    <input type="number" min="0" value={assets.merchandise || ''} onChange={handleAssetChange('merchandise')}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-gold focus:outline-none"
                      placeholder="0" />
                  </label>
                </div>
              </div>
            )}

            {activeTab === "liabilities" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-xl font-semibold text-red-400 flex items-center gap-2">
                  <FiCreditCard />
                  {lang === 'bn' ? 'ঋণ ও খরচ' : 'Debts & Liabilities'}
                </h3>
                <p className="text-sm text-slate-400 mb-4">
                  {lang === 'bn'
                    ? 'শুধুমাত্র সেই ঋণগুলো অন্তর্ভুক্ত করুন যা আপনাকে অবিলম্বে পরিশোধ করতে হবে।'
                    : 'Include only debts that are due immediately or short-term liabilities.'}
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm text-slate-300">{lang === 'bn' ? 'ঋণ' : 'Debts'}</span>
                    <input type="number" min="0" value={liabilities.debts || ''} onChange={handleLiabilityChange('debts')}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-400 focus:outline-none"
                      placeholder="0" />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm text-slate-300">{lang === 'bn' ? 'তাৎক্ষণিক খরচ' : 'Immediate Expenses'}</span>
                    <input type="number" min="0" value={liabilities.expenses || ''} onChange={handleLiabilityChange('expenses')}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-400 focus:outline-none"
                      placeholder="0" />
                  </label>
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <h3 className="text-xl font-semibold text-brand-gold flex items-center gap-2">
                  <FiActivity />
                  {lang === 'bn' ? 'বাজার দর (প্রতি গ্রাম)' : 'Market Rates (per gram)'}
                </h3>
                <p className="text-sm text-slate-400 mb-4">
                  {lang === 'bn'
                    ? 'সঠিক যাকাত হিসাবের জন্য বর্তমান বাজার দর আপডেট করুন।'
                    : 'Update these rates to match current market prices for accuracy.'}
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm text-slate-300">{lang === 'bn' ? 'স্বর্ণের দাম (BDT)' : 'Gold Price (BDT)'}</span>
                    <input type="number" min="0" value={prices.gold}
                      onChange={(e) => setPrices({ ...prices, gold: Number(e.target.value) })}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-gold focus:outline-none"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm text-slate-300">{lang === 'bn' ? 'রৌপ্যর দাম (BDT)' : 'Silver Price (BDT)'}</span>
                    <input type="number" min="0" value={prices.silver}
                      onChange={(e) => setPrices({ ...prices, silver: Number(e.target.value) })}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-gold focus:outline-none"
                    />
                  </label>
                </div>
                <div className="mt-4 p-4 rounded-xl bg-brand-gold/10 border border-brand-gold/20 flex gap-3 text-sm text-brand-sand">
                  <FiInfo className="mt-0.5 text-lg shrink-0" />
                  <p>
                    {lang === 'bn'
                      ? `নিসাব থ্রেশহোল্ড: ${NISAB_SILVER_GRAMS} গ্রাম রৌপ্য (নিরাপদ সতর্কতা)।`
                      : `Nisab Threshold: ${NISAB_SILVER_GRAMS} grams of Silver (Safest approach).`}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Summary */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-brand-deep to-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl sticky top-24">
            <h3 className="text-lg font-medium text-white mb-6 border-b border-white/10 pb-4">
              {lang === 'bn' ? 'হিসাবের সারাংশ' : 'Calculation Summary'}
            </h3>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">{lang === 'bn' ? 'মোট সম্পদ' : 'Total Assets'}</span>
                <span className="text-white font-medium">{formatCurrency(calculations.totalGross)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">{lang === 'bn' ? 'মোট দায়' : 'Total Liabilities'}</span>
                <span className="text-red-400 font-medium">-{formatCurrency(calculations.totalLiabilities)}</span>
              </div>
              <div className="border-t border-white/10 pt-3 flex justify-between text-base font-semibold">
                <span className="text-teal-400">{lang === 'bn' ? 'নিট সম্পদ' : 'Net Assets'}</span>
                <span className="text-teal-400">{formatCurrency(calculations.netAssets)}</span>
              </div>
            </div>

            <div className="bg-black/30 rounded-xl p-4 mb-6">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>{lang === 'bn' ? 'নিসাব পরিমাণ' : 'Nisab Threshold'}</span>
                <span>{formatCurrency(calculations.nisabThreshold)}</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${calculations.isEligible ? 'bg-emerald-500' : 'bg-red-500'}`}
                  style={{ width: `${Math.min(100, (calculations.netAssets / calculations.nisabThreshold) * 100)}%` }}
                />
              </div>
              <p className={`text-xs text-center ${calculations.isEligible ? 'text-emerald-400' : 'text-red-400'}`}>
                {calculations.isEligible
                  ? (lang === 'bn' ? 'আপনার উপর যাকাত ফরজ হয়েছে' : 'You represent eligible wealth')
                  : (lang === 'bn' ? 'আপনার উপর যাকাত ফরজ নয়' : 'You are below the Nisab threshold')}
              </p>
            </div>

            <div className="text-center space-y-2">
              <p className="text-sm uppercase tracking-widest text-brand-gold/70">
                {lang === 'bn' ? 'প্রদেয় যাকাত' : 'Total Zakat Payable'}
              </p>
              <div className="text-4xl font-bold text-white font-display">
                {formatCurrency(calculations.zakatDue)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
