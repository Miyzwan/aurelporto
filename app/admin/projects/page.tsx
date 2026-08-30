import { Metadata } from "next";

import { requireAdmin } from "@/lib/auth/require-admin";
import { getAdminProjects } from "@/lib/data/projects";
import { ProjectsScreen } from "@/components/admin/ProjectsScreen";

export const metadata: Metadata = {
  title: "Projects | Admin CMS",
  robots: { index: false, follow: false },
};

export default async function AdminProjectsPage() {
  await requireAdmin();
  const projects = await getAdminProjects();

  return <ProjectsScreen initialProjects={projects} />;
}
