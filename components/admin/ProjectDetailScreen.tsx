"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import type {
  AdminMediaAsset,
  AdminProjectDetail,
  ContentStatus,
  ProjectMutationInput,
  ProjectStatus,
} from "@/types/content";
import type {
  ProjectSection,
  ProjectSectionContent,
  ProjectSectionType,
} from "@/types/project-sections";
import {
  createProject,
  createProjectSection,
  deleteProjectSection,
  reorderProjectSections,
  toggleProjectSection,
  updateProject,
  updateProjectSection,
} from "@/lib/actions/projects";
import { PROJECT_SECTION_LABEL } from "@/lib/content/project-section-registry";
import { slugify } from "@/lib/utils/slugify";
import { ArrayField } from "./ArrayField";
import { ConfirmDialog } from "./ConfirmDialog";
import { FormField } from "./FormField";
import { MediaPicker } from "./MediaPicker";
import { ProjectSectionEditor } from "./ProjectSectionEditor";
import { SaveBar } from "./SaveBar";
import { SortableList } from "./SortableList";
import { StatusSelect } from "./StatusSelect";
import { TextArea } from "./TextArea";
import { TextInput } from "./TextInput";

interface ProjectDetailScreenProps {
  project?: AdminProjectDetail | null;
  initialSections?: readonly ProjectSection[];
  assets?: readonly AdminMediaAsset[];
  isNew?: boolean;
}

