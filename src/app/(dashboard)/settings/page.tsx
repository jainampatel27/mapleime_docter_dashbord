"use client";

import { useWallpaper, WALLPAPER_BUNDLES, WallpaperTheme } from "@/hooks/use-wallpaper";
import { cn } from "@/lib/utils";
import { CheckCircle2, ImageOff, Sun, Moon } from "lucide-react";
import Image from "next/image";

const OPTIONS: { id: WallpaperTheme; label: string; description: string }[] = [
    {
        id: "none",
        label: "Default",
        description: "Clean default theme — no background image",
    },
    {
        id: "ocean",
        label: WALLPAPER_BUNDLES.ocean.label,
        description: WALLPAPER_BUNDLES.ocean.description,
    },
    {
        id: "sakura",
        label: WALLPAPER_BUNDLES.sakura.label,
        description: WALLPAPER_BUNDLES.sakura.description,
    },
    {
        id: "nature",
        label: WALLPAPER_BUNDLES.nature.label,
        description: WALLPAPER_BUNDLES.nature.description,
    },
];

export default function SettingsPage() {
    const { wallpaperTheme, setWallpaperTheme } = useWallpaper();

    return (
        <div className="space-y-10 max-w-3xl">
            {/* Page Header */}
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
                <p className="text-muted-foreground text-sm mt-1">
                    Personalise your dashboard appearance.
                </p>
            </div>

            {/* Wallpaper Section */}
            <section>
                <div className="mb-5">
                    <h3 className="text-base font-semibold">Dashboard Wallpaper</h3>
                    <p className="text-muted-foreground text-sm mt-0.5">
                        Select a wallpaper theme. The{" "}
                        <span className="inline-flex items-center gap-1 font-medium">
                            <Sun className="h-3 w-3 text-amber-500" /> light
                        </span>{" "}
                        and{" "}
                        <span className="inline-flex items-center gap-1 font-medium">
                            <Moon className="h-3 w-3 text-indigo-400" /> dark
                        </span>{" "}
                        variants switch automatically with your theme — no extra config needed.
                    </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                    {OPTIONS.map((opt) => {
                        const isSelected = wallpaperTheme === opt.id;
                        const bundle =
                            opt.id !== "none" ? WALLPAPER_BUNDLES[opt.id] : null;

                        return (
                            <button
                                key={opt.id}
                                onClick={() => setWallpaperTheme(opt.id)}
                                className={cn(
                                    "group relative flex flex-col overflow-hidden rounded-xl border-2 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                    isSelected
                                        ? "border-primary shadow-lg ring-2 ring-primary/20"
                                        : "border-border hover:border-primary/40 hover:shadow-md"
                                )}
                            >
                                {/* Preview area */}
                                {bundle ? (
                                    /* Side-by-side light + dark thumbnails */
                                    <div className="relative flex h-32 w-full overflow-hidden">
                                        {/* Light half */}
                                        <div className="relative w-1/2 overflow-hidden">
                                            <Image
                                                src={bundle.light}
                                                alt={`${opt.label} light`}
                                                fill
                                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                                                sizes="(max-width: 640px) 50vw, 17vw"
                                            />
                                            {/* Label badge */}
                                            <span className="absolute bottom-1 left-1 flex items-center gap-0.5 rounded-sm bg-background/70 px-1 py-0.5 text-[9px] font-semibold text-foreground backdrop-blur-sm">
                                                <Sun className="h-2.5 w-2.5 text-amber-500" /> Light
                                            </span>
                                        </div>

                                        {/* Divider */}
                                        <div className="absolute inset-y-0 left-1/2 z-10 w-px -translate-x-1/2 bg-background/40" />

                                        {/* Dark half */}
                                        <div className="relative w-1/2 overflow-hidden">
                                            <Image
                                                src={bundle.dark}
                                                alt={`${opt.label} dark`}
                                                fill
                                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                                                sizes="(max-width: 640px) 50vw, 17vw"
                                            />
                                            <span className="absolute bottom-1 right-1 flex items-center gap-0.5 rounded-sm bg-foreground/50 px-1 py-0.5 text-[9px] font-semibold text-background backdrop-blur-sm">
                                                <Moon className="h-2.5 w-2.5 text-indigo-300" /> Dark
                                            </span>
                                        </div>

                                        {/* Selected overlay */}
                                        {isSelected && (
                                            <div className="absolute inset-0 z-20 flex items-center justify-center bg-foreground/20">
                                                <CheckCircle2 className="h-8 w-8 text-background drop-shadow-md" />
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    /* "None" card */
                                    <div
                                        className={cn(
                                            "relative flex h-32 w-full items-center justify-center overflow-hidden",
                                            "bg-gradient-to-br from-muted to-muted/70"
                                        )}
                                    >
                                        <ImageOff className="h-8 w-8 text-muted-foreground/40" />
                                        {isSelected && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-foreground/10">
                                                <CheckCircle2 className="h-8 w-8 text-primary drop-shadow" />
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Label area */}
                                <div className="bg-card px-3 py-2.5">
                                    <span
                                        className={cn(
                                            "text-sm font-semibold",
                                            isSelected && "text-primary"
                                        )}
                                    >
                                        {opt.label}
                                    </span>
                                    <p className="mt-0.5 text-xs text-muted-foreground leading-snug">
                                        {opt.description}
                                    </p>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {wallpaperTheme !== "none" && (
                    <p className="mt-4 text-xs text-muted-foreground">
                        ✓ <span className="font-medium">{WALLPAPER_BUNDLES[wallpaperTheme].label}</span> wallpaper active — toggles automatically with your light / dark theme.
                    </p>
                )}
            </section>
        </div>
    );
}
