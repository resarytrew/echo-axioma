import { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../utils/cn";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "ghost" | "outline" | "danger";
  size?: "md" | "lg" | "sm";
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        `ui-button ui-button-${variant}`,
        "relative inline-flex items-center justify-center gap-2 font-head font-medium tracking-wide transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40 active:scale-[0.98]",
        size === "md" && "rounded-xl px-6 py-3 text-sm",
        size === "lg" && "rounded-xl px-8 py-4 text-base",
        size === "sm" && "rounded-lg px-4 py-2 text-xs",
        variant === "primary" &&
          "bg-gradient-to-br from-sky-500 to-cyan-600 text-white shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 hover:from-sky-400 hover:to-cyan-500",
        variant === "outline" &&
          "border border-slate-300 bg-white/70 text-slate-700 hover:border-sky-400 hover:text-sky-700 hover:bg-sky-50/70",
        variant === "ghost" &&
          "text-slate-500 hover:text-sky-700 hover:bg-sky-50/70 rounded-lg",
        variant === "danger" &&
          "border border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
