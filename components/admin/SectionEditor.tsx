"use client";

import { useId, useState } from "react";
import type { FormEvent } from "react";
import { toast } from "sonner";

import {
  ArrayField,
  FormField,
  MediaPicker,
  StatusSelect,
  TextArea,
  TextInput,
} from "@/components/admin";
import type { MediaUploadAction } from "@/components/admin";
import type { ActionResult } from "@/components/admin/action-result";
import { SECTION_REGISTRY } from "@/lib/content/section-registry";
import type {
  AdminMediaAsset,
  ContentStatus,
  CredibilityContent,
  CtaContent,
  FeaturedProjectsContent,
  GalleryContent,
  HomeHeroContent,
  MaterialMomentContent,
  PageSection,
  PageSectionContent,
  PageSectionMutationInput,
  PageSectionType,
  PhilosophyContent,
  PositioningContent,
  ProcessPreviewContent,
  RichTextContent,
  ServicesPreviewContent,
} from "@/types/content";

const PAGE_SECTION_OPTIONS: readonly { value: PageSectionType; label: string }[] = [
  { value: "home_hero", label: "Home Hero" },
  { value: "positioning", label: "Positioning Statement" },
  { value: "featured_projects", label: "Featured Projects Grid" },
  { value: "philosophy", label: "Philosophy & Principles" },
  { value: "services_preview", label: "Services Preview" },
  { value: "process_preview", label: "Process Preview" },
  { value: "material_moment", label: "Material Moments" },
  { value: "credibility", label: "Credibility & Stats" },
  { value: "cta", label: "Call to Action" },
  { value: "rich_text", label: "Rich Text Block" },
  { value: "gallery", label: "Media Gallery" },
];

