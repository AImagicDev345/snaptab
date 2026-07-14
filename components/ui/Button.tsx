import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const base =
  "press no-tap-highlight inline-flex items-center justify-center gap-2 rounded-2xl min-h-11 px-4 text-base font-semibold select-none disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary:
    "bg-accent text-accent-fg hover:bg-accent-strong ring-1 ring-inset ring-accent-strong/40",
  secondary: "bg-surface text-fg border border-line hover:bg-surface-strong",
  ghost: "bg-transparent text-fg hover:bg-surface",
  danger: "bg-danger text-danger-fg hover:brightness-110",
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
      className={[base, variants[variant], fullWidth ? "w-full" : "", className]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {children}
    </button>
  );
});
