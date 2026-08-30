"use client";

import type { RefObject } from "react";
import { usePathname } from "next/navigation";

import { getAdminPageLabel } from "@/components/admin/routes";

import type { AdminProfile } from "./AdminShell";

interface AdminHeaderProps {
  isNavigationOpen: boolean;
  menuButtonRef: RefObject<HTMLButtonElement | null>;
  onMenuToggle: () => void;
  profile?: AdminProfile | null;
}

export function AdminHeader({
  isNavigationOpen,
  menuButtonRef,
  onMenuToggle,
  profile,
}: AdminHeaderProps) {
  const pathname = usePathname();
  const pageLabel = getAdminPageLabel(pathname);
  const displayName = profile?.displayName ?? "Admin account";

  return (
    <header className="border-line bg-canvas/95 sticky top-0 z-30 border-b backdrop-blur-sm">
      <div className="tablet:px-8 desktop:px-10 flex min-h-20 items-center justify-between gap-6 px-5 py-4">
        <div className="flex min-w-0 items-center gap-4">
          <button
            ref={menuButtonRef}
            type="button"
            aria-expanded={isNavigationOpen}
            aria-controls="admin-navigation"
            aria-label={
              isNavigationOpen ? "Close admin navigation menu" : "Open admin navigation menu"
            }
            onClick={onMenuToggle}
            className="border-line-strong type-meta hover:bg-ink hover:text-warm-white desktop:hidden inline-flex min-h-11 items-center border px-3 transition-colors duration-(--duration-quick)"
          >
            {isNavigationOpen ? "Close" : "Menu"}
          </button>

          <div className="min-w-0">
            <p className="type-meta text-foreground-subtle truncate">Admin workspace</p>
            <h1 className="font-display truncate text-2xl leading-tight tracking-tight">
              {pageLabel}
            </h1>
          </div>
        </div>

        <p className="type-meta text-foreground-muted tablet:block hidden shrink-0">
          {displayName}
        </p>
      </div>
    </header>
  );
}
