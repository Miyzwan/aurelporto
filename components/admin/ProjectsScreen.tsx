"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import type { AdminProjectDetail, ContentStatus } from "@/types/content";
import { deleteProject, setProjectStatus } from "@/lib/actions/projects";
import { ConfirmDialog } from "./ConfirmDialog";

interface ProjectsScreenProps {
  initialProjects: readonly AdminProjectDetail[];
}

export function ProjectsScreen({ initialProjects }: ProjectsScreenProps) {
  const router = useRouter();

  const [projects, setProjects] = useState<readonly AdminProjectDetail[]>(initialProjects);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [projectStatusFilter, setProjectStatusFilter] = useState<string>("all");
  const [featuredFilter, setFeaturedFilter] = useState<string>("all");

  const [deleteTarget, setDeleteTarget] = useState<AdminProjectDetail | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      searchQuery === "" ||
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.projectType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || project.status === statusFilter;

    const matchesProjectStatus =
      projectStatusFilter === "all" || project.projectStatus === projectStatusFilter;

    const matchesFeatured =
      featuredFilter === "all" ||
      (featuredFilter === "featured" && project.featured) ||
      (featuredFilter === "standard" && !project.featured);

    return matchesSearch && matchesStatus && matchesProjectStatus && matchesFeatured;
  });

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const result = await deleteProject(deleteTarget.id);
      if (result.ok) {
        setProjects((prev) => prev.filter((p) => p.id !== deleteTarget.id));
        toast.success("Project deleted successfully.");
        setDeleteTarget(null);
        router.refresh();
      } else {
        toast.error(result.formError ?? "Could not delete project.");
      }
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusChange = async (project: AdminProjectDetail, newStatus: ContentStatus) => {
    try {
      const result = await setProjectStatus(project.id, newStatus);
      if (result.ok) {
        setProjects((prev) =>
          prev.map((p) => (p.id === project.id ? { ...p, status: newStatus } : p)),
        );
        toast.success(`Project ${newStatus}.`);
        router.refresh();
      } else {
        const errorMsg =
          result.fieldErrors?.heroMediaId?.[0] || result.formError || "Could not update status.";
        toast.error(errorMsg);
      }
    } catch {
      toast.error("An unexpected error occurred.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-light tracking-tight text-stone-900">
            Projects & Case Studies
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Manage portfolio projects, case study narratives, photography, and publication status.
          </p>
        </div>
        <div>
          <Link
            href="/admin/projects/new"
            className="inline-flex items-center rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800"
          >
            + Create Project
          </Link>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 gap-3 rounded-lg border border-stone-200 bg-white p-4 sm:grid-cols-4">
        <div>
          <label htmlFor="project-search" className="block text-xs font-medium text-stone-700">
            Search
          </label>
          <input
            id="project-search"
            type="text"
            placeholder="Search by title, location, or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mt-1 block w-full rounded-md border border-stone-300 px-3 py-1.5 text-sm text-stone-900 focus:border-stone-900 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="filter-status" className="block text-xs font-medium text-stone-700">
            Publication Status
          </label>
          <select
            id="filter-status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="mt-1 block w-full rounded-md border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-900 focus:border-stone-900 focus:outline-none"
          >
            <option value="all">All Content Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="filter-project-status"
            className="block text-xs font-medium text-stone-700"
          >
            Project Stage
          </label>
          <select
            id="filter-project-status"
            value={projectStatusFilter}
            onChange={(e) => setProjectStatusFilter(e.target.value)}
            className="mt-1 block w-full rounded-md border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-900 focus:border-stone-900 focus:outline-none"
          >
            <option value="all">All Stages</option>
            <option value="completed">Completed</option>
            <option value="ongoing">Ongoing</option>
            <option value="concept">Concept</option>
          </select>
        </div>

        <div>
          <label htmlFor="filter-featured" className="block text-xs font-medium text-stone-700">
            Featured
          </label>
          <select
            id="filter-featured"
            value={featuredFilter}
            onChange={(e) => setFeaturedFilter(e.target.value)}
            className="mt-1 block w-full rounded-md border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-900 focus:border-stone-900 focus:outline-none"
          >
            <option value="all">All Projects</option>
            <option value="featured">Featured On Home</option>
            <option value="standard">Standard</option>
          </select>
        </div>
      </div>

      {/* Projects Table */}
      <div className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-stone-200">
          <thead className="bg-stone-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-stone-500 uppercase">
                Project
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-stone-500 uppercase">
                Type & Location
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-stone-500 uppercase">
                Stage
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-stone-500 uppercase">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium tracking-wider text-stone-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200">
            {filteredProjects.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-sm text-stone-500">
                  No projects match your filter criteria.
                </td>
              </tr>
            ) : (
              filteredProjects.map((project) => (
                <tr key={project.id} className="hover:bg-stone-50/50">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/projects/${project.id}`}
                        className="font-medium text-stone-900 hover:underline"
                      >
                        {project.title}
                      </Link>
                      {project.featured && (
                        <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">
                          Featured #{project.featuredOrder}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-stone-500">
                      /{project.slug} &middot; {project.year}
                    </div>
                  </td>

                  <td className="px-4 py-3.5 text-sm text-stone-600">
                    <div>{project.projectType}</div>
                    <div className="text-xs text-stone-400">{project.location}</div>
                  </td>

                  <td className="px-4 py-3.5 text-xs text-stone-600">
                    <span className="capitalize">{project.projectStatus}</span>
                    {project.areaSqm ? ` (${project.areaSqm} sqm)` : ""}
                  </td>

                  <td className="px-4 py-3.5 text-xs">
                    <select
                      value={project.status}
                      onChange={(e) => handleStatusChange(project, e.target.value as ContentStatus)}
                      className={`rounded-full px-2.5 py-1 text-xs font-medium focus:outline-none ${
                        project.status === "published"
                          ? "bg-emerald-100 text-emerald-800"
                          : project.status === "draft"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-stone-100 text-stone-600"
                      }`}
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </td>

                  <td className="px-4 py-3.5 text-right text-sm">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/admin/preview/projects/${project.id}`}
                        className="text-xs font-medium text-stone-600 hover:text-stone-900 hover:underline"
                        target="_blank"
                      >
                        Preview ↗
                      </Link>
                      <Link
                        href={`/admin/projects/${project.id}`}
                        className="text-xs font-medium text-stone-900 hover:underline"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(project)}
                        className="text-xs font-medium text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Project?"
        description={
          deleteTarget
            ? `Are you sure you want to permanently delete "${deleteTarget.title}" and all of its sections? This action cannot be undone.`
            : ""
        }
        confirmLabel={isDeleting ? "Deleting..." : "Delete Project"}
        destructive
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
