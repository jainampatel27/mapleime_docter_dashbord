"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

interface Props {
    lat: number;
    lng: number;
    displayName: string;
    address: string | null;
    postalCode: string | null;
}

// Fix the broken default marker icons in Webpack / Next.js
const markerIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

export function PatientLocationMap({ lat, lng, displayName, address, postalCode }: Props) {
    const mapRef = useRef<HTMLDivElement>(null);
    const leafletMap = useRef<L.Map | null>(null);

    useEffect(() => {
        if (!mapRef.current || leafletMap.current) return;

        const map = L.map(mapRef.current, {
            center: [lat, lng],
            zoom: 14,
            zoomControl: true,
            scrollWheelZoom: false,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 19,
        }).addTo(map);

        const label = [address, postalCode].filter(Boolean).join(", ") || displayName;

        L.marker([lat, lng], { icon: markerIcon })
            .addTo(map)
            .bindPopup(
                `<div style="font-size:12px;line-height:1.5;max-width:200px;">
                    <strong style="font-size:13px;">Patient Location</strong><br/>
                    ${label}
                </div>`,
                { maxWidth: 220 }
            )
            .openPopup();

        leafletMap.current = map;

        return () => {
            map.remove();
            leafletMap.current = null;
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div
            ref={mapRef}
            className="h-64 w-full rounded-lg overflow-hidden border"
            style={{ minHeight: "256px" }}
        />
    );
}
