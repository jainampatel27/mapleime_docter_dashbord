"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

/** A wallpaper "theme" — each one has a light and dark variant */
export type WallpaperTheme = "none" | "ocean" | "sakura" | "nature";

/** Each bundle maps to a { light, dark } image pair */
export const WALLPAPER_BUNDLES: Record<
    Exclude<WallpaperTheme, "none">,
    { light: string; dark: string; label: string; description: string }
> = {
    ocean: {
        light: "/wallpaper-ocean-light.png",
        dark: "/wallpaper-ocean-dark.png",
        label: "Ocean",
        description: "Bright waves in light · Deep bioluminescent sea in dark",
    },
    sakura: {
        light: "/wallpaper-sakura-light.png",
        dark: "/wallpaper-sakura-dark.png",
        label: "Sakura",
        description: "Soft cherry blossoms in light · Moonlit night garden in dark",
    },
    nature: {
        light: "/wallpaper-nature-light.png",
        dark: "/wallpaper-nature-dark.png",
        label: "Nature",
        description: "Sunlit forest morning in light · Firefly moonlit forest in dark",
    },
};

interface WallpaperContextType {
    wallpaperTheme: WallpaperTheme;
    setWallpaperTheme: (theme: WallpaperTheme) => void;
}

const WallpaperContext = createContext<WallpaperContextType>({
    wallpaperTheme: "none",
    setWallpaperTheme: () => { },
});

export function WallpaperProvider({ children }: { children: React.ReactNode }) {
    const [wallpaperTheme, setThemeState] = useState<WallpaperTheme>("none");

    useEffect(() => {
        const stored = localStorage.getItem(
            "dashboard-wallpaper-theme"
        ) as WallpaperTheme | null;
        if (stored && ["none", "ocean", "sakura", "nature"].includes(stored)) {
            setThemeState(stored);
        }
    }, []);

    const setWallpaperTheme = (theme: WallpaperTheme) => {
        setThemeState(theme);
        localStorage.setItem("dashboard-wallpaper-theme", theme);
    };

    return (
        <WallpaperContext.Provider value={{ wallpaperTheme, setWallpaperTheme }}>
            {children}
        </WallpaperContext.Provider>
    );
}

export function useWallpaper() {
    return useContext(WallpaperContext);
}
