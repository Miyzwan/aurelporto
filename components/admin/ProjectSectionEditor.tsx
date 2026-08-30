"use client";

import React, { useState } from "react";

import type { AdminMediaAsset } from "@/types/content";
import type {
  BeforeAfterPair,
  CreditItem,
  MaterialItem,
  PlanItemType,
  PlanSequenceItem,
  ProjectSection,
  ProjectSectionContent,
  ProjectSectionType,
} from "@/types/project-sections";
import { PLAN_ITEM_TYPES, PROJECT_SECTION_TYPES } from "@/types/project-sections";
import { PROJECT_SECTION_LABEL } from "@/lib/content/project-section-registry";
import { slugify } from "@/lib/utils/slugify";
import { FormField } from "./FormField";
import { MediaPicker } from "./MediaPicker";
import { TextArea } from "./TextArea";
import { TextInput } from "./TextInput";

interface ProjectSectionEditorProps {
  open: boolean;
  section: ProjectSection | null;
  assets?: readonly AdminMediaAsset[];
  onSave: (payload: {
    sectionKey: string;
    sectionType: ProjectSectionType;
    title: string | null;
    content: ProjectSectionContent;
    isEnabled: boolean;
  }) => Promise<void>;
  onClose: () => void;
  fieldErrors?: Record<string, string[]>;
}

export function createDefaultProjectSectionContent(
  type: ProjectSectionType,
): ProjectSectionContent {
  switch (type) {
    case "plan_sequence":
      return { intro: "", items: [] };
    case "material_palette":
      return { intro: "", items: [] };
    case "before_after":
      return { intro: "", pairs: [] };
    case "gallery":
      return { intro: "", mediaIds: [] };
    case "credits":
      return { items: [] };
    case "overview":
    case "brief":
    case "existing_condition":
    case "challenge":
    case "concept":
    case "lighting_strategy":
    case "custom_furniture":
    case "visualization":
    case "implementation":
    case "outcome":
    case "rich_text":
    default:
      return { body: "", mediaIds: [] };
  }
}

export function ProjectSectionEditor({
  open,
  section,
  assets = [],
  onSave,
  onClose,
  fieldErrors = {},
}: ProjectSectionEditorProps) {
  if (!open) return null;

  return (
    <ProjectSectionEditorDialog
      key={section?.id ?? "new"}
      section={section}
      assets={assets}
      onSave={onSave}
      onClose={onClose}
      fieldErrors={fieldErrors}
    />
  );
}

