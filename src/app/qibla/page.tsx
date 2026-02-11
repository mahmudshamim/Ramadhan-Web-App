"use client";

import { useEffect, useState, useRef } from "react";
import { useLang } from "../../lib/i18n";
import { FiCompass, FiNavigation } from "react-icons/fi";

import { loadSettings } from "../../lib/settings";
import { CITY_OPTIONS } from "../../lib/cities";

export default function QiblaPage() {
    const { t, lang } = useLang();
    const [heading, setHeading] = useState<number | null>(null);
    const [qiblaBearing, setQiblaBearing] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [permissionGranted, setPermissionGranted] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [usingManual, setUsingManual] = useState(false);

    // Kaaba coordinates
    const KAABA_LAT = 21.422487;
    const KAABA_LONG = 39.826206;

    const getLocation = (highAccuracy = true) => {
        if (!navigator.geolocation) {
            useManualLocation();
            setError(lang === "bn" ? "আপনার ডিভাইসে জিপিএস নেই।" : "Geolocation not supported.");
            return;
        }

        setError(null);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                calculateQibla(latitude, longitude);
                setUsingManual(false);
                setError(null);
            },
            (err) => {
                console.warn(`GPS Warning (${highAccuracy ? 'High' : 'Low'}):`, err.message);

                // If high accuracy fails, try low accuracy
                if (highAccuracy) {
                    console.log("Retrying with low accuracy...");
                    getLocation(false);
                    return;
                }

                // Fallback to manual
                useManualLocation();

                if (err.code === 1) {
                    setError(lang === "bn" ? "লোকেশন অনুমতি দিন।" : "Please enable location permission.");
                } else if (err.code === 3) {
                    setError(lang === "bn" ? "লোকেশন টাইমআউট। আবার চেষ্টা করুন।" : "Location timeout. Please retry.");
                } else {
                    setError(lang === "bn" ? "লোকেশন পাওয়া যাচ্ছে না।" : "Location unavailable. Check GPS.");
                }
            },
            {
                enableHighAccuracy: highAccuracy,
                timeout: 15000,
                maximumAge: 0
            }
        );
    };

    useEffect(() => {
        // Check if iOS
        setIsIOS(
            typeof window !== "undefined" &&
            typeof (DeviceOrientationEvent as any).requestPermission === "function"
        );

        const settings = loadSettings();

        if (settings.useGPS) {
            getLocation();
        } else {
            useManualLocation();
        }
    }, [lang]);

    // Helper to calculate from manual settings
    const useManualLocation = () => {
        setUsingManual(true);
        const settings = loadSettings();
        if (settings.lat && settings.lon) {
            calculateQibla(settings.lat, settings.lon);
            return;
        }
        if (settings.city) {
            const cityData = CITY_OPTIONS.find(c => c.name === settings.city);
            if (cityData) {
                calculateQibla(cityData.lat, cityData.lon);
                return;
            }
        }
        // Default to Dhaka if nothing
        calculateQibla(23.8103, 90.4125);
    };

    const calculateQibla = (lat: number, long: number) => {
        const phiK = (KAABA_LAT * Math.PI) / 180.0;
        const lambdaK = (KAABA_LONG * Math.PI) / 180.0;
        const phi = (lat * Math.PI) / 180.0;
        const lambda = (long * Math.PI) / 180.0;

        const y = Math.sin(lambdaK - lambda);
        const x =
            Math.cos(phi) * Math.tan(phiK) -
            Math.sin(phi) * Math.cos(lambdaK - lambda);

        let bearing = (Math.atan2(y, x) * 180.0) / Math.PI;
        setQiblaBearing((bearing + 360) % 360);
    };

    const handleOrientation = (event: DeviceOrientationEvent) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const compass = (event as any).webkitCompassHeading || Math.abs(event.alpha! - 360);
        setHeading(compass);
    };

    const requestAccess = async () => {
        if (isIOS) {
            try {
                const response = await (DeviceOrientationEvent as any).requestPermission();
                if (response === "granted") {
                    setPermissionGranted(true);
                    window.addEventListener("deviceorientation", handleOrientation, true);
                } else {
                    setError("Permission denied");
                }
            } catch (e) {
                console.error(e);
                setError("Error requesting permission");
            }
        } else {
            setPermissionGranted(true);
            window.addEventListener("deviceorientationabsolute", handleOrientation, true);
            window.addEventListener("deviceorientation", handleOrientation, true);
        }
    };

    // Calculate rotation for compass needle
    // We want the needle to point to Qibla (qiblaBearing)
    // The compass rotates with the device (heading)
    // Needle rotation = qiblaBearing - heading
    const needleRotation = qiblaBearing !== null && heading !== null
        ? qiblaBearing - heading
        : 0;

    // Compass rose rotation = -heading (so North stays North visually)
    const compassRotation = heading !== null ? -heading : 0;

    return (
        <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-8 px-6 py-12 text-center">
            <header>
                <h1 className="font-display text-4xl font-bold text-white mb-2">
                    {lang === 'bn' ? 'কিবলা কম্পাস' : 'Qibla Compass'}
                </h1>
                <p className="text-slate-400">
                    {lang === 'bn' ? 'কাবা শরীফের দিকে নামাজ পড়ুন' : 'Find the direction of the Kaaba'}
                </p>
            </header>

            <div className="relative flex h-80 w-80 items-center justify-center rounded-full border-4 border-white/10 bg-slate-900 shadow-2xl">
                {/* Helper Instructions/State */}
                {!permissionGranted && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 backdrop-blur-sm z-10 p-6">
                        <button
                            onClick={requestAccess}
                            className="rounded-full bg-emerald-500 px-6 py-3 font-medium text-white shadow-lg transition hover:scale-105 active:scale-95"
                        >
                            {lang === 'bn' ? 'কম্পাস চালু করুন' : 'Enable Compass'}
                        </button>
                    </div>
                )}

                {/* Compass Rose (Rotates with device) */}
                <div
                    className="absolute inset-0 transition-transform duration-300 ease-out"
                    style={{ transform: `rotate(${compassRotation}deg)` }}
                >
                    {/* North Marker */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 text-xl font-bold text-red-500">N</div>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xl font-bold text-white/50">S</div>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xl font-bold text-white/50">E</div>
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-white/50">W</div>

                    {/* Ticks */}
                    {[...Array(12)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute left-1/2 top-0 h-full w-0.5 bg-white/10"
                            style={{ transform: `translateX(-50%) rotate(${i * 30}deg)` }}
                        ></div>
                    ))}
                </div>

                {/* Qibla Indicator (Points to Qibla relative to North) */}
                {qiblaBearing !== null && (
                    <div
                        className="absolute inset-0 transition-transform duration-300 ease-out"
                        style={{ transform: `rotate(${compassRotation + qiblaBearing}deg)` }}
                    >
                        <div className="absolute top-8 left-1/2 -translate-x-1/2 flex flex-col items-center">
                            <div className="h-12 w-1 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
                            <div className="mt-1">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-emerald-400">
                                    <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                )}

                {/* Center Dot */}
                <div className="absolute h-4 w-4 rounded-full bg-white shadow-lg z-20"></div>
            </div>

            <div className="mt-8 space-y-4 max-w-xs">
                {qiblaBearing ? (
                    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                        <p className="text-sm text-slate-400 mb-1">{lang === 'bn' ? 'কাবার দিক' : 'Qibla Direction'}</p>
                        <p className="text-2xl font-bold text-emerald-400">{qiblaBearing.toFixed(1)}°</p>
                    </div>
                ) : (
                    <p className="text-sm text-yellow-500/80 animate-pulse">
                        {lang === 'bn' ? 'লোকেশন নির্ণয় করা হচ্ছে...' : 'Detecting location...'}
                    </p>
                )}

                <p className="text-xs text-slate-500">
                    {lang === 'bn'
                        ? 'সঠিক ফলাফলের জন্য আপনার ডিভাইসটি সমান্তরাল রাখুন এবং ম্যাগনেটিক বস্তু থেকে দূরে থাকুন।'
                        : 'For best results, keep your device flat and away from magnetic objects.'}
                </p>

                {error && (
                    <div className="flex flex-col items-center gap-2">
                        <p className="text-sm text-red-400 bg-red-500/10 p-2 rounded-lg">{error}</p>
                        <button
                            onClick={() => getLocation(true)}
                            className="text-xs flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded-full hover:bg-white/20 transition text-slate-300"
                        >
                            <FiNavigation />
                            {lang === "bn" ? "আবার চেষ্টা করুন" : "Retry GPS"}
                        </button>
                    </div>
                )}
            </div>
        </main>
    );
}
