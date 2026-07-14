import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-6 border-t border-line pt-4 text-xs text-fg-subtle lg:mt-10 lg:pt-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span>&copy; {new Date().getFullYear()} SnapTab</span>
        <div className="flex gap-4">
          <Link href="/privacy" className="hover:text-fg">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-fg">
            Terms
          </Link>
        </div>
      </div>
      <p className="mt-2 text-[11px] text-fg-subtle">
        SnapTab is not a payment processor. We just calculate the split and hand you a link.
      </p>
    </footer>
  );
}
