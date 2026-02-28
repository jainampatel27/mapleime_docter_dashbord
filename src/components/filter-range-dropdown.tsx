"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";

const RANGES = [
    { value: "30", label: "Past 30 Days" },
    { value: "90", label: "Past 90 Days" },
    { value: "180", label: "Past 6 Months" },
    { value: "365", label: "Past Year" },
    { value: "all", label: "All Time" },
];

export function FilterRangeDropdown() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const currentRange = searchParams.get("range") || "30";
    const currentLabel = RANGES.find(r => r.value === currentRange)?.label || "Past 30 Days";

    const handleValueChange = (val: string) => {
        const params = new URLSearchParams(searchParams);
        if (val) {
            params.set("range", val);
        } else {
            params.delete("range");
        }
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="font-medium gap-2">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    {currentLabel}
                    <ChevronDown className="h-3.5 w-3.5 ml-1 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuRadioGroup value={currentRange} onValueChange={handleValueChange}>
                    {RANGES.map((range) => (
                        <DropdownMenuRadioItem key={range.value} value={range.value} className="cursor-pointer">
                            {range.label}
                        </DropdownMenuRadioItem>
                    ))}
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
