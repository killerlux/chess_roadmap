import type { HTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "secondary" | "outline" | "success" | "warning";
};

const variantMap: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default: "bg-primary text-primary-foreground",
  secondary: "bg-secondary text-secondary-foreground",
  outline: "border border-border",
  success: "bg-emerald-500/15 text-emerald-600",
  warning: "bg-amber-500/15 text-amber-600",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <span
      className={twMerge(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantMap[variant],
        className,
      )}
      {...props}
    />
  );
}
