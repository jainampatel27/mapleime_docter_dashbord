import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium tracking-wide transition-all disabled:pointer-events-none disabled:opacity-[0.38] [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background select-none duration-200",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:shadow-md hover:bg-primary/92 active:bg-primary/88",
        destructive:
          "bg-destructive text-white hover:shadow-md hover:bg-destructive/92 active:bg-destructive/88",
        outline:
          "border border-border bg-transparent text-foreground hover:bg-foreground/[0.08] active:bg-foreground/[0.10]",
        secondary:
          "bg-secondary text-secondary-foreground hover:shadow-sm hover:bg-secondary/80 active:bg-secondary/70",
        ghost:
          "text-foreground hover:bg-foreground/[0.08] active:bg-foreground/[0.10]",
        link: "text-primary underline-offset-4 hover:underline",
        premium:
          "bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white hover:shadow-md border-0",
      },
      size: {
        default: "h-10 px-6 py-2 has-[>svg]:px-4",
        xs: "h-7 gap-1 px-3 text-xs has-[>svg]:px-2 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-9 gap-1.5 px-4 has-[>svg]:px-3",
        lg: "h-12 px-8 text-base has-[>svg]:px-5",
        icon: "size-10",
        "icon-xs": "size-7 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-9",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
