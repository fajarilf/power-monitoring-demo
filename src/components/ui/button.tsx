import type { ButtonHTMLAttributes } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

const VARIANT_CLASS: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "rounded-md px-4 py-2 text-sm font-semibold bg-phase-t text-[#04101c] hover:opacity-90",
  secondary:
    "rounded-md border border-border bg-surface-2 px-4 py-2 text-sm font-medium text-text-primary hover:bg-border-soft disabled:opacity-50",
};

export function Button({ variant = "primary", className, ...props }: ButtonProps) {
  const classes = className ? `${VARIANT_CLASS[variant]} ${className}` : VARIANT_CLASS[variant];
  return <button className={classes} {...props} />;
}
