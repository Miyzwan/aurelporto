"use client";

import Link from "next/link";

export interface DashboardStats {
  pagesCount: number;
  inquiriesNewCount: number;
}

export function DashboardScreen({ stats }: { stats: DashboardStats }) {
  const sections = [
    {
      title: "Site Settings",
      description:
        "Manage global brand info, SEO defaults, social links, and contact qualification form options.",
      href: "/admin/site",
      badge: "Global",
    },
    {
      title: "Navigation",
      description:
        "Customize header menu links, footer colophons, and social external destinations.",
      href: "/admin/navigation",
      badge: "Structure",
    },
    {
      title: "Pages & Sections",
      description:
        "Edit page metadata, SEO settings, and modular content blocks (Home, About, Services, Contact).",
      href: "/admin/pages",
      badge: `${stats.pagesCount} pages`,
    },
    {
      title: "Project Inquiries",
      description:
        "Review incoming client submissions, qualify leads, and maintain private follow-up notes.",
      href: "/admin/inquiries",
      badge: stats.inquiriesNewCount > 0 ? `${stats.inquiriesNewCount} new` : "Inbox",
      highlight: stats.inquiriesNewCount > 0,
    },
    {
      title: "Services",
      description:
        "Maintain service packages, inclusions, typical project typologies, and deliverables.",
      href: "/admin/services",
      badge: "Collection",
    },
    {
      title: "Process Steps",
      description: "Curate the studio design methodology and phased ritual steps.",
      href: "/admin/process",
      badge: "Collection",
    },
    {
      title: "Explorations",
      description: "Manage material studies, design research, and visual sketches.",
      href: "/admin/explorations",
      badge: "Collection",
    },
    {
      title: "Testimonials",
      description: "Client reviews and credibility endorsements featured on the home page.",
      href: "/admin/testimonials",
      badge: "Collection",
    },
    {
      title: "Media Library",
      description:
        "Upload, inspect, alt-tag, and archive imagery and video assets in Supabase Storage.",
      href: "/admin/media",
      badge: "Storage",
    },
  ];

  return (
    <div className="space-y-10">
      <header className="border-line rule-hairline pb-8">
        <p className="type-meta text-foreground-muted">Workspace</p>
        <h1 className="font-display desktop:text-7xl mt-4 text-5xl leading-none tracking-tight">
          Admin Dashboard
        </h1>
        <p className="type-spec text-foreground-muted mt-4 max-w-2xl">
          Direct CMS control over portfolio copy, page sections, media assets, and incoming
          inquiries.
        </p>
      </header>

      <div className="tablet:grid-cols-2 desktop:grid-cols-3 grid grid-cols-1 gap-6">
        {sections.map((sec) => (
          <Link
            key={sec.href}
            href={sec.href}
            className={`border-line bg-surface hover:border-ink flex flex-col justify-between border p-6 transition-colors duration-(--duration-quick) ${
              sec.highlight ? "border-ink ring-ink/20 ring-1" : ""
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="type-meta text-foreground-muted">{sec.badge}</span>
                <span className="type-meta text-xs">→</span>
              </div>
              <h2 className="font-display mt-3 text-2xl">{sec.title}</h2>
              <p className="type-spec text-foreground-muted mt-2 text-sm">{sec.description}</p>
            </div>
            <div className="border-line mt-6 border-t pt-4">
              <span className="type-meta text-xs font-medium hover:underline">
                Open {sec.title}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
