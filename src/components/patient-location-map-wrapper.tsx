"use client";

import dynamic from "next/dynamic";
import { MapPin } from "lucide-react";

const PatientLocationMap = dynamic(
    () => import("./patient-location-map").then((m) => m.PatientLocationMap),
    {
        ssr: false,
        loading: () => (
            <div className="h-64 w-full rounded-lg border bg-muted/40 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <MapPin className="h-5 w-5 animate-pulse" />
                    <span className="text-xs">Loading map…</span>
                </div>
            </div>
        ),
    }
);

interface Props {
    lat: number;
    lng: number;
    displayName: string;
    address: string | null;
    postalCode: string | null;
}

export function PatientLocationMapWrapper(props: Props) {
    return <PatientLocationMap {...props} />;
}