export function ProjectDetailScreen({
  project,
  initialSections = [],
  assets = [],
  isNew = false,
}: ProjectDetailScreenProps) {
  const router = useRouter();

  // Form State
  const [title, setTitle] = useState(project?.title ?? "");
  const [slug, setSlug] = useState(project?.slug ?? "");
  const [year, setYear] = useState<number>(project?.year ?? new Date().getFullYear());
  const [location, setLocation] = useState(project?.location ?? "");
  const [projectType, setProjectType] = useState(project?.projectType ?? "");
  const [areaSqm, setAreaSqm] = useState<string>(project?.areaSqm ? String(project.areaSqm) : "");
  const [projectStatus, setProjectStatus] = useState<ProjectStatus>(
    project?.projectStatus ?? "concept",
  );
  const [clientType, setClientType] = useState(project?.clientType ?? "");
  const [designRole, setDesignRole] = useState<string[]>(project?.designRole ?? []);
  const [services, setServices] = useState<string[]>(project?.services ?? []);
  const [summary, setSummary] = useState(project?.summary ?? "");
  const [heroMediaId, setHeroMediaId] = useState<string | null>(project?.heroMediaId ?? null);
  const [featured, setFeatured] = useState(project?.featured ?? false);
  const [featuredOrder, setFeaturedOrder] = useState<number>(project?.featuredOrder ?? 0);
  const [sortOrder, setSortOrder] = useState<number>(project?.sortOrder ?? 0);
  const [seoTitle, setSeoTitle] = useState(project?.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(project?.seoDescription ?? "");
  const [ogMediaId, setOgMediaId] = useState<string | null>(project?.ogMediaId ?? null);
  const [status, setStatus] = useState<ContentStatus>(project?.status ?? "draft");

  // Sections State
  const [sections, setSections] = useState<readonly ProjectSection[]>(initialSections);
  const [isSectionEditorOpen, setIsSectionEditorOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<ProjectSection | null>(null);
  const [deleteSectionTarget, setDeleteSectionTarget] = useState<ProjectSection | null>(null);

  // Form Submission & Validation State
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const markDirty = () => setIsDirty(true);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    markDirty();
    if (isNew && (!slug || slug === slugify(title))) {
      setSlug(slugify(val));
    }
  };

  const handleSaveProject = async () => {
    setIsSaving(true);
    setFieldErrors({});

    const payload: ProjectMutationInput = {
      title: title.trim(),
      slug: slug.trim(),
      year: Number(year) || new Date().getFullYear(),
      location: location.trim(),
      projectType: projectType.trim(),
      areaSqm: areaSqm.trim() ? Number(areaSqm) : null,
      projectStatus,
      clientType: clientType.trim() || null,
      designRole,
      services,
      summary: summary.trim(),
      heroMediaId,
      featured,
      featuredOrder: Number(featuredOrder) || 0,
      sortOrder: Number(sortOrder) || 0,
      seoTitle: seoTitle.trim() || null,
      seoDescription: seoDescription.trim() || null,
      ogMediaId,
      status,
    };

    try {
      if (isNew) {
        const result = await createProject(payload);
        if (result.ok && result.data) {
          toast.success("Project created successfully.");
          router.push(`/admin/projects/${result.data.id}`);
        } else if (!result.ok) {
          setFieldErrors(result.fieldErrors ?? {});
          toast.error(result.formError ?? "Could not create project.");
        }
      } else if (project) {
        const result = await updateProject({ ...payload, id: project.id });
        if (result.ok) {
          toast.success("Project saved.");
          setIsDirty(false);
          router.refresh();
        } else if (!result.ok) {
          setFieldErrors(result.fieldErrors ?? {});
          toast.error(result.formError ?? "Could not update project.");
        }
      }
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  // Section Handlers
  const handleSaveSection = async (sectionPayload: {
    sectionKey: string;
    sectionType: ProjectSectionType;
    title: string | null;
    content: ProjectSectionContent;
    isEnabled: boolean;
  }) => {
    if (!project) return;

    if (editingSection) {
      const result = await updateProjectSection({
        id: editingSection.id,
        projectId: project.id,
        ...sectionPayload,
      });

      if (result.ok && result.data) {
        setSections((prev) => prev.map((s) => (s.id === editingSection.id ? result.data! : s)));
        toast.success("Section updated.");
        setIsSectionEditorOpen(false);
        setEditingSection(null);
        router.refresh();
      } else if (!result.ok) {
        toast.error(result.formError ?? "Could not update section.");
      }
    } else {
      const result = await createProjectSection({
        projectId: project.id,
        ...sectionPayload,
        sortOrder: sections.length,
      });

      if (result.ok && result.data) {
        setSections((prev) => [...prev, result.data!]);
        toast.success("Section added.");
        setIsSectionEditorOpen(false);
        router.refresh();
      } else if (!result.ok) {
        toast.error(result.formError ?? "Could not create section.");
      }
    }
  };

  const handleToggleSection = async (sec: ProjectSection, isEnabled: boolean) => {
    const result = await toggleProjectSection(sec.id, isEnabled);
    if (result.ok) {
      setSections((prev) => prev.map((s) => (s.id === sec.id ? { ...s, isEnabled } : s)));
      toast.success(isEnabled ? "Section enabled." : "Section disabled.");
      router.refresh();
    } else {
      toast.error("Could not toggle section visibility.");
    }
  };

  const handleDeleteSection = async () => {
    if (!deleteSectionTarget) return;
    const result = await deleteProjectSection(deleteSectionTarget.id);
    if (result.ok) {
      setSections((prev) => prev.filter((s) => s.id !== deleteSectionTarget.id));
      toast.success("Section deleted.");
      setDeleteSectionTarget(null);
      router.refresh();
    } else {
      toast.error("Could not delete section.");
    }
  };

  const handleReorderSections = async (reordered: ProjectSection[]) => {
    setSections(reordered);
    if (!project) return;
    const result = await reorderProjectSections({
      projectId: project.id,
      sectionIds: reordered.map((s) => s.id),
    });
    if (result.ok) {
      toast.success("Section order updated.");
      router.refresh();
    } else {
      toast.error("Could not reorder sections.");
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header */}
      <div className="flex flex-col gap-4 border-b border-stone-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/admin/projects"
            className="text-xs font-medium text-stone-500 hover:text-stone-900"
          >
            &larr; Back to Projects
          </Link>
          <h1 className="mt-2 font-serif text-2xl font-light text-stone-900">
            {isNew ? "Create New Project" : project?.title || "Edit Project"}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {!isNew && project && (
            <Link
              href={`/admin/preview/projects/${project.id}`}
              target="_blank"
              className="rounded-md border border-stone-300 bg-white px-3.5 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50"
            >
              Preview Case Study ↗
            </Link>
          )}
          <button
            type="button"
            onClick={handleSaveProject}
            disabled={isSaving}
            className="rounded-md bg-stone-900 px-4 py-2 text-xs font-medium text-white hover:bg-stone-800 disabled:opacity-50"
          >
            {isSaving ? "Saving..." : isNew ? "Create Project" : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Main Metadata Form */}
      <div className="space-y-6 rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-stone-900">Project Overview & Identity</h2>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField
            id="project-title"
            label="Project Title"
            description="The official public name of the interior project."
            errors={fieldErrors.title}
          >
            <TextInput
              id="project-title"
              value={title}
              onValueChange={handleTitleChange}
              placeholder="e.g. Kyoto Minimalist Residence"
            />
          </FormField>

          <FormField
            id="project-slug"
            label="URL Slug"
            description="Unique URL path: /projects/[slug]"
            errors={fieldErrors.slug}
          >
            <TextInput
              id="project-slug"
              value={slug}
              onValueChange={(val) => {
                setSlug(val);
                markDirty();
              }}
              placeholder="kyoto-minimalist-residence"
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
          <FormField
            id="project-year"
            label="Completion Year"
            description="Year completed or launched."
            errors={fieldErrors.year}
          >
            <TextInput
              id="project-year"
              type="number"
              value={String(year)}
              onValueChange={(val) => {
                setYear(Number(val));
                markDirty();
              }}
            />
          </FormField>

          <FormField
            id="project-location"
            label="Location"
            description="City, region, or country."
            errors={fieldErrors.location}
          >
            <TextInput
              id="project-location"
              value={location}
              onValueChange={(val) => {
                setLocation(val);
                markDirty();
              }}
              placeholder="e.g. Kyoto, Japan"
            />
          </FormField>

          <FormField
            id="project-type"
            label="Project Type"
            description="Residential, hospitality, etc."
            errors={fieldErrors.project_type || fieldErrors.projectType}
          >
            <TextInput
              id="project-type"
              value={projectType}
              onValueChange={(val) => {
                setProjectType(val);
                markDirty();
              }}
              placeholder="e.g. Private Residence"
            />
          </FormField>

          <FormField
            id="project-area"
            label="Area (sqm)"
            description="Total floor area."
            errors={fieldErrors.area_sqm || fieldErrors.areaSqm}
          >
            <TextInput
              id="project-area"
              type="number"
              value={areaSqm}
              onValueChange={(val) => {
                setAreaSqm(val);
                markDirty();
              }}
              placeholder="e.g. 240"
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <FormField
            id="project-stage"
            label="Project Stage"
            description="Current execution status."
            errors={fieldErrors.project_status || fieldErrors.projectStatus}
          >
            <select
              id="project-stage"
              value={projectStatus}
              onChange={(e) => {
                setProjectStatus(e.target.value as ProjectStatus);
                markDirty();
              }}
              className="block w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 focus:border-stone-900 focus:outline-none"
            >
              <option value="completed">Completed</option>
              <option value="ongoing">Ongoing</option>
              <option value="concept">Concept</option>
            </select>
          </FormField>

          <FormField
            id="client-type"
            label="Client Type"
            description="Optional private/commercial classification."
            errors={fieldErrors.client_type || fieldErrors.clientType}
          >
            <TextInput
              id="client-type"
              value={clientType}
              onValueChange={(val) => {
                setClientType(val);
                markDirty();
              }}
              placeholder="e.g. Private Client"
            />
          </FormField>

          <FormField
            id="content-status"
            label="Publication Status"
            description="Visibility on the public portfolio."
            errors={fieldErrors.status}
          >
            <StatusSelect
              id="content-status"
              value={status}
              onValueChange={(val) => {
                setStatus(val as ContentStatus);
                markDirty();
              }}
            />
          </FormField>
        </div>

        <FormField
          id="project-summary"
          label="Project Summary"
          description="High-level narrative introduction for card previews and hero intros."
          errors={fieldErrors.summary}
        >
          <TextArea
            id="project-summary"
            value={summary}
            onValueChange={(val) => {
              setSummary(val);
              markDirty();
            }}
            placeholder="A calm sanctuary embracing wabi-sabi principles with warm textures..."
            rows={4}
          />
        </FormField>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <ArrayField
            id="design-roles-field"
            label="Design Roles"
            description="Architectural or interior roles performed."
            value={designRole}
            onChange={(val) => {
              setDesignRole(val);
              markDirty();
            }}
          />

          <ArrayField
            id="services-field"
            label="Provided Services"
            description="Specific scope tags for project filtering."
            value={services}
            onChange={(val) => {
              setServices(val);
              markDirty();
            }}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField
            id="hero-media"
            label="Hero Imagery"
            description="Primary cover photograph used for index grids and hero banner."
            errors={fieldErrors.hero_media_id || fieldErrors.heroMediaId}
          >
            <MediaPicker
              id="hero-media"
              value={heroMediaId}
              onChange={(val) => {
                setHeroMediaId(val);
                markDirty();
              }}
              assets={assets}
            />
          </FormField>

          <FormField
            id="og-media"
            label="Social Share / OG Image"
            description="Custom 1200x630 share card image."
            errors={fieldErrors.og_media_id || fieldErrors.ogMediaId}
          >
            <MediaPicker
              id="og-media"
              value={ogMediaId}
              onChange={(val) => {
                setOgMediaId(val);
                markDirty();
              }}
              assets={assets}
            />
          </FormField>
        </div>

        {/* Featured On Home Settings */}
        <div className="rounded-md border border-stone-200 bg-stone-50/50 p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="featured-project"
                checked={featured}
                onChange={(e) => {
                  setFeatured(e.target.checked);
                  markDirty();
                }}
                className="h-4 w-4 rounded border-stone-300 text-stone-900 focus:ring-stone-900"
              />
              <div>
                <label htmlFor="featured-project" className="text-sm font-medium text-stone-900">
                  Feature this project on Homepage
                </label>
                <p className="text-xs text-stone-500">
                  Highlighted in the signature showcase on the home route.
                </p>
              </div>
            </div>

            {featured && (
              <div className="flex items-center gap-2">
                <label htmlFor="featured-order" className="text-xs font-medium text-stone-700">
                  Featured Rank:
                </label>
                <input
                  id="featured-order"
                  type="number"
                  value={featuredOrder}
                  onChange={(e) => {
                    setFeaturedOrder(Number(e.target.value));
                    markDirty();
                  }}
                  className="w-20 rounded border border-stone-300 px-2 py-1 text-sm text-stone-900 focus:outline-none"
                />
              </div>
            )}
          </div>
        </div>

        {/* SEO Overrides */}
        <div className="space-y-4 border-t border-stone-200 pt-6">
          <h3 className="text-sm font-semibold text-stone-900">Search Engine Optimization (SEO)</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              id="seo-title"
              label="Custom SEO Title"
              description="Overrides default page title tag."
              errors={fieldErrors.seo_title || fieldErrors.seoTitle}
            >
              <TextInput
                id="seo-title"
                value={seoTitle}
                onValueChange={(val) => {
                  setSeoTitle(val);
                  markDirty();
                }}
                placeholder={title ? `${title} | Interior Case Study` : ""}
              />
            </FormField>

            <FormField
              id="seo-desc"
              label="Meta Description"
              description="Overrides search engine summary (max 160 chars recommended)."
              errors={fieldErrors.seo_description || fieldErrors.seoDescription}
            >
              <TextInput
                id="seo-desc"
                value={seoDescription}
                onValueChange={(val) => {
                  setSeoDescription(val);
                  markDirty();
                }}
                placeholder="Editorial case study exploring spatial tranquility..."
              />
            </FormField>
          </div>
        </div>
      </div>

      {/* Sections Manager (only when existing project) */}
      {!isNew && project && (
        <div className="space-y-6 rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-stone-900">
                Case Study Section Sequence
              </h2>
              <p className="text-xs text-stone-500">
                Drag to reorder sections. Each section uses a strictly validated schema matching
                your design registry.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingSection(null);
                setIsSectionEditorOpen(true);
              }}
              className="inline-flex items-center rounded-md bg-stone-900 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-stone-800"
            >
              + Add Section
            </button>
          </div>

          {sections.length === 0 ? (
            <div className="rounded-lg border border-dashed border-stone-300 p-8 text-center">
              <p className="text-sm text-stone-500">
                No case study sections added yet. Add overview, spatial plans, material palettes, or
                galleries.
              </p>
              <button
                type="button"
                onClick={() => {
                  setEditingSection(null);
                  setIsSectionEditorOpen(true);
                }}
                className="mt-3 inline-flex items-center text-xs font-medium text-stone-900 underline hover:text-stone-700"
              >
                + Add First Section
              </button>
            </div>
          ) : (
            <SortableList
              items={sections}
              getItemId={(item) => item.id}
              onReorder={handleReorderSections}
              renderItem={(section, { attributes, listeners, setActivatorNodeRef }) => (
                <div className="flex items-center justify-between rounded-md border border-stone-200 bg-white p-3.5 shadow-sm transition hover:border-stone-300">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      ref={setActivatorNodeRef}
                      {...listeners}
                      {...attributes}
                      className="cursor-grab text-stone-400 hover:text-stone-700 focus:outline-none"
                      aria-label="Drag to reorder"
                    >
                      ⋮⋮
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-stone-900">
                          {section.title ||
                            PROJECT_SECTION_LABEL[section.sectionType as ProjectSectionType] ||
                            section.sectionType}
                        </span>
                        <span className="rounded bg-stone-100 px-1.5 py-0.5 text-[10px] font-medium text-stone-600">
                          {section.sectionType}
                        </span>
                        {!section.isEnabled && (
                          <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-700">
                            Disabled
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-stone-400">Key: {section.sectionKey}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleToggleSection(section, !section.isEnabled)}
                      className={`rounded px-2 py-1 text-xs font-medium ${
                        section.isEnabled
                          ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                      }`}
                    >
                      {section.isEnabled ? "Visible" : "Hidden"}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setEditingSection(section);
                        setIsSectionEditorOpen(true);
                      }}
                      className="text-xs font-medium text-stone-700 hover:text-stone-900 hover:underline"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteSectionTarget(section)}
                      className="text-xs font-medium text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            />
          )}
        </div>
      )}

      {/* Save Bar */}
      {!isNew && isDirty && (
        <SaveBar
          isDirty={isDirty}
          isSaving={isSaving}
          onSave={handleSaveProject}
          onCancel={() => {
            if (project) {
              setTitle(project.title);
              setSlug(project.slug);
              setYear(project.year);
              setLocation(project.location);
              setProjectType(project.projectType);
              setAreaSqm(project.areaSqm ? String(project.areaSqm) : "");
              setProjectStatus(project.projectStatus);
              setClientType(project.clientType ?? "");
              setDesignRole(project.designRole);
              setServices(project.services);
              setSummary(project.summary);
              setHeroMediaId(project.heroMediaId);
              setFeatured(project.featured);
              setFeaturedOrder(project.featuredOrder);
              setSortOrder(project.sortOrder);
              setSeoTitle(project.seoTitle ?? "");
              setSeoDescription(project.seoDescription ?? "");
              setOgMediaId(project.ogMediaId);
              setStatus(project.status);
              setIsDirty(false);
            }
          }}
        />
      )}

      {/* Project Section Modal Editor */}
      <ProjectSectionEditor
        open={isSectionEditorOpen}
        section={editingSection}
        assets={assets}
        onSave={handleSaveSection}
        onClose={() => {
          setIsSectionEditorOpen(false);
          setEditingSection(null);
        }}
      />

      {/* Delete Section Confirm Dialog */}
      <ConfirmDialog
        open={Boolean(deleteSectionTarget)}
        title="Delete Project Section?"
        description={
          deleteSectionTarget
            ? `Are you sure you want to remove the "${deleteSectionTarget.title || deleteSectionTarget.sectionKey}" section?`
            : ""
        }
        confirmLabel="Delete Section"
        destructive
        onConfirm={handleDeleteSection}
        onCancel={() => setDeleteSectionTarget(null)}
      />
    </div>
  );
}
