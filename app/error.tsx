"use client";

import Link from "next/link";
import { useEffect } from "react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function RootError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("[RootError] Unhandled application error:", error);
  }, [error]);

  return (
    <div className="bg-canvas flex min-h-[60vh] flex-col items-center justify-center px-(--spacing-gutter) py-24 text-center">
      <p className="type-meta text-foreground-muted mb-4">Error</p>
      <h1 className="type-display text-foreground max-w-xl">Something went wrong</h1>
      <p className="type-body text-foreground-muted mt-6 max-w-md">
        An unexpected error occurred while loading this page. Please try again or return to the home
        page.
      </p>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => reset()}
          className="border-line-strong hover:bg-surface-subtle type-meta cursor-pointer border px-6 py-3.5 transition-colors duration-(--duration-quick)"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="text-foreground-muted hover:text-foreground type-meta px-4 py-3.5 transition-colors duration-(--duration-quick)"
        >
          Return Home &rarr;
        </Link>
      </div>
    </div>
  );
}
