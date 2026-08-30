import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { requireAdmin } from "@/lib/auth/require-admin";
import { ProjectFacts } from "@/components/projects/ProjectFacts";
import { ProjectHero } from "@/components/projects/ProjectHero";
import { ProjectSectionRenderer } from "@/components/public/ProjectSectionRenderer";
import { getAdminProjectById, getAdminProjectSections } from "@/lib/data/projects";

export const dynamic = "force-dynamic";

interface AdminProjectPreviewProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Preview Project | Admin CMS",
    robots: { index: false, follow: false },
  };
}

export default async function AdminProjectPreviewPage({ params }: AdminProjectPreviewProps) {
  await requireAdmin();
  const { id } = await params;

  const [project, sections] = await Promise.all([
    getAdminProjectById(id),
    getAdminProjectSections(id),
  ]);

  if (!project) {
    notFound();
  }

  return (
    <div className="relative min-h-screen bg-stone-50 pb-24">
      {/* Admin Preview Banner */}
      <div className="sticky top-0 z-50 flex items-center justify-between border-b border-amber-300 bg-amber-50 px-6 py-2.5 text-xs text-amber-900 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="font-semibold tracking-wider text-amber-800 uppercase">
            Preview Mode
          </span>
          <span>&mdash;</span>
          <span>
            Viewing &ldquo;{project.title}&rdquo; (Status:{" "}
            <strong className="capitalize">{project.status}</strong>). Draft and hidden sections are
            shown.
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/admin/projects/${project.id}`}
            className="rounded bg-amber-200/80 px-2.5 py-1 font-medium text-amber-900 transition hover:bg-amber-300"
          >
            &larr; Back to Project Editor
          </Link>
        </div>
      </div>

      <main>
        <ProjectHero project={project} />
        <ProjectFacts project={project} />
        <ProjectSectionRenderer sections={sections} />
      </main>
    </div>
  );
}
