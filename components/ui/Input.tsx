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
        <span className="mb-1 block text-sm font-medium text-fg">{label}</span>
      ) : null}
      <input
        ref={ref}
        id={inputId}
        className={[
          "w-full rounded-xl border border-line bg-surface px-3 py-3 text-base",
          "text-fg placeholder:text-fg-subtle",
          "focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30",
          error ? "border-danger" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...rest}
      />
      {error ? (
        <span className="mt-1 block text-xs text-danger">{error}</span>
      ) : hint ? (
        <span className="mt-1 block text-xs text-fg-subtle">{hint}</span>
      ) : null}
    </label>
  );
});
