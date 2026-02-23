"use server";

export interface GeoResult {
    lat: number;
    lng: number;
    displayName: string;
}

async function nominatim(query: string): Promise<GeoResult | null> {
    if (!query.trim()) return null;
    try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=ca,us`;
        const res = await fetch(url, {
            headers: { "User-Agent": "MapleIME-DoctorDashboard/1.0" },
            next: { revalidate: 3600 },
        });
        if (!res.ok) return null;
        const json = await res.json();
        if (!Array.isArray(json) || json.length === 0) return null;
        return {
            lat: parseFloat(json[0].lat),
            lng: parseFloat(json[0].lon),
            displayName: json[0].display_name ?? query,
        };
    } catch {
        return null;
    }
}

/**
 * Geocode a patient address / postal code using OSM Nominatim.
 * Tries multiple fallback strategies before giving up.
 */
export async function geocodeAddress(
    address: string | null | undefined,
    postalCode: string | null | undefined
): Promise<GeoResult | null> {  
    // Strategy 1: full address + postal code
    if (address && postalCode) {
        const r = await nominatim(`${address}, ${postalCode}`);
        if (r) return r;
    }
    // Strategy 2: address alone
    if (address) {
        const r = await nominatim(address);
        if (r) return r;
    }
    // Strategy 3: postal code + Canada (handles Canadian postal codes like "L1V 6S6")
    if (postalCode) {
        const r = await nominatim(`${postalCode}, Canada`);
        if (r) return r;
    }
    // Strategy 4: postal code alone
    if (postalCode) {
        const r = await nominatim(postalCode);
        if (r) return r;
    }
    return null;
}
