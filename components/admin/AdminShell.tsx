"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminToaster } from "@/components/admin/AdminToaster";

export interface AdminProfile {
  displayName: string | null;
}

export interface AdminShellProps {
  children: ReactNode;
  logoutSlot?: ReactNode;
  profile?: AdminProfile | null;
}

const defaultLogoutSlot = (
  <Link
    href="/auth/signout"
    className="type-meta hover:text-warm-white inline-flex min-h-11 items-center text-white/75 transition-colors duration-(--duration-quick)"
  >
    Sign out
  </Link>
);

export function AdminShell({ children, logoutSlot = defaultLogoutSlot, profile }: AdminShellProps) {
  const [isNavigationOpen, setIsNavigationOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const wasNavigationOpen = useRef(false);

  const closeNavigation = useCallback(() => setIsNavigationOpen(false), []);

  useEffect(() => {
    if (wasNavigationOpen.current && !isNavigationOpen) {
      menuButtonRef.current?.focus();
    }
    wasNavigationOpen.current = isNavigationOpen;
  }, [isNavigationOpen]);

  return (
    <div className="bg-canvas min-h-dvh">
      <AdminToaster />
      <a
        href="#admin-main"
        className="bg-canvas type-meta focus:ring-focus sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:px-5 focus:py-3"
      >
        Skip to admin content
      </a>

      <div className="desktop:flex desktop:items-start">
        <AdminSidebar
          isOpen={isNavigationOpen}
          logoutSlot={logoutSlot}
          onClose={closeNavigation}
          profile={profile}
        />

        <div className="desktop:min-w-0 desktop:flex-1">
          <AdminHeader
            isNavigationOpen={isNavigationOpen}
            menuButtonRef={menuButtonRef}
            onMenuToggle={() => setIsNavigationOpen((open) => !open)}
            profile={profile}
          />

          <main
            id="admin-main"
            tabIndex={-1}
            className="tablet:px-8 tablet:py-10 desktop:px-10 desktop:py-12 min-h-[calc(100dvh-5rem)] px-5 py-8"
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
