import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const base =
  "press no-tap-highlight inline-flex items-center justify-center gap-2 rounded-2xl min-h-11 px-4 text-base font-semibold select-none disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary: "bg-amber-500 text-neutral-950 hover:bg-amber-400 shadow-[0_0_0_1px_rgba(245,158,11,0.4)]",
  secondary: "bg-neutral-800 text-neutral-100 hover:bg-neutral-700",
  ghost: "bg-transparent text-neutral-100 hover:bg-neutral-900",
  danger: "bg-rose-600 text-white hover:bg-rose-500",
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  fullWidth?: boolean;
  children: ReactNode;
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = "primary", fullWidth, className = "", children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      className={[base, variants[variant], fullWidth ? "w-full" : "", className].filter(Boolean).join(" ")}
      {...rest}
    >
      {children}
    </button>
  );
});
