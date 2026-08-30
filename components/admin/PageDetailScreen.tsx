"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import {
  ConfirmDialog,
  FormField,
  MediaPicker,
  SaveBar,
  SortableList,
  StatusSelect,
  TextArea,
  TextInput,
} from "@/components/admin";
import type { MediaUploadAction } from "@/components/admin";
import type { ActionResult } from "@/components/admin/action-result";
import { SectionEditor } from "@/components/admin/SectionEditor";
import type {
  AdminMediaAsset,
  ContentStatus,
  Page,
  PageMetadataMutationInput,
  PageSection,
  PageSectionMutationInput,
} from "@/types/content";

const STATUS_OPTIONS: readonly { value: ContentStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

export interface PageDetailScreenProps {
  page: Page;
  initialSections: PageSection[];
  mediaAssets: AdminMediaAsset[];
  updatePageAction: (
    input: PageMetadataMutationInput & { id: string },
  ) => Promise<ActionResult<Page>>;
  createSectionAction: (input: PageSectionMutationInput) => Promise<ActionResult<PageSection>>;
  updateSectionAction: (
    input: PageSectionMutationInput & { id: string },
  ) => Promise<ActionResult<PageSection>>;
  toggleSectionAction: (id: string, isEnabled: boolean) => Promise<ActionResult<PageSection>>;
  deleteSectionAction: (id: string) => Promise<ActionResult<{ id: string }>>;
  reorderSectionsAction: (input: { pageId: string; sectionIds: string[] }) => Promise<ActionResult>;
  uploadAction?: MediaUploadAction;
}

export function PageDetailScreen({
  page: initialPage,
  initialSections,
  mediaAssets,
  updatePageAction,
  createSectionAction,
  updateSectionAction,
  toggleSectionAction,
  deleteSectionAction,
  reorderSectionsAction,
  uploadAction,
}: PageDetailScreenProps) {
  const [page, setPage] = useState<Page>(initialPage);
  const [sections, setSections] = useState<PageSection[]>(initialSections);
  const [dirty, setDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // Section editor modal state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<PageSection | null>(null);
  const [deletingSectionId, setDeletingSectionId] = useState<string | null>(null);

  function updatePageField<K extends keyof Page>(key: K, value: Page[K]) {
    setPage((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  }

  async function handleSavePage() {
    setIsSaving(true);
    setFieldErrors({});

    const payload: PageMetadataMutationInput & { id: string } = {
      id: page.id,
      slug: page.slug,
      title: page.title,
      navLabel: page.navLabel,
      seoTitle: page.seoTitle,
      seoDescription: page.seoDescription,
      ogMediaId: page.ogMediaId,
      status: page.status,
    };

    const result = await updatePageAction(payload);
    setIsSaving(false);

    if (result.ok) {
      if (result.data) setPage(result.data);
      setDirty(false);
      toast.success(result.message ?? "Page metadata saved.");
    } else {
      if (result.fieldErrors) setFieldErrors(result.fieldErrors);
      toast.error(result.formError ?? "Could not save page metadata.");
    }
  }

  function handleReset() {
    setPage(initialPage);
    setDirty(false);
    setFieldErrors({});
    toast.info("Changes discarded.");
  }

  function openCreateSection() {
    setEditingSection(null);
    setIsEditorOpen(true);
  }

  function openEditSection(sec: PageSection) {
    setEditingSection(sec);
    setIsEditorOpen(true);
  }

  async function handleSaveSection(input: PageSectionMutationInput & { id?: string }) {
    if (input.id) {
      const result = await updateSectionAction({ ...input, id: input.id });
      if (result.ok && result.data) {
        setSections((prev) => prev.map((s) => (s.id === result.data!.id ? result.data! : s)));
      }
      return result;
    } else {
      const result = await createSectionAction(input);
      if (result.ok && result.data) {
        setSections((prev) => [...prev, result.data!]);
      }
      return result;
    }
  }

  async function handleToggleSection(sec: PageSection) {
    const nextState = !sec.isEnabled;
    const result = await toggleSectionAction(sec.id, nextState);
    if (result.ok) {
      if (result.data) {
        setSections((prev) => prev.map((s) => (s.id === sec.id ? result.data! : s)));
      }
      toast.success(result.message ?? `Section ${nextState ? "enabled" : "disabled"}.`);
    } else {
      toast.error(result.formError ?? "Could not update section state.");
    }
  }

  async function confirmDeleteSection() {
    if (!deletingSectionId) return;
    const id = deletingSectionId;
    setDeletingSectionId(null);

    const result = await deleteSectionAction(id);
    if (result.ok) {
      setSections((prev) => prev.filter((s) => s.id !== id));
      toast.success("Page section removed.");
    } else {
      toast.error(result.formError ?? "Could not delete section.");
    }
  }

  async function handleReorderSections(reordered: PageSection[]) {
    setSections(reordered);
    const ids = reordered.map((s) => s.id);
    const result = await reorderSectionsAction({ pageId: page.id, sectionIds: ids });
    if (result.ok) {
      toast.success("Section display order saved.");
    } else {
      toast.error(result.formError ?? "Could not save section order.");
    }
  }

  const sortedSections = [...sections].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="space-y-12">
      <header className="border-line rule-hairline pb-8">
        <Link href="/admin/pages" className="type-meta text-foreground-muted hover:text-foreground">
          ← Back to pages
        </Link>
        <div className="desktop:flex-row desktop:items-end desktop:justify-between mt-6 flex flex-col gap-4">
          <div>
            <p className="type-meta text-foreground-muted">Page Editor</p>
            <h1 className="font-display desktop:text-7xl mt-2 text-5xl leading-none tracking-tight">
              {page.title}
            </h1>
            <p className="type-spec text-foreground-muted mt-2">
              Slug:{" "}
              <code className="font-mono text-xs">/{page.slug === "home" ? "" : page.slug}</code>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={page.slug === "home" ? "/" : `/${page.slug}`}
              target="_blank"
              className="border-line-strong type-meta hover:bg-surface inline-flex border px-4 py-2 text-xs transition-colors"
            >
              Preview Live Page ↗
            </Link>
          </div>
        </div>
      </header>

      {/* 1. Page Metadata Form */}
      <section
        aria-labelledby="page-meta-title"
        className="border-line bg-surface tablet:p-8 border p-6"
      >
        <p className="type-meta text-foreground-muted">Metadata & Search Settings</p>
        <h2 id="page-meta-title" className="font-display tablet:text-3xl mt-2 text-2xl">
          Page Configuration
        </h2>

        <div className="tablet:grid-cols-2 mt-6 grid grid-cols-1 gap-6">
          <FormField id="page-title" label="Page Title" errors={fieldErrors.title}>
            <TextInput
              id="page-title"
              value={page.title}
              onValueChange={(val) => updatePageField("title", val)}
              required
            />
          </FormField>

          <FormField id="page-slug" label="URL Slug" errors={fieldErrors.slug}>
            <TextInput
              id="page-slug"
              value={page.slug}
              onValueChange={(val) => updatePageField("slug", val)}
              required
            />
          </FormField>

          <FormField
            id="page-nav-label"
            label="Navigation Label (optional)"
            errors={fieldErrors.nav_label}
          >
            <TextInput
              id="page-nav-label"
              value={page.navLabel ?? ""}
              onValueChange={(val) => updatePageField("navLabel", val || null)}
              placeholder="Short title for menus"
            />
          </FormField>

          <FormField id="page-status" label="Publication Status">
            <StatusSelect
              value={page.status}
              options={STATUS_OPTIONS}
              onValueChange={(val) => updatePageField("status", val as ContentStatus)}
            />
          </FormField>

          <FormField id="page-seo-title" label="SEO Title Tag" errors={fieldErrors.seo_title}>
            <TextInput
              id="page-seo-title"
              value={page.seoTitle ?? ""}
              onValueChange={(val) => updatePageField("seoTitle", val || null)}
              placeholder="Defaults to site title if blank"
            />
          </FormField>

          <FormField
            id="page-seo-desc"
            label="SEO Meta Description"
            errors={fieldErrors.seo_description}
          >
            <TextArea
              id="page-seo-desc"
              value={page.seoDescription ?? ""}
              onValueChange={(val) => updatePageField("seoDescription", val || null)}
              rows={3}
              placeholder="Summary for search engines"
            />
          </FormField>

          <div className="tablet:col-span-2">
            <FormField id="page-og-media" label="Social Preview Image (OG Media)">
              <MediaPicker
                id="page-og-media"
                assets={mediaAssets}
                value={page.ogMediaId}
                onChange={(val) => updatePageField("ogMediaId", val)}
                uploadAction={uploadAction}
              />
            </FormField>
          </div>
        </div>

        <SaveBar
          hasChanges={dirty}
          isSaving={isSaving}
          onSave={handleSavePage}
          onCancel={handleReset}
        />
      </section>

      {/* 2. Page Sections List */}
      <section
        aria-labelledby="page-sections-title"
        className="border-line bg-surface tablet:p-8 border p-6"
      >
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <p className="type-meta text-foreground-muted">Content Blocks</p>
            <h2 id="page-sections-title" className="font-display tablet:text-3xl mt-1 text-2xl">
              Page Sections ({sections.length})
            </h2>
          </div>
          <button
            type="button"
            onClick={openCreateSection}
            className="border-line-strong type-meta hover:bg-ink hover:text-warm-white border px-4 py-2 text-xs transition-colors"
          >
            + Add section
          </button>
        </div>

        <div className="mt-6">
          {sortedSections.length === 0 ? (
            <div className="py-8 text-center">
              <p className="type-spec text-foreground-muted">No sections added to this page yet.</p>
              <button
                type="button"
                onClick={openCreateSection}
                className="border-line-strong type-meta hover:bg-surface mt-4 inline-flex border px-4 py-2 text-xs"
              >
                Create first section
              </button>
            </div>
          ) : (
            <SortableList
              items={sortedSections}
              getItemId={(sec) => sec.id}
              onReorder={handleReorderSections}
              renderItem={(sec, helpers) => (
                <div className="border-line bg-canvas flex w-full items-center justify-between gap-4 border p-4">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      ref={helpers.setActivatorNodeRef}
                      {...helpers.attributes}
                      {...helpers.listeners}
                      aria-label={`Move ${sec.sectionKey}`}
                      className="border-line-strong type-meta hover:bg-ink hover:text-warm-white inline-flex min-h-9 items-center justify-center border px-2.5 text-xs transition-colors"
                    >
                      ↕
                    </button>
                    <span className="font-mono text-sm font-semibold">{sec.sectionKey}</span>
                    <span className="border-line bg-surface type-meta text-foreground-muted border px-2 py-0.5 text-xs">
                      {sec.sectionType}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleToggleSection(sec)}
                      className={`type-meta border px-2 py-0.5 text-xs transition-colors ${
                        sec.isEnabled
                          ? "bg-surface-elevated text-foreground border-line"
                          : "bg-line text-foreground-muted opacity-60"
                      }`}
                    >
                      {sec.isEnabled ? "Enabled" : "Disabled"}
                    </button>

                    <span
                      className={`type-meta px-2 py-0.5 text-xs ${
                        sec.status === "published"
                          ? "bg-ink text-warm-white"
                          : "bg-line text-foreground-muted"
                      }`}
                    >
                      {sec.status}
                    </span>

                    <button
                      type="button"
                      onClick={() => openEditSection(sec)}
                      className="border-line-strong type-meta hover:bg-surface border px-3 py-1 text-xs"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeletingSectionId(sec.id)}
                      className="text-critical type-meta text-xs hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            />
          )}
        </div>
      </section>

      {/* Section Editor Modal */}
      <SectionEditor
        pageId={page.id}
        section={editingSection}
        mediaAssets={mediaAssets}
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingSection(null);
        }}
        onSave={handleSaveSection}
        uploadAction={uploadAction}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={Boolean(deletingSectionId)}
        title="Delete Page Section"
        description="Are you sure you want to permanently delete this page section? This action cannot be undone."
        confirmLabel="Delete section"
        destructive
        onConfirm={confirmDeleteSection}
        onCancel={() => setDeletingSectionId(null)}
      />
    </div>
  );
}