function ProjectSectionEditorDialog({
  section,
  assets = [],
  onSave,
  onClose,
  fieldErrors = {},
}: Omit<ProjectSectionEditorProps, "open">) {
  const isEditing = Boolean(section);
  const initialType: ProjectSectionType =
    (section?.sectionType as ProjectSectionType) || "overview";

  const [sectionType, setSectionType] = useState<ProjectSectionType>(initialType);
  const [sectionKey, setSectionKey] = useState(section?.sectionKey ?? "");
  const [title, setTitle] = useState(section?.title ?? "");
  const [isEnabled, setIsEnabled] = useState(section?.isEnabled ?? true);
  const [content, setContent] = useState<ProjectSectionContent>(
    (section?.content as ProjectSectionContent) ?? createDefaultProjectSectionContent(initialType),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTypeChange = (nextType: ProjectSectionType) => {
    setSectionType(nextType);
    if (!sectionKey || sectionKey === slugify(sectionType)) {
      setSectionKey(slugify(nextType));
    }
    setContent(createDefaultProjectSectionContent(nextType));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave({
        sectionKey: sectionKey.trim() || slugify(sectionType),
        sectionType,
        title: title.trim() ? title.trim() : null,
        content,
        isEnabled,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderContentFields = () => {
    // 1. Narrative & Rich Text types
    if (
      sectionType === "overview" ||
      sectionType === "brief" ||
      sectionType === "existing_condition" ||
      sectionType === "challenge" ||
      sectionType === "concept" ||
      sectionType === "lighting_strategy" ||
      sectionType === "custom_furniture" ||
      sectionType === "visualization" ||
      sectionType === "implementation" ||
      sectionType === "outcome" ||
      sectionType === "rich_text"
    ) {
      const narrative = (content as { body?: string; mediaIds?: string[] }) ?? {};
      return (
        <div className="space-y-4">
          <FormField
            id="narrative-body"
            label="Section Narrative Body"
            description="The descriptive prose for this phase or facet of the project."
            errors={fieldErrors.body}
          >
            <TextArea
              id="narrative-body"
              value={narrative.body ?? ""}
              onValueChange={(val) =>
                setContent({ ...narrative, body: val, mediaIds: narrative.mediaIds ?? [] })
              }
              placeholder="Describe this project stage, concept, or architectural narrative..."
              rows={6}
            />
          </FormField>

          <FormField
            id="narrative-media"
            label="Supporting Media Asset"
            description="Optional photography, rendering, or technical drawing illustrating this section."
            errors={fieldErrors.mediaIds}
          >
            <MediaPicker
              id="narrative-media"
              value={narrative.mediaIds?.[0] ?? null}
              onChange={(id) =>
                setContent({
                  ...narrative,
                  body: narrative.body ?? "",
                  mediaIds: id ? [id] : [],
                })
              }
              assets={assets}
            />
          </FormField>
        </div>
      );
    }

    // 2. Plan Sequence
    if (sectionType === "plan_sequence") {
      const plan = (content as { intro?: string; items?: PlanSequenceItem[] }) ?? { items: [] };
      const items = plan.items ?? [];

      const updateItem = (index: number, patch: Partial<PlanSequenceItem>) => {
        const next: PlanSequenceItem[] = items.map((item, i) =>
          i === index ? { ...item, ...patch } : item,
        );
        setContent({ ...plan, intro: plan.intro ?? "", items: next });
      };

      const addItem = () => {
        setContent({
          ...plan,
          intro: plan.intro ?? "",
          items: [...items, { title: "Floor Plan", type: "layout", mediaId: "", caption: "" }],
        });
      };

      const removeItem = (index: number) => {
        setContent({
          ...plan,
          intro: plan.intro ?? "",
          items: items.filter((_, i) => i !== index),
        });
      };

      return (
        <div className="space-y-6">
          <FormField
            id="plan-intro"
            label="Introduction"
            description="Introductory summary of the spatial zoning and architectural layout."
            errors={fieldErrors.intro}
          >
            <TextArea
              id="plan-intro"
              value={plan.intro ?? ""}
              onValueChange={(val) => setContent({ ...plan, intro: val, items })}
              placeholder="Our spatial approach centered on unblocking natural light..."
              rows={3}
            />
          </FormField>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-stone-900">Plan Drawings & Diagrams</label>
              <button
                type="button"
                onClick={addItem}
                className="rounded border border-stone-300 bg-stone-50 px-3 py-1 text-xs font-medium text-stone-800 hover:bg-stone-100"
              >
                + Add Plan Drawing
              </button>
            </div>

            {items.length === 0 ? (
              <p className="rounded border border-dashed border-stone-200 p-4 text-center text-xs text-stone-500">
                No plan drawings added yet. Click &quot;+ Add Plan Drawing&quot; to add zoning or
                layout plans.
              </p>
            ) : (
              items.map((item, index) => (
                <div
                  key={index}
                  className="space-y-3 rounded-md border border-stone-200 bg-stone-50/50 p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-stone-700">
                      Drawing #{index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="text-xs text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor={`plan-title-${index}`}
                        className="text-xs font-medium text-stone-700"
                      >
                        Drawing Title
                      </label>
                      <TextInput
                        id={`plan-title-${index}`}
                        value={item.title}
                        onValueChange={(val) => updateItem(index, { title: val })}
                        placeholder="e.g. Ground Level Zoning"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor={`plan-type-${index}`}
                        className="text-xs font-medium text-stone-700"
                      >
                        Plan Type
                      </label>
                      <select
                        id={`plan-type-${index}`}
                        value={item.type}
                        onChange={(e) =>
                          updateItem(index, { type: e.target.value as PlanItemType })
                        }
                        className="mt-1 block w-full rounded border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 focus:border-stone-900 focus:outline-none"
                      >
                        {PLAN_ITEM_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-stone-700">
                      Drawing Media Asset
                    </label>
                    <MediaPicker
                      id={`plan-media-${index}`}
                      value={item.mediaId || null}
                      onChange={(val) => updateItem(index, { mediaId: val ?? "" })}
                      assets={assets}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`plan-caption-${index}`}
                      className="text-xs font-medium text-stone-700"
                    >
                      Caption / Note
                    </label>
                    <TextInput
                      id={`plan-caption-${index}`}
                      value={item.caption}
                      onValueChange={(val) => updateItem(index, { caption: val })}
                      placeholder="e.g. Scale 1:50 schematic zoning"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      );
    }

    // 3. Material Palette
    if (sectionType === "material_palette") {
      const palette = (content as { intro?: string; items?: MaterialItem[] }) ?? { items: [] };
      const items = palette.items ?? [];

      const updateItem = (index: number, patch: Partial<MaterialItem>) => {
        const next: MaterialItem[] = items.map((item, i) =>
          i === index ? { ...item, ...patch } : item,
        );
        setContent({ ...palette, intro: palette.intro ?? "", items: next });
      };

      const addItem = () => {
        setContent({
          ...palette,
          intro: palette.intro ?? "",
          items: [
            ...items,
            {
              name: "Honed Travertine",
              application: "Flooring",
              description: "Navona unfilled finish",
              mediaId: "",
            },
          ],
        });
      };

      const removeItem = (index: number) => {
        setContent({
          ...palette,
          intro: palette.intro ?? "",
          items: items.filter((_, i) => i !== index),
        });
      };

      return (
        <div className="space-y-6">
          <FormField
            id="palette-intro"
            label="Introduction"
            description="Overview of the tactile materials, finishes, and finishes curation."
            errors={fieldErrors.intro}
          >
            <TextArea
              id="palette-intro"
              value={palette.intro ?? ""}
              onValueChange={(val) => setContent({ ...palette, intro: val, items })}
              placeholder="Tactile balance between raw stone, warm walnut, and brushed brass..."
              rows={3}
            />
          </FormField>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-stone-900">Material Swatches</label>
              <button
                type="button"
                onClick={addItem}
                className="rounded border border-stone-300 bg-stone-50 px-3 py-1 text-xs font-medium text-stone-800 hover:bg-stone-100"
              >
                + Add Material
              </button>
            </div>

            {items.length === 0 ? (
              <p className="rounded border border-dashed border-stone-200 p-4 text-center text-xs text-stone-500">
                No materials added. Click &quot;+ Add Material&quot; to specify finishes and
                swatches.
              </p>
            ) : (
              items.map((item, index) => (
                <div
                  key={index}
                  className="space-y-3 rounded-md border border-stone-200 bg-stone-50/50 p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-stone-700">
                      Material #{index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="text-xs text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor={`material-name-${index}`}
                        className="text-xs font-medium text-stone-700"
                      >
                        Material Name
                      </label>
                      <TextInput
                        id={`material-name-${index}`}
                        value={item.name}
                        onValueChange={(val) => updateItem(index, { name: val })}
                        placeholder="e.g. Arabescato Corchia Marble"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor={`material-app-${index}`}
                        className="text-xs font-medium text-stone-700"
                      >
                        Application
                      </label>
                      <TextInput
                        id={`material-app-${index}`}
                        value={item.application}
                        onValueChange={(val) => updateItem(index, { application: val })}
                        placeholder="e.g. Kitchen Countertops & Island"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor={`material-desc-${index}`}
                      className="text-xs font-medium text-stone-700"
                    >
                      Description & Finish
                    </label>
                    <TextInput
                      id={`material-desc-${index}`}
                      value={item.description}
                      onValueChange={(val) => updateItem(index, { description: val })}
                      placeholder="e.g. Satin honed with organic grey veining"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-stone-700">
                      Swatch / Texture Asset
                    </label>
                    <MediaPicker
                      id={`material-media-${index}`}
                      value={item.mediaId || null}
                      onChange={(val) => updateItem(index, { mediaId: val ?? "" })}
                      assets={assets}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      );
    }

    // 4. Before & After Pairs
    if (sectionType === "before_after") {
      const beforeAfter = (content as { intro?: string; pairs?: BeforeAfterPair[] }) ?? {
        pairs: [],
      };
      const pairs = beforeAfter.pairs ?? [];

      const updatePair = (index: number, patch: Partial<BeforeAfterPair>) => {
        const next: BeforeAfterPair[] = pairs.map((pair, i) =>
          i === index ? { ...pair, ...patch } : pair,
        );
        setContent({ ...beforeAfter, intro: beforeAfter.intro ?? "", pairs: next });
      };

      const addPair = () => {
        setContent({
          ...beforeAfter,
          intro: beforeAfter.intro ?? "",
          pairs: [
            ...pairs,
            { label: "Living Room Transformation", beforeMediaId: "", afterMediaId: "" },
          ],
        });
      };

      const removePair = (index: number) => {
        setContent({
          ...beforeAfter,
          intro: beforeAfter.intro ?? "",
          pairs: pairs.filter((_, i) => i !== index),
        });
      };

      return (
        <div className="space-y-6">
          <FormField
            id="before-after-intro"
            label="Introduction"
            description="Overview of the structural transformation."
            errors={fieldErrors.intro}
          >
            <TextArea
              id="before-after-intro"
              value={beforeAfter.intro ?? ""}
              onValueChange={(val) => setContent({ ...beforeAfter, intro: val, pairs })}
              placeholder="Side-by-side comparison of the space prior to renovation and upon completion."
              rows={3}
            />
          </FormField>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-stone-900">
                Before & After Comparisons
              </label>
              <button
                type="button"
                onClick={addPair}
                className="rounded border border-stone-300 bg-stone-50 px-3 py-1 text-xs font-medium text-stone-800 hover:bg-stone-100"
              >
                + Add Comparison Pair
              </button>
            </div>

            {pairs.length === 0 ? (
              <p className="rounded border border-dashed border-stone-200 p-4 text-center text-xs text-stone-500">
                No comparison pairs added yet. Click &quot;+ Add Comparison Pair&quot; to configure.
              </p>
            ) : (
              pairs.map((pair, index) => (
                <div
                  key={index}
                  className="space-y-3 rounded-md border border-stone-200 bg-stone-50/50 p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-stone-700">
                      Comparison #{index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removePair(index)}
                      className="text-xs text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>

                  <div>
                    <label
                      htmlFor={`pair-label-${index}`}
                      className="text-xs font-medium text-stone-700"
                    >
                      Space / View Label
                    </label>
                    <TextInput
                      id={`pair-label-${index}`}
                      value={pair.label}
                      onValueChange={(val) => updatePair(index, { label: val })}
                      placeholder="e.g. Master Suite Bathroom"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-medium text-stone-700">Before Photo</label>
                      <MediaPicker
                        id={`pair-before-${index}`}
                        value={pair.beforeMediaId || null}
                        onChange={(val) => updatePair(index, { beforeMediaId: val ?? "" })}
                        assets={assets}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-stone-700">After Photo</label>
                      <MediaPicker
                        id={`pair-after-${index}`}
                        value={pair.afterMediaId || null}
                        onChange={(val) => updatePair(index, { afterMediaId: val ?? "" })}
                        assets={assets}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      );
    }

    // 5. Gallery
    if (sectionType === "gallery") {
      const gallery = (content as { intro?: string; mediaIds?: string[] }) ?? { mediaIds: [] };
      const mediaIds = gallery.mediaIds ?? [];

      return (
        <div className="space-y-4">
          <FormField
            id="gallery-intro"
            label="Gallery Introduction"
            description="Optional caption or introduction for this photo gallery."
            errors={fieldErrors.intro}
          >
            <TextArea
              id="gallery-intro"
              value={gallery.intro ?? ""}
              onValueChange={(val) => setContent({ ...gallery, intro: val, mediaIds })}
              placeholder="Curated editorial photography capturing daylight and craftsmanship..."
              rows={3}
            />
          </FormField>

          <FormField
            id="gallery-media"
            label="Curated Project Photos"
            description="Select photographs from your uploaded media library."
            errors={fieldErrors.mediaIds}
          >
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {assets.map((asset) => {
                  const isSelected = mediaIds.includes(asset.id);
                  return (
                    <button
                      key={asset.id}
                      type="button"
                      onClick={() => {
                        const next = isSelected
                          ? mediaIds.filter((id) => id !== asset.id)
                          : [...mediaIds, asset.id];
                        setContent({ ...gallery, intro: gallery.intro ?? "", mediaIds: next });
                      }}
                      className={`relative flex flex-col items-center justify-center rounded border p-2 text-left text-xs transition ${
                        isSelected
                          ? "border-stone-900 bg-stone-900 text-white"
                          : "border-stone-200 bg-white text-stone-800 hover:border-stone-400"
                      }`}
                    >
                      <div className="line-clamp-1 font-medium">{asset.altText || "Untitled"}</div>
                      <div className="text-[10px] opacity-75">{asset.mediaType}</div>
                      {isSelected && (
                        <span className="mt-1 rounded-full bg-white px-1.5 py-0.5 text-[9px] font-bold text-stone-900">
                          Selected
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-stone-500">
                Selected: {mediaIds.length} image{mediaIds.length === 1 ? "" : "s"}.
              </p>
            </div>
          </FormField>
        </div>
      );
    }

    // 6. Credits
    if (sectionType === "credits") {
      const credits = (content as { items?: CreditItem[] }) ?? { items: [] };
      const items = credits.items ?? [];

      const updateItem = (index: number, patch: Partial<CreditItem>) => {
        const next: CreditItem[] = items.map((item, i) =>
          i === index ? { ...item, ...patch } : item,
        );
        setContent({ items: next });
      };

      const addItem = () => {
        setContent({
          items: [
            ...items,
            { role: "Architect / Builder", name: "Studio Partner", url: "https://" },
          ],
        });
      };

      const removeItem = (index: number) => {
        setContent({ items: items.filter((_, i) => i !== index) });
      };

      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-stone-900">
              Project Credits & Collaborators
            </label>
            <button
              type="button"
              onClick={addItem}
              className="rounded border border-stone-300 bg-stone-50 px-3 py-1 text-xs font-medium text-stone-800 hover:bg-stone-100"
            >
              + Add Credit
            </button>
          </div>

          {items.length === 0 ? (
            <p className="rounded border border-dashed border-stone-200 p-4 text-center text-xs text-stone-500">
              No credits added yet. Click &quot;+ Add Credit&quot; to credit consultants, builders,
              or photographers.
            </p>
          ) : (
            items.map((item, index) => (
              <div
                key={index}
                className="space-y-3 rounded-md border border-stone-200 bg-stone-50/50 p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-stone-700">Credit #{index + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="text-xs text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div>
                    <label
                      htmlFor={`credit-role-${index}`}
                      className="text-xs font-medium text-stone-700"
                    >
                      Role
                    </label>
                    <TextInput
                      id={`credit-role-${index}`}
                      value={item.role}
                      onValueChange={(val) => updateItem(index, { role: val })}
                      placeholder="e.g. Lead Architect"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`credit-name-${index}`}
                      className="text-xs font-medium text-stone-700"
                    >
                      Individual or Studio Name
                    </label>
                    <TextInput
                      id={`credit-name-${index}`}
                      value={item.name}
                      onValueChange={(val) => updateItem(index, { name: val })}
                      placeholder="e.g. Atelier Studio"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`credit-url-${index}`}
                      className="text-xs font-medium text-stone-700"
                    >
                      Website URL
                    </label>
                    <TextInput
                      id={`credit-url-${index}`}
                      value={item.url}
                      onValueChange={(val) => updateItem(index, { url: val })}
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-section-editor-title"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm"
    >
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-stone-200 bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between border-b border-stone-200 pb-4">
          <h2 id="project-section-editor-title" className="text-lg font-semibold text-stone-900">
            {isEditing
              ? `Edit Section: ${PROJECT_SECTION_LABEL[sectionType]}`
              : "Add Project Section"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              id="section-type-select"
              label="Section Type"
              description="Allowed project section schema."
              errors={fieldErrors.sectionType}
            >
              <select
                id="section-type-select"
                disabled={isEditing}
                value={sectionType}
                onChange={(e) => handleTypeChange(e.target.value as ProjectSectionType)}
                className="block w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 focus:border-stone-900 focus:outline-none disabled:bg-stone-100"
              >
                {PROJECT_SECTION_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {PROJECT_SECTION_LABEL[type]} ({type})
                  </option>
                ))}
              </select>
            </FormField>

            <FormField
              id="section-key-input"
              label="Section Key (Slug)"
              description="Unique identifier on this project."
              errors={fieldErrors.sectionKey}
            >
              <TextInput
                id="section-key-input"
                value={sectionKey}
                onValueChange={setSectionKey}
                placeholder="e.g. spatial-concept"
              />
            </FormField>
          </div>

          <FormField
            id="section-title-input"
            label="Section Title (Optional Header)"
            description="Overrides the default section label on the public page."
            errors={fieldErrors.title}
          >
            <TextInput
              id="section-title-input"
              value={title}
              onValueChange={setTitle}
              placeholder={PROJECT_SECTION_LABEL[sectionType]}
            />
          </FormField>

          <div className="rounded-lg border border-stone-200 bg-stone-50/50 p-4">
            <h3 className="mb-4 text-xs font-semibold tracking-wider text-stone-500 uppercase">
              {PROJECT_SECTION_LABEL[sectionType]} Content
            </h3>
            {renderContentFields()}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="section-enabled"
              checked={isEnabled}
              onChange={(e) => setIsEnabled(e.target.checked)}
              className="h-4 w-4 rounded border-stone-300 text-stone-900 focus:ring-stone-900"
            />
            <label htmlFor="section-enabled" className="text-sm font-medium text-stone-700">
              Enable this section on the public case study
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-stone-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Add Section"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
