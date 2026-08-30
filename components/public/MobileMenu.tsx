"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import { cn } from "@/lib/utils/cn";
import type { CallToAction, NavigationItem } from "@/types/content";

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

interface MobileMenuProps {
  items: NavigationItem[];
  cta?: CallToAction | null;
  siteName: string;
}

export function MobileMenu({ items, cta, siteName }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const panelId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const close = useCallback(() => setIsOpen(false), []);

  // Close on navigation. Without this the panel survives a client-side route
  // change and covers the page the visitor just asked for. This is React's
  // "adjust state during render" pattern rather than an effect, so the closed
  // panel is committed in the same pass as the new route.
  const [renderedPathname, setRenderedPathname] = useState(pathname);
  if (renderedPathname !== pathname) {
    setRenderedPathname(pathname);
    setIsOpen(false);
  }

  // Return focus to the trigger whenever the panel closes, including closes
  // caused by a route change rather than by the close button.
  const wasOpen = useRef(false);
  useEffect(() => {
    if (wasOpen.current && !isOpen) {
      triggerRef.current?.focus();
    }
    wasOpen.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const panel = panelRef.current;
    panel?.querySelector<HTMLElement>(FOCUSABLE)?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }

      if (event.key !== "Tab" || !panel) return;

      // The panel is only queried while it is open, so everything matching
      // FOCUSABLE inside it is reachable. Do not filter on `offsetParent`: it
      // is null for fixed-position subtrees and in any non-layout environment,
      // which silently empties the list and disables the trap.
      const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (element) => !element.hasAttribute("hidden") && element.getAttribute("aria-hidden") !== "true",
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, close]);

  return (
    <div className="desktop:hidden">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="type-meta -mr-2 px-2 py-3"
      >
        {isOpen ? "Close" : "Menu"}
      </button>

      <div
        ref={panelRef}
        id={panelId}
        role="dialog"
        aria-modal="true"
        aria-label={`${siteName} navigation`}
        hidden={!isOpen}
        className={cn(
          "bg-canvas fixed inset-0 z-50 flex flex-col overflow-y-auto",
          "px-(--spacing-gutter) pt-6 pb-16",
        )}
      >
        <div className="flex items-start justify-between">
          <span className="type-meta text-foreground-subtle">Menu</span>
          <button type="button" onClick={close} className="type-meta -mr-2 px-2 py-3">
            Close
          </button>
        </div>

        <nav aria-label="Main" className="mt-12 flex-1">
          <ul className="flex flex-col gap-2">
            {items.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  target={item.targetBlank ? "_blank" : undefined}
                  rel={item.targetBlank ? "noreferrer noopener" : undefined}
                  aria-current={pathname === item.href ? "page" : undefined}
                  className="type-heading block py-1"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {cta ? (
          <Link
            href={cta.href}
            target={cta.targetBlank ? "_blank" : undefined}
            rel={cta.targetBlank ? "noreferrer noopener" : undefined}
            className="border-line-strong type-meta mt-12 inline-flex w-full items-center justify-center border px-6 py-4"
          >
            {cta.label}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
