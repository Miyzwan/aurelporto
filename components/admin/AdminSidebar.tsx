"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useRef } from "react";

import { adminNavigation, isAdminNavigationActive } from "@/components/admin/routes";
import { cn } from "@/lib/utils/cn";

import type { AdminProfile } from "./AdminShell";

interface AdminSidebarProps {
  isOpen: boolean;
  logoutSlot: ReactNode;
  onClose: () => void;
  profile?: AdminProfile | null;
}

const navigationGroups = ["Overview", "Content", "Operations"] as const;

export function AdminSidebar({ isOpen, logoutSlot, onClose, profile }: AdminSidebarProps) {
  const pathname = usePathname();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const displayName = profile?.displayName ?? "Admin account";

  useEffect(() => {
    if (!isOpen) return;

    closeButtonRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  return (
    <>
      <button
        type="button"
        aria-label="Dismiss admin navigation"
        hidden={!isOpen}
        onClick={onClose}
        className="bg-ink/20 desktop:hidden fixed inset-0 z-40 cursor-default"
      />

      <aside
        id="admin-navigation"
        aria-label="Admin navigation"
        className={cn(
          "bg-ink text-warm-white desktop:sticky desktop:top-0 desktop:flex desktop:h-dvh desktop:w-72 desktop:shrink-0 desktop:flex-col",
          isOpen ? "fixed inset-y-0 left-0 z-50 flex w-[min(88vw,22rem)] flex-col" : "hidden",
        )}
      >
        <div className="flex items-start justify-between gap-6 border-b border-white/20 px-6 py-6">
          <div>
            <p className="type-meta text-white/55">Portfolio admin</p>
            <p className="font-display mt-3 text-2xl leading-none tracking-tight">Aurelia</p>
          </div>

          {isOpen ? (
            <button
              ref={closeButtonRef}
              type="button"
              aria-label="Close admin navigation drawer"
              onClick={onClose}
              className="type-meta hover:text-warm-white desktop:hidden min-h-11 px-2 py-2 text-white/65 transition-colors duration-(--duration-quick)"
            >
              Close
            </button>
          ) : null}
        </div>

        <nav aria-label="Admin" className="flex-1 overflow-y-auto px-4 py-6">
          {navigationGroups.map((group) => {
            const items = adminNavigation.filter((item) => item.group === group);
            return (
              <div key={group} className="not-first:mt-8">
                <p className="type-meta px-3 text-white/45">{group}</p>
                <ul className="mt-3 flex flex-col gap-1">
                  {items.map((item) => {
                    const isActive = isAdminNavigationActive(pathname, item.href);
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          aria-current={isActive ? "page" : undefined}
                          onClick={onClose}
                          className={cn(
                            "type-spec flex min-h-11 items-center justify-between gap-4 px-3 py-2 transition-colors duration-(--duration-quick)",
                            isActive
                              ? "bg-warm-white text-ink"
                              : "hover:text-warm-white text-white/75 hover:bg-white/10",
                          )}
                        >
                          <span>{item.label}</span>
                          <span
                            aria-hidden="true"
                            className={cn("text-xs", !isActive && "opacity-0")}
                          >
                            —
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>

        <div className="border-t border-white/20 px-6 py-5">
          <p className="type-meta truncate text-white/45">{displayName}</p>
          <div className="mt-3">{logoutSlot}</div>
        </div>
      </aside>
    </>
  );
}
