"use client";

import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

export function SignOutButton() {
    return (
        <Button
            variant="outline"
            onClick={() => signOut({ callbackUrl: "http://localhost:9000/login" })}
            className="w-full font-medium h-11 transition-all hover:bg-zinc-100"
        >
            Sign Out
        </Button>
    );
}
