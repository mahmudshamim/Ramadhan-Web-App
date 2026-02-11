"use client";

import { useEffect, useState } from "react";
import { loadWater, updateToday } from "../../lib/water";
import { useLang } from "../../lib/i18n";
import { FiDroplet, FiActivity, FiSun, FiMoon } from "react-icons/fi";

export default function HealthPage() {
  const { t, lang } = useLang();
  const [glasses, setGlasses] = useState(0);
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [bmi, setBmi] = useState<number | null>(null);
  const [energyLevel, setEnergyLevel] = useState<"low" | "medium" | "high" | null>(null);

  const waterGoal = 10; // glasses

  useEffect(() => {
    const entry = loadWater().find((item) => item.date === new Date().toISOString().slice(0, 10));
    if (entry) setGlasses(entry.glasses);
  }, []);

  const adjust = (delta: number) => {
    const next = Math.max(0, Math.min(waterGoal + 5, glasses + delta));
    setGlasses(next);
    updateToday(next);
  };

  const calculateBMI = () => {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    if (h > 0 && w > 0) {
      const heightInMeters = h / 100;
      const calculatedBMI = w / (heightInMeters * heightInMeters);
      setBmi(parseFloat(calculatedBMI.toFixed(1)));
    }
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return lang === "bn" ? "কম ওজন" : "Underweight";
    if (bmi < 25) return lang === "bn" ? "স্বাভাবিক" : "Normal";
    if (bmi < 30) return lang === "bn" ? "অতিরিক্ত ওজন" : "Overweight";
    return lang === "bn" ? "স্থূলতা" : "Obese";
  };

  const getBMIColor = (bmi: number) => {
    if (bmi < 18.5) return "text-yellow-400";
    if (bmi < 25) return "text-green-400";
    if (bmi < 30) return "text-orange-400";
    return "text-red-400";
  };

  const healthTips = {
    hydration: lang === "bn"
      ? [
        "ইফতার থেকে সেহরি পর্যন্ত ৮-১০ গ্লাস পানি পান করুন",
        "ক্যাফেইন এড়িয়ে চলুন, এটি পানিশূন্যতা বাড়ায়",
        "তরমুজ, শসা জাতীয় পানিযুক্ত ফল খান"
      ]
      : [
        "Drink 8-10 glasses of water between Iftar and Sehri",
        "Avoid caffeine as it increases dehydration",
        "Eat water-rich fruits like watermelon and cucumber"
      ],
    energy: lang === "bn"
      ? [
        "সেহরিতে জটিল কার্বোহাইড্রেট খান (ওটস, বাদামী চাল)",
        "ইফতারে খেজুর দিয়ে শুরু করুন দ্রুত শক্তির জন্য",
        "দিনের বেলা অতিরিক্ত পরিশ্রম এড়িয়ে চলুন"
      ]
      : [
        "Eat complex carbs at Sehri (oats, brown rice)",
        "Start Iftar with dates for quick energy",
        "Avoid excessive physical exertion during the day"
      ],
    sleep: lang === "bn"
      ? [
        "রাতে ৭-৮ ঘণ্টা ঘুমের চেষ্টা করুন",
        "দুপুরে ২০-৩০ মিনিট বিশ্রাম নিন",
        "সেহরির আগে খুব ভারী খাবার এড়িয়ে চলুন"
      ]
      : [
        "Aim for 7-8 hours of sleep at night",
        "Take a 20-30 minute nap in the afternoon",
        "Avoid heavy meals right before Sehri"
      ],
    digestion: lang === "bn"
      ? [
        "ইফতারে ধীরে ধীরে খান, অতিরিক্ত খাবেন না",
        "ভাজাপোড়া কম খান",
        "ইফতারের পরে হালকা হাঁটুন"
      ]
      : [
        "Eat slowly at Iftar, don't overeat",
        "Limit fried and oily foods",
        "Take a light walk after Iftar"
      ]
  };

  const mealSuggestions = {
    sehri: lang === "bn"
      ? [
        "ওটমিল + কলা + বাদাম",
        "পরোটা + ডিম + সবজি",
        "বাদামী রুটি + পনির + দুধ",
        "খিচুড়ি + সবজি + দই"
      ]
      : [
        "Oatmeal + Banana + Nuts",
        "Paratha + Eggs + Vegetables",
        "Brown Bread + Cheese + Milk",
        "Khichuri + Vegetables + Yogurt"
      ],
    iftar: lang === "bn"
      ? [
        "খেজুর + পানি + ফল",
        "ছোলা + পেঁয়াজু + শরবত",
        "হালিম + সালাদ",
        "ফলের চাট + দই"
      ]
      : [
        "Dates + Water + Fruits",
        "Chickpeas + Pakora + Sherbet",
        "Haleem + Salad",
        "Fruit Chaat + Yogurt"
      ]
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-4 sm:px-6 py-12 sm:py-16">
      {/* Header */}
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-3xl sm:text-4xl text-white">{t("health.title")}</h1>
        <p className="text-slate-300">{t("health.subtitle")}</p>
      </header>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-3">
        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-6">
          <div className="flex items-center gap-3 mb-2">
            <FiDroplet className="text-blue-400 text-xl" />
            <p className="text-xs uppercase tracking-wider text-blue-400">
              {lang === "bn" ? "পানি পান" : "Water Intake"}
            </p>
          </div>
          <p className="text-2xl font-bold text-white">
            {glasses}/{waterGoal} {lang === "bn" ? "গ্লাস" : "glasses"}
          </p>
        </div>

        <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-6">
          <div className="flex items-center gap-3 mb-2">
            <FiActivity className="text-green-400 text-xl" />
            <p className="text-xs uppercase tracking-wider text-green-400">BMI</p>
          </div>
          <p className="text-2xl font-bold text-white">
            {bmi ? bmi : "--"}
          </p>
        </div>

        <div className="rounded-2xl border border-purple-500/20 bg-purple-500/10 p-6">
          <div className="flex items-center gap-3 mb-2">
            <FiSun className="text-purple-400 text-xl" />
            <p className="text-xs uppercase tracking-wider text-purple-400">
              {lang === "bn" ? "শক্তি লেভেল" : "Energy Level"}
            </p>
          </div>
          <p className="text-2xl font-bold text-white capitalize">
            {energyLevel ? energyLevel : "--"}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column */}
        <div className="flex flex-col gap-6">
          {/* Water Tracker */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              {lang === "bn" ? "পানি পান ট্র্যাকার" : "Water Intake Tracker"}
            </h2>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="h-4 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300"
                  style={{ width: `${Math.min((glasses / waterGoal) * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-slate-400 mt-2">
                {lang === "bn"
                  ? `লক্ষ্য: ${waterGoal} গ্লাস`
                  : `Goal: ${waterGoal} glasses`}
              </p>
            </div>

            <div className="flex items-center justify-center gap-6">
              <button
                onClick={() => adjust(-1)}
                className="rounded-full border border-white/20 bg-white/5 px-6 py-3 text-2xl text-slate-200 hover:bg-white/10 transition"
              >
                -
              </button>
              <div className="text-center">
                <p className="text-5xl font-bold text-white">{glasses}</p>
                <p className="text-sm text-slate-400 mt-1">
                  {lang === "bn" ? "গ্লাস" : "glasses"}
                </p>
              </div>
              <button
                onClick={() => adjust(1)}
                className="rounded-full border border-cyan-500/50 bg-cyan-500/10 px-6 py-3 text-2xl text-cyan-400 hover:bg-cyan-500/20 transition"
              >
                +
              </button>
            </div>
          </div>

          {/* BMI Calculator */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              {lang === "bn" ? "BMI ক্যালকুলেটর" : "BMI Calculator"}
            </h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm text-slate-400 mb-2 block">
                  {lang === "bn" ? "উচ্চতা (সেমি)" : "Height (cm)"}
                </label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="170"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 focus:border-teal-500/50 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-2 block">
                  {lang === "bn" ? "ওজন (কেজি)" : "Weight (kg)"}
                </label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="70"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 focus:border-teal-500/50 focus:outline-none"
                />
              </div>
            </div>
            <button
              onClick={calculateBMI}
              className="w-full rounded-xl bg-teal-500 px-6 py-3 font-semibold text-white hover:bg-teal-600 transition"
            >
              {lang === "bn" ? "হিসাব করুন" : "Calculate"}
            </button>
            {bmi && (
              <div className="mt-4 text-center">
                <p className="text-sm text-slate-400">
                  {lang === "bn" ? "আপনার BMI:" : "Your BMI:"}
                </p>
                <p className={`text-3xl font-bold ${getBMIColor(bmi)}`}>
                  {bmi} - {getBMICategory(bmi)}
                </p>
              </div>
            )}
          </div>

          {/* Energy Level */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              {lang === "bn" ? "শক্তি লেভেল" : "Energy Level"}
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {(["low", "medium", "high"] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setEnergyLevel(level)}
                  className={`rounded-xl border p-4 transition ${energyLevel === level
                      ? "border-purple-500 bg-purple-500/20 text-purple-300"
                      : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20"
                    }`}
                >
                  <p className="text-sm font-medium capitalize">{level}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">
          {/* Meal Suggestions */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              {lang === "bn" ? "খাবার পরামর্শ" : "Meal Suggestions"}
            </h2>

            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <FiSun className="text-orange-400" />
                <h3 className="font-semibold text-white">
                  {lang === "bn" ? "সেহরি" : "Sehri"}
                </h3>
              </div>
              <div className="grid gap-2">
                {mealSuggestions.sehri.map((meal, i) => (
                  <div key={i} className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-slate-200">
                    {meal}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <FiMoon className="text-blue-400" />
                <h3 className="font-semibold text-white">
                  {lang === "bn" ? "ইফতার" : "Iftar"}
                </h3>
              </div>
              <div className="grid gap-2">
                {mealSuggestions.iftar.map((meal, i) => (
                  <div key={i} className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-slate-200">
                    {meal}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Health Tips */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              {lang === "bn" ? "স্বাস্থ্য টিপস" : "Health Tips"}
            </h2>

            {Object.entries(healthTips).map(([category, tips]) => (
              <div key={category} className="mb-6 last:mb-0">
                <h3 className="text-sm font-semibold text-teal-400 uppercase tracking-wider mb-3">
                  {category === "hydration" && (lang === "bn" ? "হাইড্রেশন" : "Hydration")}
                  {category === "energy" && (lang === "bn" ? "শক্তি" : "Energy")}
                  {category === "sleep" && (lang === "bn" ? "ঘুম" : "Sleep")}
                  {category === "digestion" && (lang === "bn" ? "হজম" : "Digestion")}
                </h3>
                <div className="grid gap-2">
                  {tips.map((tip, i) => (
                    <div key={i} className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-slate-200">
                      • {tip}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
