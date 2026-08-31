import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page Not Found",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <div className="bg-canvas flex min-h-[60vh] flex-col items-center justify-center px-(--spacing-gutter) py-24 text-center">
      <p className="type-meta text-foreground-muted mb-4">404</p>
      <h1 className="type-display text-foreground max-w-xl">Page not found</h1>
      <p className="type-body text-foreground-muted mt-6 max-w-md">
        The spatial case study or page you are looking for does not exist or may have been
        relocated.
      </p>

      <div className="mt-10">
        <Link
          href="/"
          className="border-line-strong hover:bg-surface-subtle type-meta inline-flex items-center border px-6 py-3.5 transition-colors duration-(--duration-quick)"
        >
          Return to Home &rarr;
        </Link>
      </div>
    </div>
  );
}
