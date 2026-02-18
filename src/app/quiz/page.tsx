"use client";

import { useEffect, useState } from "react";
import { useLang } from "../../lib/i18n";
import confetti from "canvas-confetti";

type Question = {
    id: number;
    question: string;
    question_bn: string;
    options: string[];
    options_bn: string[];
    correctIndex: number;
    explanation: string;
    explanation_bn: string;
};

export default function QuizPage() {
    const { t, lang } = useLang();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);

    useEffect(() => {
        fetch("/data/quiz.json")
            .then((res) => res.json())
            .then((data) => {
                // Shuffle questions for randomness
                const shuffled = data.sort(() => 0.5 - Math.random()).slice(0, 5);
                setQuestions(shuffled);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Failed to load quiz", err);
                setLoading(false);
            });
    }, []);

    const handleOptionClick = (index: number) => {
        if (isAnswered) return;

        setSelectedOption(index);
        setIsAnswered(true);

        if (index === questions[currentIndex].correctIndex) {
            setScore(score + 1);
            confetti({
                particleCount: 50,
                spread: 60,
                origin: { y: 0.7 }
            });
        }
    };

    const nextQuestion = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setSelectedOption(null);
            setIsAnswered(false);
        } else {
            setShowResult(true);
            if (score === questions.length) {
                confetti({
                    particleCount: 150,
                    spread: 100,
                    origin: { y: 0.6 }
                });
            }
        }
    };

    const restartQuiz = () => {
        setLoading(true);
        fetch("/data/quiz.json")
            .then((res) => res.json())
            .then((data) => {
                const shuffled = data.sort(() => 0.5 - Math.random()).slice(0, 5);
                setQuestions(shuffled);
                setLoading(false);
                setCurrentIndex(0);
                setScore(0);
                setShowResult(false);
                setSelectedOption(null);
                setIsAnswered(false);
            });
    };

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
            </main>
        );
    }

    const currentQuestion = questions[currentIndex];

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Quiz",
        "name": "Islamic General Knowledge Quiz",
        "description": "Test your knowledge of Islam, Quran, and Sunnah.",
        "educationLevel": "Beginner",
        "assesses": "Islamic Knowledge",
        "url": "https://r-ramadhan.vercel.app/quiz"
    };

    return (
        <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 py-12">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <div className="w-full rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-sm">
                {showResult ? (
                    <div className="text-center space-y-6">
                        <h2 className="text-3xl font-bold text-white">
                            {lang === 'bn' ? 'কুইজ সম্পন্ন!' : 'Quiz Completed!'}
                        </h2>

                        <div className="flex flex-col items-center justify-center gap-2">
                            <div className="text-6xl font-bold text-emerald-400">
                                {score} / {questions.length}
                            </div>
                            <p className="text-slate-400">
                                {lang === 'bn' ? 'আপনার স্কোর' : 'Your Score'}
                            </p>
                        </div>

                        <p className="text-lg text-slate-300">
                            {score === questions.length
                                ? (lang === 'bn' ? 'মাশাআল্লাহ! সব উত্তর সঠিক!' : 'MashaAllah! Perfect score!')
                                : (lang === 'bn' ? 'ভালো করেছেন! আরও চেষ্টা করুন।' : 'Goodjob! Keep learning.')}
                        </p>

                        <button
                            onClick={restartQuiz}
                            className="mt-4 rounded-full bg-emerald-600 px-8 py-3 font-medium text-white transition hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-500/25"
                        >
                            {lang === 'bn' ? 'আবার খেলুন' : 'Play Again'}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-8">
                        <header className="flex items-center justify-between text-sm text-slate-400">
                            <span>{lang === 'bn' ? `প্রশ্ন ${currentIndex + 1}/${questions.length}` : `Question ${currentIndex + 1}/${questions.length}`}</span>
                            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white">
                                {lang === 'bn' ? 'ইসলামিক কুইজ' : 'Islamic Quiz'}
                            </span>
                        </header>

                        <h2 className="text-2xl font-bold leading-relaxed text-white md:text-3xl">
                            {lang === 'bn' ? currentQuestion.question_bn : currentQuestion.question}
                        </h2>

                        <div className="grid gap-4">
                            {(lang === 'bn' ? currentQuestion.options_bn : currentQuestion.options).map((option, idx) => {
                                let buttonStyle = "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 hover:border-white/20";

                                if (isAnswered) {
                                    if (idx === currentQuestion.correctIndex) {
                                        buttonStyle = "border-emerald-500 bg-emerald-500/20 text-emerald-300";
                                    } else if (idx === selectedOption) {
                                        buttonStyle = "border-red-500 bg-red-500/20 text-red-300";
                                    } else {
                                        buttonStyle = "opacity-50 border-white/5 bg-white/5";
                                    }
                                }

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => handleOptionClick(idx)}
                                        disabled={isAnswered}
                                        className={`flex items-center justify-between rounded-xl border p-4 text-left text-lg font-medium transition-all ${buttonStyle}`}
                                    >
                                        <span>{option}</span>
                                        {isAnswered && idx === currentQuestion.correctIndex && (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6 text-emerald-500">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        )}
                                        {isAnswered && idx === selectedOption && idx !== currentQuestion.correctIndex && (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6 text-red-500">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {isAnswered && (
                            <div className="animate-in fade-in slide-in-from-bottom-4">
                                <div className="mb-6 rounded-xl bg-blue-500/10 p-4 text-blue-200 border border-blue-500/20">
                                    <p className="font-semibold mb-1">{lang === 'bn' ? 'ব্যাখ্যা:' : 'Explanation:'}</p>
                                    <p className="text-sm opacity-90">{lang === 'bn' ? currentQuestion.explanation_bn : currentQuestion.explanation}</p>
                                </div>
                                <button
                                    onClick={nextQuestion}
                                    className="w-full rounded-xl bg-white text-brand-deep py-4 font-bold transition hover:bg-slate-200"
                                >
                                    {currentIndex === questions.length - 1
                                        ? (lang === 'bn' ? 'ফলাফল দেখুন' : 'See Result')
                                        : (lang === 'bn' ? 'পরবর্তী প্রশ্ন' : 'Next Question')}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}
