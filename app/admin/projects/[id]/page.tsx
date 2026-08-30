import { Metadata } from "next";
import { notFound } from "next/navigation";

import { requireAdmin } from "@/lib/auth/require-admin";
import { getAdminMediaPickerAssets } from "@/lib/data/media";
import { getAdminProjectById, getAdminProjectSections } from "@/lib/data/projects";
import { ProjectDetailScreen } from "@/components/admin/ProjectDetailScreen";

interface AdminProjectPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: AdminProjectPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Edit Project (${id.slice(0, 8)}) | Admin CMS`,
    robots: { index: false, follow: false },
  };
}

export default async function AdminProjectPage({ params }: AdminProjectPageProps) {
  await requireAdmin();
  const { id } = await params;

  const [project, sections, assets] = await Promise.all([
    getAdminProjectById(id),
    getAdminProjectSections(id),
    getAdminMediaPickerAssets(),
  ]);

  if (!project) {
    notFound();
  }

  return <ProjectDetailScreen project={project} initialSections={sections} assets={assets} />;
}
