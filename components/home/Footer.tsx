import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-6 border-t border-neutral-900 pt-4 text-xs text-neutral-500">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span>&copy; {new Date().getFullYear()} SnapTab</span>
        <div className="flex gap-4">
          <Link href="/privacy" className="hover:text-neutral-300">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-neutral-300">
            Terms
          </Link>
        </div>
      </div>
      <p className="mt-2 text-[11px] text-neutral-600">
        SnapTab is not a payment processor. We just calculate the split and hand you a link.
      </p>
    </footer>
  );
}
