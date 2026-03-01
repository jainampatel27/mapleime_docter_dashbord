"use client"

import * as React from "react"
import { Switch as SwitchPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Switch({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: "sm" | "default"
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted focus-visible:border-ring focus-visible:ring-ring/50 dark:data-[state=unchecked]:bg-input/80 group/switch inline-flex shrink-0 items-center rounded-full border-2 border-transparent shadow-none transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-[0.38] data-[state=unchecked]:border-input data-[size=default]:h-8 data-[size=default]:w-[52px] data-[size=sm]:h-5 data-[size=sm]:w-9",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "bg-background dark:data-[state=unchecked]:bg-foreground dark:data-[state=checked]:bg-primary-foreground pointer-events-none block rounded-full ring-0 transition-all group-data-[size=default]/switch:size-6 group-data-[size=sm]/switch:size-4 data-[state=checked]:translate-x-[calc(100%-6px)] data-[state=unchecked]:translate-x-0 data-[state=unchecked]:size-4 group-data-[size=sm]/switch:data-[state=unchecked]:size-3 shadow-sm group-active/switch:scale-[1.17]"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
