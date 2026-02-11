"use client";

import { useEffect, useState } from "react";
import { useLang } from "../../lib/i18n";
import { loadSettings } from "../../lib/settings";
import { CITY_OPTIONS } from "../../lib/cities";
import dynamic from "next/dynamic";
import { FiMapPin, FiNavigation } from "react-icons/fi";

// Import Map component dynamically with no SSR
const Map = dynamic(() => import("../../components/Map"), {
    ssr: false,
    loading: () => (
        <div className="flex h-[400px] w-full items-center justify-center rounded-2xl bg-white/5 animate-pulse">
            <p className="text-slate-400">Loading Map...</p>
        </div>
    ),
});

type Place = {
    id: number;
    lat: number;
    lon: number;
    name: string;
    type: "mosque" | "halal";
    distance?: number;
};

export default function NearbyPage() {
    const { t, lang } = useLang();
    const [center, setCenter] = useState<[number, number] | null>(null);
    const [places, setPlaces] = useState<Place[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"all" | "mosque" | "halal">("all");

    useEffect(() => {
        // Initialize location
        const settings = loadSettings();

        // Priority: Live GPS > Saved Manual Location > Default Dhaka
        if (settings.useGPS && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setCenter([pos.coords.latitude, pos.coords.longitude]);
                },
                (err) => {
                    console.log("GPS failed, using fallback");
                    useFallbackLocation(settings);
                }
            );
        } else {
            useFallbackLocation(settings);
        }
    }, []);

    const useFallbackLocation = (settings: any) => {
        if (settings.lat && settings.lon) {
            setCenter([settings.lat, settings.lon]);
        } else if (settings.city) {
            const city = CITY_OPTIONS.find(c => c.name === settings.city);
            if (city) setCenter([city.lat, city.lon]);
            else setCenter([23.8103, 90.4125]);
        } else {
            setCenter([23.8103, 90.4125]);
        }
    };

    useEffect(() => {
        if (!center) return;

        const fetchPlaces = async () => {
            setLoading(true);
            setError(null);
            try {
                const [lat, lon] = center;
                // Search radius: 2000 meters (2km)
                const radius = 2000;

                // Overpass API Query
                // We query for amenity=place_of_worship + religion=muslim (Mosques)
                // AND diet:halal=yes (Halal food) or cuisine=halal
                const query = `
          [out:json][timeout:25];
          (
            node["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${lat},${lon});
            way["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${lat},${lon});
            node["diet:halal"="yes"](around:${radius},${lat},${lon});
            node["cuisine"="halal"](around:${radius},${lat},${lon});
          );
          out body;
          >;
          out skel qt;
        `;

                const response = await fetch("https://overpass-api.de/api/interpreter", {
                    method: "POST",
                    body: query
                });

                if (!response.ok) throw new Error("Failed to fetch places");

                const data = await response.json();

                const nearbyPlaces: Place[] = data.elements
                    .filter((el: any) => el.tags && (el.tags.name || el.tags["name:en"] || el.tags["name:bn"]))
                    .map((el: any) => {
                        const isMosque = el.tags.amenity === "place_of_worship";
                        return {
                            id: el.id,
                            lat: el.lat || el.center?.lat, // Ways might need different handling but often nodes are simpler
                            lon: el.lon || el.center?.lon,
                            name: el.tags["name:bn"] || el.tags.name || el.tags["name:en"] || "Unknown",
                            type: isMosque ? "mosque" : "halal"
                        };
                    })
                    // Filter out items without coordinates (ways might be missing lat/lon in simple parsing)
                    .filter((p: any) => p.lat && p.lon);

                // Calculate distance
                const placesWithDist = nearbyPlaces.map(p => ({
                    ...p,
                    distance: calculateDistance(lat, lon, p.lat, p.lon)
                })).sort((a, b) => (a.distance || 0) - (b.distance || 0));

                setPlaces(placesWithDist);

            } catch (err) {
                console.error(err);
                setError(lang === 'bn' ? "তথ্য লোড করতে ব্যর্থ হয়েছে।" : "Failed to load data.");
            } finally {
                setLoading(false);
            }
        };

        fetchPlaces();
    }, [center]);

    // Haversine formula for distance in km
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371; // km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const filteredPlaces = activeTab === "all"
        ? places
        : places.filter(p => p.type === activeTab);

    return (
        <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-6 py-12 pb-32">
            <header className="flex flex-col gap-2">
                <h1 className="font-display text-4xl font-bold text-white">
                    {lang === 'bn' ? 'কাছাকাছি' : 'Nearby'}
                </h1>
                <p className="text-slate-400">
                    {lang === 'bn'
                        ? 'আপনার আশেপাশে মসজিদ এবং হালাল খাবার খুঁজুন'
                        : 'Find mosques and halal food near you'}
                </p>
            </header>

            {/* Map Section */}
            <section className="h-[400px] w-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 relative">
                {center ? (
                    <Map center={center} places={filteredPlaces} />
                ) : (
                    <div className="h-full w-full flex items-center justify-center bg-white/5 animate-pulse">
                        <p className="text-slate-400">Locating...</p>
                    </div>
                )}
            </section>

            {/* List Section */}
            <section>
                <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
                    <button
                        onClick={() => setActiveTab("all")}
                        className={`rounded-full px-6 py-2 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === "all"
                                ? "bg-brand-gold text-brand-deep"
                                : "bg-white/5 text-slate-300 hover:bg-white/10"
                            }`}
                    >
                        {lang === 'bn' ? 'সব' : 'All'}
                    </button>
                    <button
                        onClick={() => setActiveTab("mosque")}
                        className={`rounded-full px-6 py-2 text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === "mosque"
                                ? "bg-emerald-500 text-white"
                                : "bg-white/5 text-slate-300 hover:bg-white/10"
                            }`}
                    >
                        <span className="w-2 h-2 rounded-full bg-emerald-400 block"></span>
                        {lang === 'bn' ? 'মসজিদ' : 'Mosques'}
                    </button>
                    <button
                        onClick={() => setActiveTab("halal")}
                        className={`rounded-full px-6 py-2 text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === "halal"
                                ? "bg-orange-500 text-white"
                                : "bg-white/5 text-slate-300 hover:bg-white/10"
                            }`}
                    >
                        <span className="w-2 h-2 rounded-full bg-orange-400 block"></span>
                        {lang === 'bn' ? 'হালাল খাবার' : 'Halal Food'}
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-12 text-slate-400 animate-pulse">
                        {lang === 'bn' ? 'খোঁজা হচ্ছে...' : 'Searching nearby places...'}
                    </div>
                ) : filteredPlaces.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredPlaces.map(place => (
                            <div
                                key={place.id}
                                className="group rounded-xl border border-white/10 bg-white/5 p-4 transition-all hover:bg-white/10 hover:border-brand-gold/20"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-md ${place.type === "mosque"
                                            ? "bg-emerald-500/10 text-emerald-400"
                                            : "bg-orange-500/10 text-orange-400"
                                        }`}>
                                        {place.type === "mosque"
                                            ? (lang === 'bn' ? 'মসজিদ' : 'Mosque')
                                            : (lang === 'bn' ? 'খাবার' : 'Food')}
                                    </span>
                                    <span className="text-xs text-slate-400 flex items-center gap-1">
                                        <FiNavigation className="w-3 h-3" />
                                        {place.distance?.toFixed(1)} km
                                    </span>
                                </div>
                                <h3 className="font-medium text-slate-200 group-hover:text-brand-gold transition-colors">
                                    {place.name}
                                </h3>
                                <a
                                    href={`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lon}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-brand-gold hover:underline"
                                >
                                    <FiMapPin />
                                    {lang === 'bn' ? 'directions দেখুন' : 'Get Directions'}
                                </a>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 rounded-2xl border border-dashed border-white/10 bg-white/5">
                        <p className="text-slate-400 mb-2">
                            {lang === 'bn' ? 'কোনো তথ্য পাওয়া যায়নি' : 'No places found nearby'}
                        </p>
                        <p className="text-sm text-slate-500">
                            {lang === 'bn'
                                ? 'হয়তো এই এলাকায় ম্যাপের তথ্য অসম্পূর্ণ।'
                                : 'OpenStreetMap data might be incomplete for this area.'}
                        </p>
                    </div>
                )}
            </section>
        </main>
    );
}
