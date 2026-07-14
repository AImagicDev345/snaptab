import { forwardRef, type InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { label, hint, error, className = "", id, ...rest },
  ref,
) {
  const inputId = id ?? rest.name;
  return (
    <label className="block" htmlFor={inputId}>
      {label ? (
        <span className="mb-1 block text-sm font-medium text-neutral-300">{label}</span>
      ) : null}
      <input
        ref={ref}
        id={inputId}
        className={[
          "w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-3 text-base",
          "text-neutral-100 placeholder:text-neutral-500",
          "focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40",
          error ? "border-rose-600" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...rest}
      />
      {error ? (
        <span className="mt-1 block text-xs text-rose-400">{error}</span>
      ) : hint ? (
        <span className="mt-1 block text-xs text-neutral-500">{hint}</span>
      ) : null}
    </label>
  );
});
