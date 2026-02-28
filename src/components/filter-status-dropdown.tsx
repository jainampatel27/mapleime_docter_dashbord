"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ListFilter, ChevronDown } from "lucide-react";

const STATUSES = [
    { value: "all", label: "All Statuses" },
    { value: "approved", label: "Approved" },
    { value: "pending", label: "Pending" },
    { value: "canceled", label: "Cancelled" },
    { value: "completed", label: "Completed" },
];

export function FilterStatusDropdown() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const currentStatus = searchParams.get("status") || "all";
    const currentLabel = STATUSES.find(s => s.value === currentStatus)?.label || "All Statuses";

    const handleValueChange = (val: string) => {
        const params = new URLSearchParams(searchParams);
        params.set("page", "1"); // reset to page 1 on filter change
        if (val && val !== "all") {
            params.set("status", val);
        } else {
            params.delete("status");
        }
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant={currentStatus !== "all" ? "default" : "outline"}
                    size="sm"
                    className="font-medium gap-2"
                >
                    <ListFilter className="h-4 w-4" />
                    {currentLabel}
                    <ChevronDown className="h-3.5 w-3.5 ml-1 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuRadioGroup value={currentStatus} onValueChange={handleValueChange}>
                    <DropdownMenuRadioItem value="all" className="cursor-pointer">All Statuses</DropdownMenuRadioItem>
                    <DropdownMenuSeparator />
                    {STATUSES.filter(s => s.value !== "all").map((s) => (
                        <DropdownMenuRadioItem key={s.value} value={s.value} className="cursor-pointer">
                            {s.label}
                        </DropdownMenuRadioItem>
                    ))}
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
