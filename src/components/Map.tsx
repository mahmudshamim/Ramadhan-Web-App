"use client";

import { useEffect } from "react";
import { useLang } from "../lib/i18n";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Only run leafleft icon fix on client
if (typeof window !== "undefined") {
    // delete (L.Icon.Default.prototype as any)._getIconUrl;
}

// Component to handle map center updates
function ChangeView({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center);
    }, [center, map]);
    return null;
}

type Place = {
    id: number;
    lat: number;
    lon: number;
    name: string;
    type: "mosque" | "halal";
};

type MapProps = {
    center: [number, number];
    places: Place[];
};

// Custom icons defined outside to avoid re-creation on render
const mosqueIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/markers-default/green-2x.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const halalIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/markers-default/orange-2x.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const userIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/markers-default/blue-2x.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

export default function Map({ center, places }: MapProps) {
    const { t, lang } = useLang();



    return (
        <div className="h-full w-full rounded-2xl overflow-hidden shadow-lg border border-white/10 relative z-0">
            <MapContainer center={center} zoom={15} scrollWheelZoom={true} className="h-full w-full" style={{ height: "100%", width: "100%" }}>
                <ChangeView center={center} />
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={center} icon={userIcon}>
                    <Popup>
                        {lang === "bn" ? "আপনার অবস্থান" : "Your Location"}
                    </Popup>
                </Marker>

                {places.map((place) => (
                    <Marker
                        key={place.id}
                        position={[place.lat, place.lon]}
                        icon={place.type === "mosque" ? mosqueIcon : halalIcon}
                    >
                        <Popup>
                            <div className="font-sans">
                                <h3 className="font-bold text-sm">{place.name}</h3>
                                <p className="text-xs text-slate-500 capitalize">{place.type}</p>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}
