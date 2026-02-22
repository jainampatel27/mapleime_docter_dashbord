"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export function BackButton() {
    const router = useRouter();
    return (
        <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 px-2 text-muted-foreground hover:text-foreground font-medium"
            onClick={() => router.back()}
        >
            <ArrowLeft className="h-4 w-4" />
            Back
        </Button>
    );
}
