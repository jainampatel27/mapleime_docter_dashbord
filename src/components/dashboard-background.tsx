"use client";

import { useEffect, useState } from "react";
import { useWallpaper, WALLPAPER_BUNDLES } from "@/hooks/use-wallpaper";

/** Detect the current resolved theme from the <html> class */
function useIsDark() {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const html = document.documentElement;

        const update = () => setIsDark(html.classList.contains("dark"));
        update();

        // Watch for theme changes applied by next-themes
        const observer = new MutationObserver(update);
        observer.observe(html, { attributes: true, attributeFilter: ["class"] });
        return () => observer.disconnect();
    }, []);

    return isDark;
}

export function DashboardBackground({
    children,
}: {
    children: React.ReactNode;
}) {
    const { wallpaperTheme } = useWallpaper();
    const isDark = useIsDark();

    const hasWallpaper = wallpaperTheme !== "none";

    // Pick light or dark variant automatically
    const bgImage = hasWallpaper
        ? isDark
            ? WALLPAPER_BUNDLES[wallpaperTheme].dark
            : WALLPAPER_BUNDLES[wallpaperTheme].light
        : undefined;

    return (
        <div className="relative flex flex-1 flex-col overflow-hidden">
            {/* Wallpaper layer — sits behind everything, transitions smoothly on theme change */}
            {bgImage && (
                <div
                    key={bgImage}                    // re-mount on swap for a clean fade
                    className="pointer-events-none absolute inset-0 z-0 animate-in fade-in duration-700"
                    style={{
                        backgroundImage: `url(${bgImage})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundAttachment: "fixed",
                    }}
                />
            )}

            {/*
       * Tint overlay:
       *   Light mode  → 20% white tint (keeps bright wallpaper from blinding)
       *   Dark mode   → 30% dark background tint (keeps dim wallpaper not too dim)
       * Cards have their own bg-card so they stay crisp on top.
       */}
            {hasWallpaper && (
                <div
                    className="pointer-events-none absolute inset-0 z-[1] transition-colors duration-700"
                    style={{
                        background: isDark
                            ? "color-mix(in oklch, var(--background) 30%, transparent)"
                            : "color-mix(in oklch, white 20%, transparent)",
                    }}
                />
            )}

            {/* Content sits above both layers */}
            <div className="relative z-[2] flex flex-1 flex-col">{children}</div>
        </div>
    );
}
