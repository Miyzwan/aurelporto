"use client";

import Link from "next/link";
import { useState } from "react";

import type { Page } from "@/types/content";

const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
  { value: "archived", label: "Archived" },
] as const;

export interface PagesScreenProps {
  initialPages: Page[];
}

export function PagesScreen({ initialPages }: PagesScreenProps) {
  const [pages] = useState<Page[]>(initialPages);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const filteredPages = pages.filter((page) => {
    if (statusFilter !== "all" && page.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        page.title.toLowerCase().includes(q) ||
        page.slug.toLowerCase().includes(q) ||
        (page.navLabel && page.navLabel.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-8">
      <header className="border-line rule-hairline pb-8">
        <p className="type-meta text-foreground-muted">Content</p>
        <h1 className="font-display desktop:text-7xl mt-4 text-5xl leading-none tracking-tight">
          Pages
        </h1>
        <p className="type-spec text-foreground-muted mt-4 max-w-2xl">
          Manage page titles, SEO metadata, open graph preview media, and editable content section
          blocks.
        </p>
      </header>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter pages by title or slug..."
          className="border-line focus:border-foreground w-full max-w-sm border bg-transparent px-4 py-2 text-sm outline-none"
        />

        <div className="flex items-center gap-2">
          <label htmlFor="page-status-filter" className="type-meta text-foreground-muted">
            Status:
          </label>
          <select
            id="page-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border-line focus:border-foreground border bg-transparent px-3 py-2 text-sm outline-none"
          >
            {STATUS_FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Pages Table */}
      <div className="border-line bg-surface overflow-x-auto border">
        <table className="w-full text-left">
          <thead className="border-line border-b">
            <tr>
              <th className="type-meta text-foreground-muted px-6 py-4">Title</th>
              <th className="type-meta text-foreground-muted px-6 py-4">Slug</th>
              <th className="type-meta text-foreground-muted px-6 py-4">Nav Label</th>
              <th className="type-meta text-foreground-muted px-6 py-4">Status</th>
              <th className="type-meta text-foreground-muted px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-line divide-y">
            {filteredPages.length === 0 ? (
              <tr>
                <td colSpan={5} className="type-spec text-foreground-muted px-6 py-8 text-center">
                  No pages match your filter.
                </td>
              </tr>
            ) : (
              filteredPages.map((page) => (
                <tr key={page.id} className="hover:bg-canvas/50 transition-colors">
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/pages/${page.slug}`}
                      className="font-medium hover:underline"
                    >
                      {page.title}
                    </Link>
                  </td>
                  <td className="text-foreground-muted px-6 py-4 font-mono text-xs">
                    /{page.slug === "home" ? "" : page.slug}
                  </td>
                  <td className="text-foreground-muted px-6 py-4 text-sm">
                    {page.navLabel || "—"}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`type-meta inline-block px-2 py-0.5 text-xs ${
                        page.status === "published"
                          ? "bg-ink text-warm-white"
                          : page.status === "draft"
                            ? "bg-surface-elevated text-foreground border-line border"
                            : "bg-line text-foreground-muted"
                      }`}
                    >
                      {page.status}
                    </span>
                  </td>
                  <td className="space-x-3 px-6 py-4 text-right">
                    <Link
                      href={page.slug === "home" ? "/" : `/${page.slug}`}
                      target="_blank"
                      className="type-meta text-foreground-muted hover:text-foreground text-xs"
                    >
                      View Live ↗
                    </Link>
                    <Link
                      href={`/admin/pages/${page.slug}`}
                      className="border-line-strong type-meta hover:bg-ink hover:text-warm-white inline-flex border px-3 py-1 text-xs transition-colors"
                    >
                      Edit Sections
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
