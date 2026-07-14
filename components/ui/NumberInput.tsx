import { forwardRef, type InputHTMLAttributes } from "react";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "inputMode" | "pattern"> & {
  label?: string;
  hint?: string;
  error?: string;
  prefix?: string;
};

export const NumberInput = forwardRef<HTMLInputElement, Props>(function NumberInput(
  { label, hint, error, prefix, className = "", id, ...rest },
  ref,
) {
  const inputId = id ?? rest.name;
  return (
    <label className="block" htmlFor={inputId}>
      {label ? (
        <span className="mb-1 block text-sm font-medium text-fg">{label}</span>
      ) : null}
      <div
        className={[
          "flex items-center rounded-xl border border-line bg-surface",
          "focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/30",
          error ? "border-danger" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {prefix ? (
          <span className="pl-3 pr-1 text-fg-subtle text-base select-none">{prefix}</span>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          type="text"
          inputMode="decimal"
          pattern="[0-9]*[.,]?[0-9]*"
          className={[
            "w-full rounded-xl bg-transparent px-3 py-3 text-base text-fg",
            "placeholder:text-fg-subtle focus:outline-none",
            prefix ? "pl-1" : "",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          {...rest}
        />
      </div>
      {error ? (
        <span className="mt-1 block text-xs text-danger">{error}</span>
      ) : hint ? (
        <span className="mt-1 block text-xs text-fg-subtle">{hint}</span>
      ) : null}
    </label>
  );
});
