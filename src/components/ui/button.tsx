import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-transparent text-sm font-semibold whitespace-nowrap transition-all duration-200 outline-none select-none focus-visible:ring-3 focus-visible:ring-brand/30 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-brand text-white shadow-[0_1px_2px_rgba(5,77,54,0.25)] hover:bg-brand-dark active:translate-y-px",
        outline:
          "border-border bg-white text-ink hover:border-brand/30 hover:bg-brand-soft hover:text-brand-dark",
        soft: "bg-brand-light text-brand-dark hover:bg-[#d7eee3]",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-[#d7eee3]",
        ghost: "text-ink hover:bg-brand-light hover:text-brand-dark",
        destructive:
          "bg-destructive text-white shadow-sm hover:bg-destructive/90",
        "destructive-soft":
          "bg-red-50 text-red-700 hover:bg-red-100 border-red-100",
        link: "text-brand underline-offset-4 hover:text-brand-dark hover:underline",
        white:
          "bg-white text-brand-dark shadow-sm hover:bg-brand-light",
        navy: "bg-navy text-white hover:bg-navy-light",
      },
      size: {
        default: "h-10 px-4",
        xs: "h-7 rounded-md px-2.5 text-xs",
        sm: "h-8 rounded-md px-3 text-[13px]",
        lg: "h-11 rounded-xl px-5 text-[15px]",
        xl: "h-12 rounded-xl px-6 text-base",
        icon: "size-10",
        "icon-xs": "size-7 rounded-md",
        "icon-sm": "size-8 rounded-md",
        "icon-lg": "size-11 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
