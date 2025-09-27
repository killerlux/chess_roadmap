import { Slot } from "@radix-ui/react-slot";
import { clsx } from "clsx";
import type { ComponentPropsWithoutRef, ElementRef } from "react";
import { forwardRef } from "react";
import { twMerge } from "tailwind-merge";

export interface ButtonProps extends ComponentPropsWithoutRef<"button"> {
  asChild?: boolean;
}

const buttonVariants =
  "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

export const Button = forwardRef<ElementRef<"button">, ButtonProps>(
  ({ className, asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref as never}
        className={twMerge(clsx(buttonVariants, className))}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