const CONTENT_STATUS_OPTIONS: readonly { value: ContentStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

export function createDefaultSectionContent(type: PageSectionType): PageSectionContent {
  switch (type) {
    case "home_hero":
      return {
        eyebrow: "",
        headline: "",
        subheadline: "",
        location: "",
        heroMediaId: null,
        signatureProjectId: null,
        primaryCtaLabel: "View selected work",
        primaryCtaHref: "/projects",
        secondaryCtaLabel: "Discuss a space",
        secondaryCtaHref: "/contact",
      };
    case "positioning":
      return { eyebrow: "", lines: [], body: "" };
    case "featured_projects":
      return { title: "Selected work", intro: "", maxItems: 4 };
    case "philosophy":
      return { title: "Philosophy", intro: "", items: [] };
    case "services_preview":
      return { title: "Services", intro: "", maxItems: 6 };
    case "process_preview":
      return { title: "Process", intro: "", maxItems: 6 };
    case "material_moment":
      return { title: "Material study", intro: "", mediaIds: [] };
    case "credibility":
      return { title: "Track record", stats: [], testimonialIds: [] };
    case "cta":
      return {
        eyebrow: "",
        title: "Have a space in mind?",
        body: "",
        ctaLabel: "Start a project",
        ctaHref: "/contact",
      };
    case "rich_text":
      return { title: "", body: "" };
    case "gallery":
      return { title: "", intro: "", mediaIds: [] };
  }
}

export interface SectionEditorProps {
  pageId: string;
  section?: PageSection | null;
  mediaAssets: AdminMediaAsset[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (input: PageSectionMutationInput & { id?: string }) => Promise<ActionResult<PageSection>>;
  uploadAction?: MediaUploadAction;
}

export function SectionEditor({
  pageId,
  section,
  mediaAssets,
  isOpen,
  onClose,
  onSave,
  uploadAction,
}: SectionEditorProps) {
  const isEditing = Boolean(section);
  const titleId = useId();

  const [sectionKey, setSectionKey] = useState(section?.sectionKey ?? "");
  const [sectionType, setSectionType] = useState<PageSectionType>(
    section?.sectionType ?? "rich_text",
  );
  const [status, setStatus] = useState<ContentStatus>(section?.status ?? "draft");
  const [isEnabled, setIsEnabled] = useState(section?.isEnabled ?? true);
  const [content, setContent] = useState<PageSectionContent>(
    section ? section.content : createDefaultSectionContent("rich_text"),
  );

  const [isSaving, setIsSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen) return null;

  function handleTypeChange(newType: PageSectionType) {
    setSectionType(newType);
    setContent(createDefaultSectionContent(newType));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSaving(true);
    setFieldErrors({});
    setFormError(null);

    const payload: PageSectionMutationInput & { id?: string } = {
      ...(section ? { id: section.id } : {}),
      pageId,
      sectionKey: sectionKey.trim(),
      sectionType,
      content,
      isEnabled,
      status,
    };

    const result = await onSave(payload);
    setIsSaving(false);

    if (result.ok) {
      toast.success(result.message ?? "Section saved.");
      onClose();
    } else {
      if (result.fieldErrors) setFieldErrors(result.fieldErrors);
      if (result.formError) setFormError(result.formError);
      toast.error(result.formError ?? "Could not save section.");
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="bg-ink/50 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xs"
    >
      <div className="border-line bg-canvas tablet:p-8 max-h-[90vh] w-full max-w-3xl overflow-y-auto border p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <p className="type-meta text-foreground-muted">Page Section Editor</p>
            <h2 id={titleId} className="font-display tablet:text-3xl mt-1 text-2xl">
              {isEditing ? `Edit ${section?.sectionKey}` : "Add New Section"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="text-foreground-muted hover:text-foreground type-meta p-2"
          >
            ✕
          </button>
        </div>

        {formError ? (
          <div
            role="alert"
            className="border-critical text-critical type-spec bg-surface mt-4 border p-3"
          >
            {formError}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Metadata Grid */}
          <div className="tablet:grid-cols-2 grid grid-cols-1 gap-6">
            <FormField
              id="section-key"
              label="Section Key"
              description="Unique slug for this section within the page (e.g. hero, intro, cta)"
              errors={fieldErrors.sectionKey}
            >
              <TextInput
                id="section-key"
                value={sectionKey}
                onValueChange={setSectionKey}
                required
                placeholder="e.g. hero"
              />
            </FormField>

            <FormField
              id="section-type"
              label="Section Type"
              description="Determines presentation layout and schema"
            >
              <select
                id="section-type"
                value={sectionType}
                disabled={isEditing}
                onChange={(e) => handleTypeChange(e.target.value as PageSectionType)}
                className="border-line focus:border-foreground w-full border bg-transparent p-3 text-base outline-none disabled:opacity-60"
              >
                {PAGE_SECTION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField id="section-status" label="Content Status">
              <StatusSelect
                value={status}
                options={CONTENT_STATUS_OPTIONS}
                onValueChange={(val) => setStatus(val as ContentStatus)}
              />
            </FormField>

            <div className="flex items-center gap-3 pt-6">
              <input
                id="section-enabled"
                type="checkbox"
                checked={isEnabled}
                onChange={(e) => setIsEnabled(e.target.checked)}
                className="border-line h-5 w-5 rounded"
              />
              <label htmlFor="section-enabled" className="type-meta cursor-pointer">
                Enable section on public site
              </label>
            </div>
          </div>

          <hr className="border-line my-6" />

          {/* Section Type Driven Forms */}
          <div className="space-y-6">
            <h3 className="type-meta text-foreground-muted tracking-wider uppercase">
              {SECTION_REGISTRY[sectionType]?.editorKey.replace(/-/g, " ")} Content
            </h3>

            {sectionType === "home_hero" && (
              <HomeHeroEditor
                content={content as HomeHeroContent}
                onChange={(c) => setContent(c)}
                mediaAssets={mediaAssets}
                uploadAction={uploadAction}
                fieldErrors={fieldErrors}
              />
            )}

            {sectionType === "positioning" && (
              <PositioningEditor
                content={content as PositioningContent}
                onChange={(c) => setContent(c)}
                fieldErrors={fieldErrors}
              />
            )}

            {sectionType === "featured_projects" && (
              <FeaturedProjectsEditor
                content={content as FeaturedProjectsContent}
                onChange={(c) => setContent(c)}
                fieldErrors={fieldErrors}
              />
            )}

            {sectionType === "philosophy" && (
              <PhilosophyEditor
                content={content as PhilosophyContent}
                onChange={(c) => setContent(c)}
                fieldErrors={fieldErrors}
              />
            )}

            {sectionType === "services_preview" && (
              <ServicesPreviewEditor
                content={content as ServicesPreviewContent}
                onChange={(c) => setContent(c)}
                fieldErrors={fieldErrors}
              />
            )}

            {sectionType === "process_preview" && (
              <ProcessPreviewEditor
                content={content as ProcessPreviewContent}
                onChange={(c) => setContent(c)}
                fieldErrors={fieldErrors}
              />
            )}

            {sectionType === "material_moment" && (
              <MaterialMomentEditor
                content={content as MaterialMomentContent}
                onChange={(c) => setContent(c)}
                mediaAssets={mediaAssets}
                uploadAction={uploadAction}
                fieldErrors={fieldErrors}
              />
            )}

            {sectionType === "credibility" && (
              <CredibilityEditor
                content={content as CredibilityContent}
                onChange={(c) => setContent(c)}
                fieldErrors={fieldErrors}
              />
            )}

            {sectionType === "cta" && (
              <CtaEditor
                content={content as CtaContent}
                onChange={(c) => setContent(c)}
                fieldErrors={fieldErrors}
              />
            )}

            {sectionType === "rich_text" && (
              <RichTextEditor
                content={content as RichTextContent}
                onChange={(c) => setContent(c)}
                fieldErrors={fieldErrors}
              />
            )}

            {sectionType === "gallery" && (
              <GalleryEditor
                content={content as GalleryContent}
                onChange={(c) => setContent(c)}
                mediaAssets={mediaAssets}
                uploadAction={uploadAction}
                fieldErrors={fieldErrors}
              />
            )}
          </div>

          <div className="flex justify-end gap-3 border-t pt-6">
            <button
              type="button"
              disabled={isSaving}
              onClick={onClose}
              className="border-line-strong type-meta hover:bg-surface inline-flex min-h-11 items-center border px-6 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              aria-busy={isSaving}
              className="bg-ink text-warm-white hover:bg-foreground-muted type-meta inline-flex min-h-11 items-center px-6 transition-colors"
            >
              {isSaving ? "Saving..." : isEditing ? "Save section" : "Create section"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------------
   Type-Specific Editors
-------------------------------------------------------------------------- */

function HomeHeroEditor({
  content,
  onChange,
  mediaAssets,
  uploadAction,
  fieldErrors,
}: {
  content: HomeHeroContent;
  onChange: (c: HomeHeroContent) => void;
  mediaAssets: AdminMediaAsset[];
  uploadAction?: MediaUploadAction;
  fieldErrors: Record<string, string[]>;
}) {
  return (
    <div className="space-y-4">
      <FormField id="hero-headline" label="Headline" errors={fieldErrors.headline}>
        <TextInput
          id="hero-headline"
          value={content.headline}
          onValueChange={(val) => onChange({ ...content, headline: val })}
          required
        />
      </FormField>

      <div className="tablet:grid-cols-2 grid grid-cols-1 gap-4">
        <FormField id="hero-eyebrow" label="Eyebrow" errors={fieldErrors.eyebrow}>
          <TextInput
            id="hero-eyebrow"
            value={content.eyebrow}
            onValueChange={(val) => onChange({ ...content, eyebrow: val })}
          />
        </FormField>
        <FormField id="hero-location" label="Location label" errors={fieldErrors.location}>
          <TextInput
            id="hero-location"
            value={content.location}
            onValueChange={(val) => onChange({ ...content, location: val })}
          />
        </FormField>
      </div>

      <FormField id="hero-subheadline" label="Subheadline / intro" errors={fieldErrors.subheadline}>
        <TextArea
          id="hero-subheadline"
          value={content.subheadline}
          onValueChange={(val) => onChange({ ...content, subheadline: val })}
          rows={3}
        />
      </FormField>

      <FormField id="hero-media" label="Hero Media Asset" errors={fieldErrors.heroMediaId}>
        <MediaPicker
          id="hero-media"
          assets={mediaAssets}
          value={content.heroMediaId}
          onChange={(val) => onChange({ ...content, heroMediaId: val })}
          uploadAction={uploadAction}
        />
      </FormField>

      <div className="tablet:grid-cols-2 grid grid-cols-1 gap-4">
        <FormField
          id="hero-p-cta-label"
          label="Primary CTA Label"
          errors={fieldErrors.primaryCtaLabel}
        >
          <TextInput
            id="hero-p-cta-label"
            value={content.primaryCtaLabel}
            onValueChange={(val) => onChange({ ...content, primaryCtaLabel: val })}
            required
          />
        </FormField>
        <FormField
          id="hero-p-cta-href"
          label="Primary CTA Href"
          errors={fieldErrors.primaryCtaHref}
        >
          <TextInput
            id="hero-p-cta-href"
            value={content.primaryCtaHref}
            onValueChange={(val) => onChange({ ...content, primaryCtaHref: val })}
            required
          />
        </FormField>
      </div>

      <div className="tablet:grid-cols-2 grid grid-cols-1 gap-4">
        <FormField
          id="hero-s-cta-label"
          label="Secondary CTA Label"
          errors={fieldErrors.secondaryCtaLabel}
        >
          <TextInput
            id="hero-s-cta-label"
            value={content.secondaryCtaLabel}
            onValueChange={(val) => onChange({ ...content, secondaryCtaLabel: val })}
            required
          />
        </FormField>
        <FormField
          id="hero-s-cta-href"
          label="Secondary CTA Href"
          errors={fieldErrors.secondaryCtaHref}
        >
          <TextInput
            id="hero-s-cta-href"
            value={content.secondaryCtaHref}
            onValueChange={(val) => onChange({ ...content, secondaryCtaHref: val })}
            required
          />
        </FormField>
      </div>
    </div>
  );
}

function PositioningEditor({
  content,
  onChange,
  fieldErrors,
}: {
  content: PositioningContent;
  onChange: (c: PositioningContent) => void;
  fieldErrors: Record<string, string[]>;
}) {
  return (
    <div className="space-y-4">
      <FormField id="pos-eyebrow" label="Eyebrow" errors={fieldErrors.eyebrow}>
        <TextInput
          id="pos-eyebrow"
          value={content.eyebrow}
          onValueChange={(val) => onChange({ ...content, eyebrow: val })}
        />
      </FormField>

      <FormField id="pos-lines" label="Positioning Editorial Lines" errors={fieldErrors.lines}>
        <ArrayField
          id="pos-lines"
          label="Editorial lines"
          value={content.lines}
          onChange={(lines) => onChange({ ...content, lines })}
          placeholder="e.g. Space that breathes."
        />
      </FormField>

      <FormField id="pos-body" label="Body narrative" errors={fieldErrors.body}>
        <TextArea
          id="pos-body"
          value={content.body}
          onValueChange={(val) => onChange({ ...content, body: val })}
          rows={4}
        />
      </FormField>
    </div>
  );
}

function FeaturedProjectsEditor({
  content,
  onChange,
  fieldErrors,
}: {
  content: FeaturedProjectsContent;
  onChange: (c: FeaturedProjectsContent) => void;
  fieldErrors: Record<string, string[]>;
}) {
  return (
    <div className="space-y-4">
      <FormField id="fp-title" label="Section Title" errors={fieldErrors.title}>
        <TextInput
          id="fp-title"
          value={content.title}
          onValueChange={(val) => onChange({ ...content, title: val })}
          required
        />
      </FormField>
      <FormField id="fp-intro" label="Intro text" errors={fieldErrors.intro}>
        <TextArea
          id="fp-intro"
          value={content.intro}
          onValueChange={(val) => onChange({ ...content, intro: val })}
          rows={2}
        />
      </FormField>
      <FormField id="fp-max" label="Max projects to display" errors={fieldErrors.maxItems}>
        <TextInput
          id="fp-max"
          type="number"
          value={String(content.maxItems)}
          onValueChange={(val) => onChange({ ...content, maxItems: Number(val) || 4 })}
        />
      </FormField>
    </div>
  );
}

function PhilosophyEditor({
  content,
  onChange,
  fieldErrors,
}: {
  content: PhilosophyContent;
  onChange: (c: PhilosophyContent) => void;
  fieldErrors: Record<string, string[]>;
}) {
  function addItem() {
    onChange({
      ...content,
      items: [...content.items, { title: "", body: "" }],
    });
  }

  function updateItem(index: number, key: "title" | "body", value: string) {
    const next = [...content.items];
    const target = next[index];
    if (target) {
      next[index] = { ...target, [key]: value };
      onChange({ ...content, items: next });
    }
  }

  function removeItem(index: number) {
    onChange({
      ...content,
      items: content.items.filter((_, i) => i !== index),
    });
  }

  return (
    <div className="space-y-4">
      <FormField id="phil-title" label="Section Title" errors={fieldErrors.title}>
        <TextInput
          id="phil-title"
          value={content.title}
          onValueChange={(val) => onChange({ ...content, title: val })}
          required
        />
      </FormField>
      <FormField id="phil-intro" label="Intro text" errors={fieldErrors.intro}>
        <TextArea
          id="phil-intro"
          value={content.intro}
          onValueChange={(val) => onChange({ ...content, intro: val })}
          rows={2}
        />
      </FormField>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="type-meta text-foreground-muted">Philosophy Principles</label>
          <button
            type="button"
            onClick={addItem}
            className="border-line-strong type-meta hover:bg-surface border px-3 py-1 text-xs"
          >
            + Add principle
          </button>
        </div>

        {content.items.map((item, idx) => (
          <div key={idx} className="border-line bg-surface flex flex-col gap-3 border p-4">
            <div className="flex items-center justify-between">
              <span className="type-meta text-foreground-muted">Principle {idx + 1}</span>
              <button
                type="button"
                onClick={() => removeItem(idx)}
                className="text-critical type-meta text-xs hover:underline"
              >
                Remove
              </button>
            </div>
            <TextInput
              placeholder="Principle Title"
              value={item.title}
              onValueChange={(val) => updateItem(idx, "title", val)}
              required
            />
            <TextArea
              placeholder="Principle description / rationale"
              value={item.body}
              onValueChange={(val) => updateItem(idx, "body", val)}
              rows={2}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function ServicesPreviewEditor({
  content,
  onChange,
  fieldErrors,
}: {
  content: ServicesPreviewContent;
  onChange: (c: ServicesPreviewContent) => void;
  fieldErrors: Record<string, string[]>;
}) {
  return (
    <div className="space-y-4">
      <FormField id="sp-title" label="Section Title" errors={fieldErrors.title}>
        <TextInput
          id="sp-title"
          value={content.title}
          onValueChange={(val) => onChange({ ...content, title: val })}
          required
        />
      </FormField>
      <FormField id="sp-intro" label="Intro text" errors={fieldErrors.intro}>
        <TextArea
          id="sp-intro"
          value={content.intro}
          onValueChange={(val) => onChange({ ...content, intro: val })}
          rows={2}
        />
      </FormField>
      <FormField id="sp-max" label="Max services to display" errors={fieldErrors.maxItems}>
        <TextInput
          id="sp-max"
          type="number"
          value={String(content.maxItems)}
          onValueChange={(val) => onChange({ ...content, maxItems: Number(val) || 6 })}
        />
      </FormField>
    </div>
  );
}

function ProcessPreviewEditor({
  content,
  onChange,
  fieldErrors,
}: {
  content: ProcessPreviewContent;
  onChange: (c: ProcessPreviewContent) => void;
  fieldErrors: Record<string, string[]>;
}) {
  return (
    <div className="space-y-4">
      <FormField id="pp-title" label="Section Title" errors={fieldErrors.title}>
        <TextInput
          id="pp-title"
          value={content.title}
          onValueChange={(val) => onChange({ ...content, title: val })}
          required
        />
      </FormField>
      <FormField id="pp-intro" label="Intro text" errors={fieldErrors.intro}>
        <TextArea
          id="pp-intro"
          value={content.intro}
          onValueChange={(val) => onChange({ ...content, intro: val })}
          rows={2}
        />
      </FormField>
      <FormField id="pp-max" label="Max process steps to display" errors={fieldErrors.maxItems}>
        <TextInput
          id="pp-max"
          type="number"
          value={String(content.maxItems)}
          onValueChange={(val) => onChange({ ...content, maxItems: Number(val) || 6 })}
        />
      </FormField>
    </div>
  );
}

function MaterialMomentEditor({
  content,
  onChange,
  mediaAssets,
  uploadAction: _uploadAction,
  fieldErrors,
}: {
  content: MaterialMomentContent;
  onChange: (c: MaterialMomentContent) => void;
  mediaAssets: AdminMediaAsset[];
  uploadAction?: MediaUploadAction;
  fieldErrors: Record<string, string[]>;
}) {
  return (
    <div className="space-y-4">
      <FormField id="mm-title" label="Section Title" errors={fieldErrors.title}>
        <TextInput
          id="mm-title"
          value={content.title}
          onValueChange={(val) => onChange({ ...content, title: val })}
          required
        />
      </FormField>
      <FormField id="mm-intro" label="Intro text" errors={fieldErrors.intro}>
        <TextArea
          id="mm-intro"
          value={content.intro}
          onValueChange={(val) => onChange({ ...content, intro: val })}
          rows={2}
        />
      </FormField>
      <div className="space-y-2">
        <label className="type-meta text-foreground-muted">Selected Media Assets</label>
        <div className="tablet:grid-cols-4 grid grid-cols-2 gap-3">
          {mediaAssets.map((asset) => {
            const isSelected = content.mediaIds.includes(asset.id);
            return (
              <button
                key={asset.id}
                type="button"
                onClick={() => {
                  const next = isSelected
                    ? content.mediaIds.filter((id) => id !== asset.id)
                    : [...content.mediaIds, asset.id];
                  onChange({ ...content, mediaIds: next });
                }}
                className={`border p-2 text-left text-xs transition-colors ${
                  isSelected ? "border-ink bg-surface font-medium" : "border-line opacity-60"
                }`}
              >
                <div className="truncate font-mono">{asset.altText || asset.storagePath}</div>
                <div className="type-meta text-foreground-muted mt-1">
                  {isSelected ? "✓ Selected" : "+ Click to select"}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CredibilityEditor({
  content,
  onChange,
  fieldErrors,
}: {
  content: CredibilityContent;
  onChange: (c: CredibilityContent) => void;
  fieldErrors: Record<string, string[]>;
}) {
  function addStat() {
    onChange({
      ...content,
      stats: [...content.stats, { value: "", label: "" }],
    });
  }

  function updateStat(index: number, key: "value" | "label", val: string) {
    const next = [...content.stats];
    const item = next[index];
    if (item) {
      next[index] = { ...item, [key]: val };
      onChange({ ...content, stats: next });
    }
  }

  function removeStat(index: number) {
    onChange({
      ...content,
      stats: content.stats.filter((_, i) => i !== index),
    });
  }

  return (
    <div className="space-y-4">
      <FormField id="cred-title" label="Section Title" errors={fieldErrors.title}>
        <TextInput
          id="cred-title"
          value={content.title}
          onValueChange={(val) => onChange({ ...content, title: val })}
          required
        />
      </FormField>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="type-meta text-foreground-muted">Stats & Indicators</label>
          <button
            type="button"
            onClick={addStat}
            className="border-line-strong type-meta hover:bg-surface border px-3 py-1 text-xs"
          >
            + Add stat
          </button>
        </div>

        {content.stats.map((stat, idx) => (
          <div key={idx} className="border-line bg-surface flex items-center gap-3 border p-3">
            <TextInput
              placeholder="Value (e.g. 100%)"
              value={stat.value}
              onValueChange={(val) => updateStat(idx, "value", val)}
              required
            />
            <TextInput
              placeholder="Label (e.g. Concept completion)"
              value={stat.label}
              onValueChange={(val) => updateStat(idx, "label", val)}
              required
            />
            <button
              type="button"
              onClick={() => removeStat(idx)}
              className="text-critical type-meta text-xs hover:underline"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function CtaEditor({
  content,
  onChange,
  fieldErrors,
}: {
  content: CtaContent;
  onChange: (c: CtaContent) => void;
  fieldErrors: Record<string, string[]>;
}) {
  return (
    <div className="space-y-4">
      <FormField id="cta-title" label="Title" errors={fieldErrors.title}>
        <TextInput
          id="cta-title"
          value={content.title}
          onValueChange={(val) => onChange({ ...content, title: val })}
          required
        />
      </FormField>
      <FormField id="cta-eyebrow" label="Eyebrow" errors={fieldErrors.eyebrow}>
        <TextInput
          id="cta-eyebrow"
          value={content.eyebrow}
          onValueChange={(val) => onChange({ ...content, eyebrow: val })}
        />
      </FormField>
      <FormField id="cta-body" label="Body text" errors={fieldErrors.body}>
        <TextArea
          id="cta-body"
          value={content.body}
          onValueChange={(val) => onChange({ ...content, body: val })}
          rows={3}
        />
      </FormField>
      <div className="tablet:grid-cols-2 grid grid-cols-1 gap-4">
        <FormField id="cta-label" label="Button Label" errors={fieldErrors.ctaLabel}>
          <TextInput
            id="cta-label"
            value={content.ctaLabel}
            onValueChange={(val) => onChange({ ...content, ctaLabel: val })}
            required
          />
        </FormField>
        <FormField id="cta-href" label="Button Href" errors={fieldErrors.ctaHref}>
          <TextInput
            id="cta-href"
            value={content.ctaHref}
            onValueChange={(val) => onChange({ ...content, ctaHref: val })}
            required
          />
        </FormField>
      </div>
    </div>
  );
}

function RichTextEditor({
  content,
  onChange,
  fieldErrors,
}: {
  content: RichTextContent;
  onChange: (c: RichTextContent) => void;
  fieldErrors: Record<string, string[]>;
}) {
  return (
    <div className="space-y-4">
      <FormField id="rt-title" label="Title" errors={fieldErrors.title}>
        <TextInput
          id="rt-title"
          value={content.title}
          onValueChange={(val) => onChange({ ...content, title: val })}
        />
      </FormField>
      <FormField id="rt-body" label="Body text (Markdown supported)" errors={fieldErrors.body}>
        <TextArea
          id="rt-body"
          value={content.body}
          onValueChange={(val) => onChange({ ...content, body: val })}
          rows={6}
        />
      </FormField>
    </div>
  );
}

function GalleryEditor({
  content,
  onChange,
  mediaAssets,
  uploadAction: _uploadAction,
  fieldErrors,
}: {
  content: GalleryContent;
  onChange: (c: GalleryContent) => void;
  mediaAssets: AdminMediaAsset[];
  uploadAction?: MediaUploadAction;
  fieldErrors: Record<string, string[]>;
}) {
  return (
    <div className="space-y-4">
      <FormField id="gal-title" label="Title" errors={fieldErrors.title}>
        <TextInput
          id="gal-title"
          value={content.title}
          onValueChange={(val) => onChange({ ...content, title: val })}
        />
      </FormField>
      <FormField id="gal-intro" label="Intro text" errors={fieldErrors.intro}>
        <TextArea
          id="gal-intro"
          value={content.intro}
          onValueChange={(val) => onChange({ ...content, intro: val })}
          rows={2}
        />
      </FormField>
      <div className="space-y-2">
        <label className="type-meta text-foreground-muted">Gallery Media Selection</label>
        <div className="tablet:grid-cols-4 grid grid-cols-2 gap-3">
          {mediaAssets.map((asset) => {
            const isSelected = content.mediaIds.includes(asset.id);
            return (
              <button
                key={asset.id}
                type="button"
                onClick={() => {
                  const next = isSelected
                    ? content.mediaIds.filter((id) => id !== asset.id)
                    : [...content.mediaIds, asset.id];
                  onChange({ ...content, mediaIds: next });
                }}
                className={`border p-2 text-left text-xs transition-colors ${
                  isSelected ? "border-ink bg-surface font-medium" : "border-line opacity-60"
                }`}
              >
                <div className="truncate font-mono">{asset.altText || asset.storagePath}</div>
                <div className="type-meta text-foreground-muted mt-1">
                  {isSelected ? "✓ Selected" : "+ Click to select"}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
