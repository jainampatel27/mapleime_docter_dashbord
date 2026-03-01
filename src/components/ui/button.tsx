import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

/**
 * MD3 Common Buttons
 * Spec: https://m3.material.io/components/buttons/specs
 *
 * Variants:
 *   - default    → MD3 "Filled" button
 *   - tonal      → MD3 "Filled Tonal" (secondary container)
 *   - outline    → MD3 "Outlined" button
 *   - ghost      → MD3 "Text" button
 *   - destructive→ Error-role filled button
 *   - secondary  → Legacy alias for tonal
 *   - link       → Non-MD3 convenience
 *   - premium    → Non-MD3 gradient
 *
 * Sizes (MD3 only defines 40dp, but we keep practical variants):
 *   - default: h-10 (40dp) — MD3 spec
 *   - sm: h-9
 *   - xs: h-7
 *   - lg: h-12
 *   - icon variants
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium tracking-[0.00625em] transition-all disabled:pointer-events-none disabled:opacity-[0.38] [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-[18px] shrink-0 [&_svg]:shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background select-none duration-200",
  {
    variants: {
      variant: {
        /* MD3 Filled Button: bg=primary, text=on-primary, hover=+elevation, state-layer=on-primary@8% */
        default:
          "bg-primary text-primary-foreground shadow-sm hover:shadow-md hover:bg-primary/[0.92] active:bg-primary/[0.88] active:shadow-sm",
        /* MD3 Filled Tonal: bg=secondary-container, text=on-secondary-container */
        tonal:
          "bg-secondary text-secondary-foreground shadow-sm hover:shadow-md hover:bg-secondary/[0.88] active:bg-secondary/[0.82] active:shadow-sm",
        /* MD3 Outlined: border=outline, text=primary, no fill */
        outline:
          "border border-border bg-transparent text-primary hover:bg-primary/[0.08] active:bg-primary/[0.10]",
        /* MD3 Text Button: no fill, no border, text=primary */
        ghost:
          "text-primary hover:bg-primary/[0.08] active:bg-primary/[0.10]",
        /* Error-role Filled */
        destructive:
          "bg-destructive text-white shadow-sm hover:shadow-md hover:bg-destructive/[0.92] active:bg-destructive/[0.88]",
        /* Legacy compat */
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:shadow-md hover:bg-secondary/[0.88] active:bg-secondary/[0.82] active:shadow-sm",
        link: "text-primary underline-offset-4 hover:underline",
        premium:
          "bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white hover:shadow-md border-0",
      },
      size: {
        /* MD3: 40dp height, 24dp horizontal padding, 8dp with icon */
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
