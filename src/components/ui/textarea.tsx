import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-input placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-primary/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-xs border bg-transparent px-4 py-3 text-base transition-[color,box-shadow] outline-none hover:border-foreground focus-visible:ring-[2px] focus-visible:border-2 disabled:cursor-not-allowed disabled:opacity-[0.38] md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
