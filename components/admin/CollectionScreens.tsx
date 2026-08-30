"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { toast } from "sonner";

import {
  ArrayField,
  ConfirmDialog,
  FormField,
  MediaPicker,
  MediaUploadModal,
  SaveBar,
  SortableList,
  StatusSelect,
  TextArea,
  TextInput,
} from "@/components/admin";
import type {
  MediaArchiveAction,
  MediaHardDeleteAction,
  MediaUploadAction,
} from "@/components/admin";
import type { ActionResult } from "@/components/admin/action-result";
import type {
  AdminExplorationSummary,
  AdminMediaAsset,
  AdminProcessStep,
  AdminServiceDetail,
  AdminTestimonial,
  ContentStatus,
  ExplorationMediaItem,
  ExplorationMediaSyncInput,
  ExplorationMutationInput,
  InquiryRecord,
  ProcessStepMutationInput,
  ServiceMutationInput,
  TestimonialMutationInput,
} from "@/types/content";

const contentStatusOptions = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
] as const satisfies readonly { value: ContentStatus; label: string }[];

const inquiryStatusOptions = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
  { value: "spam", label: "Spam" },
] as const;

type InquiryStatus = InquiryRecord["status"];

type ServiceCreateAction = (
  input: ServiceMutationInput,
) => Promise<ActionResult<AdminServiceDetail>>;
type ServiceUpdateAction = (
  input: ServiceMutationInput & { id: string },
) => Promise<ActionResult<AdminServiceDetail>>;
type ServiceDeleteAction = (input: string) => Promise<ActionResult<{ id: string }>>;
type ServiceReorderAction = (input: string[]) => Promise<ActionResult>;

type ProcessCreateAction = (
  input: ProcessStepMutationInput,
) => Promise<ActionResult<AdminProcessStep>>;
type ProcessUpdateAction = (
  input: ProcessStepMutationInput & { id: string },
) => Promise<ActionResult<AdminProcessStep>>;
type ProcessDeleteAction = (input: string) => Promise<ActionResult<{ id: string }>>;
type ProcessReorderAction = (input: string[]) => Promise<ActionResult>;

type ExplorationCreateAction = (
  input: ExplorationMutationInput,
) => Promise<ActionResult<AdminExplorationSummary>>;
type ExplorationUpdateAction = (
  input: ExplorationMutationInput & { id: string },
) => Promise<ActionResult<AdminExplorationSummary>>;
type ExplorationDeleteAction = (input: string) => Promise<ActionResult<{ id: string }>>;
type ExplorationReorderAction = (input: string[]) => Promise<ActionResult>;
type ExplorationMediaSyncAction = (
  input: ExplorationMediaSyncInput,
) => Promise<ActionResult<ExplorationMediaItem[]>>;

type TestimonialCreateAction = (
  input: TestimonialMutationInput,
) => Promise<ActionResult<AdminTestimonial>>;
type TestimonialUpdateAction = (
  input: TestimonialMutationInput & { id: string },
) => Promise<ActionResult<AdminTestimonial>>;
type TestimonialDeleteAction = (input: string) => Promise<ActionResult<{ id: string }>>;
type TestimonialReorderAction = (input: string[]) => Promise<ActionResult>;

function draftId(prefix: string) {
  return `${prefix}-${typeof crypto !== "undefined" ? crypto.randomUUID() : Date.now()}`;
}

function statusLabel(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatFileSize(bytes: number | null) {
  if (bytes === null) return "Size unknown";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function AdminCollectionHeader({
  eyebrow,
  title,
  description,
  actionLabel,
  onAction,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <header className="border-line rule-hairline desktop:flex-row desktop:items-end desktop:justify-between flex flex-col gap-6 pb-8">
      <div className="max-w-2xl">
        <p className="type-meta text-foreground-muted">Admin / {eyebrow}</p>
        <h1 className="font-display desktop:text-7xl mt-4 text-5xl leading-none tracking-tight">
          {title}
        </h1>
        <p className="type-spec text-foreground-muted mt-5 max-w-xl">{description}</p>
      </div>
      <button
        type="button"
        onClick={onAction}
        className="bg-ink text-warm-white hover:bg-foreground-muted type-meta inline-flex min-h-12 items-center justify-center px-5 transition-colors duration-(--duration-quick)"
      >
        {actionLabel}
      </button>
    </header>
  );
}

function DraftNotice() {
  return (
    <p className="type-meta text-foreground-subtle mt-5">
      Session draft · changes are ready for the collection action layer.
    </p>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className="type-meta border-line-strong inline-flex items-center border px-2 py-1 text-[0.68rem]">
      {statusLabel(status)}
    </span>
  );
}

function CollectionEmpty({ label }: { label: string }) {
  return (
    <div className="border-line border border-dashed px-6 py-12 text-center">
      <p className="font-display text-3xl">No {label} yet.</p>
      <p className="type-spec text-foreground-muted mt-3">
        Add the first record to start shaping this collection.
      </p>
    </div>
  );
}

interface SortableCollectionListProps<T extends { id: string }> {
  items: readonly T[];
  ariaLabel: string;
  emptyLabel: string;
  getTitle: (item: T) => string;
  getMeta: (item: T) => ReactNode;
  onReorder: (items: T[]) => void;
  onEdit: (item: T) => void;
  onDelete: (item: T) => void;
  renderExtra?: (item: T) => ReactNode;
}

function SortableCollectionList<T extends { id: string }>({
  items,
  ariaLabel,
  emptyLabel,
  getTitle,
  getMeta,
  onReorder,
  onEdit,
  onDelete,
  renderExtra,
}: SortableCollectionListProps<T>) {
  if (items.length === 0) return <CollectionEmpty label={emptyLabel} />;

  return (
    <SortableList
      items={items}
      getItemId={(item) => item.id}
      onReorder={onReorder}
      ariaLabel={ariaLabel}
      renderItem={(item, helpers) => (
        <div className="border-line bg-surface desktop:grid-cols-[auto_minmax(0,1fr)_auto] desktop:items-center grid gap-4 border p-4">
          <button
            type="button"
            ref={helpers.setActivatorNodeRef}
            {...helpers.attributes}
            {...helpers.listeners}
            aria-label={`Move ${getTitle(item)}`}
            className="border-line-strong type-meta hover:bg-ink hover:text-warm-white inline-flex min-h-11 items-center justify-center border px-3 text-center transition-colors duration-(--duration-quick)"
          >
            ↕ <span className="sr-only">Reorder</span>
          </button>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="font-display truncate text-2xl leading-tight">{getTitle(item)}</h3>
              {getMeta(item)}
            </div>
            {renderExtra?.(item)}
          </div>
          <div className="desktop:justify-end flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onEdit(item)}
              className="border-line-strong type-meta hover:bg-ink hover:text-warm-white inline-flex min-h-11 items-center border px-4 transition-colors duration-(--duration-quick)"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => onDelete(item)}
              className="border-critical text-critical type-meta hover:bg-critical hover:text-warm-white inline-flex min-h-11 items-center border px-4 transition-colors duration-(--duration-quick)"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    />
  );
}

interface ServiceDraft {
  id?: string;
  slug: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  idealClient: string;
  scope: string[];
  deliverables: string[];
  included: string[];
  excluded: string[];
  typicalProjectTypes: string[];
  mediaId: string | null;
  featured: boolean;
  status: ContentStatus;
}

function emptyServiceDraft(): ServiceDraft {
  return {
    slug: "",
    name: "",
    shortDescription: "",
    fullDescription: "",
    idealClient: "",
    scope: [""],
    deliverables: [""],
    included: [""],
    excluded: [""],
    typicalProjectTypes: [""],
    mediaId: null,
    featured: false,
    status: "draft",
  };
}

function serviceDraftFromItem(item: AdminServiceDetail): ServiceDraft {
  return {
    id: item.id,
    slug: item.slug,
    name: item.name,
    shortDescription: item.shortDescription,
    fullDescription: item.fullDescription ?? "",
    idealClient: item.idealClient ?? "",
    scope: item.scope.length > 0 ? item.scope : [""],
    deliverables: item.deliverables.length > 0 ? item.deliverables : [""],
    included: item.included.length > 0 ? item.included : [""],
    excluded: item.excluded.length > 0 ? item.excluded : [""],
    typicalProjectTypes: item.typicalProjectTypes.length > 0 ? item.typicalProjectTypes : [""],
    mediaId: item.media?.id ?? null,
    featured: item.featured,
    status: item.status,
  };
}

function resolveMediaAsset(mediaId: string | null, assets: readonly AdminMediaAsset[]) {
  return mediaId ? (assets.find((asset) => asset.id === mediaId) ?? null) : null;
}

function ServiceEditor({
  draft,
  mediaAssets,
  uploadAction,
  actionResult,
  isSaving,
  onChange,
  onSave,
  onCancel,
  isNew,
}: {
  draft: ServiceDraft;
  mediaAssets: readonly AdminMediaAsset[];
  uploadAction?: MediaUploadAction;
  actionResult?: ActionResult<AdminServiceDetail> | null;
  isSaving?: boolean;
  onChange: (patch: Partial<ServiceDraft>) => void;
  onSave: () => void;
  onCancel: () => void;
  isNew: boolean;
}) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSave();
  }

  return (
    <section
      className="border-line bg-surface tablet:p-8 mt-8 border p-5"
      aria-label="Service editor"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="type-meta text-foreground-muted">{isNew ? "New record" : "Edit record"}</p>
          <h2 className="font-display mt-2 text-4xl leading-tight">
            {draft.name || "Untitled service"}
          </h2>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="type-meta text-foreground-muted hover:text-foreground min-h-11 px-2 transition-colors duration-(--duration-quick)"
        >
          Close editor
        </button>
      </div>

      <form id="service-editor" onSubmit={submit} className="desktop:grid-cols-2 mt-8 grid gap-6">
        <FormField id="service-name" label="Name" required>
          <TextInput
            value={draft.name}
            onValueChange={(value) => onChange({ name: value })}
            placeholder="Interior direction"
          />
        </FormField>
        <FormField
          id="service-slug"
          label="Slug"
          required
          description="Lowercase words separated by hyphens."
        >
          <TextInput
            value={draft.slug}
            onValueChange={(value) => onChange({ slug: value })}
            placeholder="interior-direction"
          />
        </FormField>
        <FormField
          id="service-short-description"
          label="Short description"
          required
          className="desktop:col-span-2"
        >
          <TextArea
            rows={3}
            value={draft.shortDescription}
            onValueChange={(value) => onChange({ shortDescription: value })}
          />
        </FormField>
        <FormField id="service-full-description" label="Full description">
          <TextArea
            value={draft.fullDescription}
            onValueChange={(value) => onChange({ fullDescription: value })}
          />
        </FormField>
        <FormField id="service-ideal-client" label="Ideal client">
          <TextArea
            value={draft.idealClient}
            onValueChange={(value) => onChange({ idealClient: value })}
          />
        </FormField>
        <ArrayField
          id="service-scope"
          label="Scope"
          value={draft.scope}
          onChange={(value) => onChange({ scope: value })}
          placeholder="Spatial strategy"
          itemLabel={(index) => `Scope item ${index + 1}`}
        />
        <ArrayField
          id="service-deliverables"
          label="Deliverables"
          value={draft.deliverables}
          onChange={(value) => onChange({ deliverables: value })}
          placeholder="Concept package"
          itemLabel={(index) => `Deliverable ${index + 1}`}
        />
        <ArrayField
          id="service-included"
          label="Included"
          value={draft.included}
          onChange={(value) => onChange({ included: value })}
          placeholder="Site consultation"
          itemLabel={(index) => `Included item ${index + 1}`}
        />
        <ArrayField
          id="service-excluded"
          label="Excluded"
          value={draft.excluded}
          onChange={(value) => onChange({ excluded: value })}
          placeholder="Construction management"
          itemLabel={(index) => `Excluded item ${index + 1}`}
        />
        <ArrayField
          id="service-project-types"
          label="Typical project types"
          value={draft.typicalProjectTypes}
          onChange={(value) => onChange({ typicalProjectTypes: value })}
          placeholder="Residential renovation"
          itemLabel={(index) => `Project type ${index + 1}`}
        />
        <MediaPicker
          id="service-media"
          value={draft.mediaId}
          onChange={(mediaId) => onChange({ mediaId })}
          assets={mediaAssets}
          uploadAction={uploadAction}
          description="Choose an active asset or upload one directly from this editor."
          selectedLabel={draft.mediaId ? `Selected asset: ${draft.mediaId}` : undefined}
        />
        <div className="flex flex-col gap-5">
          <FormField id="service-status" label="Status">
            <StatusSelect
              value={draft.status}
              options={contentStatusOptions}
              onValueChange={(value) => onChange({ status: value as ContentStatus })}
            />
          </FormField>
          <label className="type-spec flex min-h-12 items-center gap-3">
            <input
              type="checkbox"
              checked={draft.featured}
              onChange={(event) => onChange({ featured: event.target.checked })}
              className="accent-ink size-5"
            />
            Feature this service in public previews
          </label>
        </div>
      </form>
      <SaveBar
        formId="service-editor"
        hasChanges
        actionResult={actionResult}
        isSaving={isSaving}
        onSave={onSave}
        onCancel={onCancel}
      />
    </section>
  );
}

export function ServicesCollectionScreen({
  initialItems,
  mediaAssets = [],
  uploadAction,
  createAction,
  updateAction,
  deleteAction,
  reorderAction,
}: {
  initialItems: readonly AdminServiceDetail[];
  mediaAssets?: readonly AdminMediaAsset[];
  uploadAction?: MediaUploadAction;
  createAction?: ServiceCreateAction;
  updateAction?: ServiceUpdateAction;
  deleteAction?: ServiceDeleteAction;
  reorderAction?: ServiceReorderAction;
}) {
  const [items, setItems] = useState(() => [...initialItems]);
  const [draft, setDraft] = useState<ServiceDraft | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminServiceDetail | null>(null);
  const [actionResult, setActionResult] = useState<ActionResult<AdminServiceDetail> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  function updateDraft(patch: Partial<ServiceDraft>) {
    setDraft((current) => (current ? { ...current, ...patch } : current));
  }

  async function saveDraft() {
    const currentDraft = draft;
    if (!currentDraft) return;

    const payload: ServiceMutationInput = {
      ...currentDraft,
      sortOrder: items.find((item) => item.id === currentDraft.id)?.sortOrder ?? items.length,
    };
    setActionResult(null);

    if ((currentDraft.id && updateAction) || (!currentDraft.id && createAction)) {
      setIsSaving(true);
      const result = currentDraft.id
        ? await updateAction?.({ ...payload, id: currentDraft.id })
        : await createAction?.(payload);
      setIsSaving(false);
      if (!result) return;
      setActionResult(result);
      if (!result.ok || !result.data) return;
      const saved = result.data;

      setItems((current) => {
        const next = current.some((item) => item.id === saved.id)
          ? current.map((item) => (item.id === saved.id ? saved : item))
          : [...current, saved];
        return next.map((item, index) => ({ ...item, sortOrder: index }));
      });
      setDraft(null);
      return;
    }

    const existing = items.find((item) => item.id === currentDraft.id);
    const id = currentDraft.id ?? draftId("service");
    const nextItem: AdminServiceDetail = {
      id,
      slug: currentDraft.slug,
      name: currentDraft.name,
      shortDescription: currentDraft.shortDescription,
      media: resolveMediaAsset(currentDraft.mediaId, mediaAssets) ?? existing?.media ?? null,
      sortOrder: existing?.sortOrder ?? items.length,
      fullDescription: currentDraft.fullDescription || null,
      idealClient: currentDraft.idealClient || null,
      scope: currentDraft.scope.filter(Boolean),
      deliverables: currentDraft.deliverables.filter(Boolean),
      included: currentDraft.included.filter(Boolean),
      excluded: currentDraft.excluded.filter(Boolean),
      typicalProjectTypes: currentDraft.typicalProjectTypes.filter(Boolean),
      featured: currentDraft.featured,
      status: currentDraft.status,
    };
    setItems((current) => {
      const next = existing
        ? current.map((item) => (item.id === id ? nextItem : item))
        : [...current, nextItem];
      return next.map((item, index) => ({ ...item, sortOrder: index }));
    });
    setDraft(null);
    toast.success(existing ? "Service draft updated." : "Service draft added.");
  }

  async function reorderItems(nextItems: AdminServiceDetail[]) {
    const previousItems = items;
    const orderedItems = nextItems.map((item, index) => ({ ...item, sortOrder: index }));
    setItems(orderedItems);
    if (!reorderAction) return;

    const result = await reorderAction(orderedItems.map((item) => item.id));
    if (!result.ok) {
      setItems(previousItems);
      toast.error(result.formError ?? "The service order could not be saved.");
      return;
    }
    toast.success(result.message ?? "Service order saved.");
  }

  async function deleteItem() {
    const target = deleteTarget;
    if (!target) return;

    if (deleteAction) {
      const result = await deleteAction(target.id);
      if (!result.ok) {
        toast.error(result.formError ?? "The service could not be deleted.");
        return;
      }
      toast.success(result.message ?? "Service deleted.");
    } else {
      toast.success("Service draft deleted.");
    }

    setItems((current) => current.filter((item) => item.id !== target.id));
    setDeleteTarget(null);
  }

  return (
    <>
      <AdminCollectionHeader
        eyebrow="Services"
        title="Services"
        description="Shape the offers, scope, and deliverables that make the studio easy to understand."
        actionLabel="Add service"
        onAction={() => setDraft(emptyServiceDraft())}
      />
      <DraftNotice />
      {draft ? (
        <ServiceEditor
          draft={draft}
          mediaAssets={mediaAssets}
          uploadAction={uploadAction}
          actionResult={actionResult}
          isSaving={isSaving}
          onChange={updateDraft}
          onSave={saveDraft}
          onCancel={() => {
            setActionResult(null);
            setDraft(null);
          }}
          isNew={!draft.id}
        />
      ) : null}
      <section className="mt-10" aria-labelledby="services-list-title">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="type-meta text-foreground-muted">Ordered collection</p>
            <h2 id="services-list-title" className="font-display mt-2 text-3xl">
              {items.length} {items.length === 1 ? "service" : "services"}
            </h2>
          </div>
          <p className="type-spec text-foreground-muted">
            Drag or use the keyboard handle to reorder.
          </p>
        </div>
        <SortableCollectionList
          items={items}
          ariaLabel="Services order"
          emptyLabel="services"
          getTitle={(item) => item.name}
          getMeta={(item) => (
            <>
              <StatusBadge status={item.status} />
              {item.featured ? (
                <span className="type-meta text-foreground-muted">Featured</span>
              ) : null}
            </>
          )}
          onReorder={reorderItems}
          onEdit={(item) => setDraft(serviceDraftFromItem(item))}
          onDelete={setDeleteTarget}
          renderExtra={(item) => (
            <p className="type-spec text-foreground-muted mt-2 truncate">/{item.slug}</p>
          )}
        />
      </section>
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={`Delete ${deleteTarget?.name ?? "service"}?`}
        description={
          deleteAction
            ? "This permanently removes the service record and its public references."
            : "This removes the draft record from the current editing session."
        }
        confirmLabel="Delete service"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={deleteItem}
      />
    </>
  );
}

interface ProcessDraft {
  id?: string;
  stepNo: number;
  title: string;
  description: string;
  mediaId: string | null;
  status: ContentStatus;
}

function emptyProcessDraft(): ProcessDraft {
  return { stepNo: 1, title: "", description: "", mediaId: null, status: "draft" };
}

function processDraftFromItem(item: AdminProcessStep): ProcessDraft {
  return {
    id: item.id,
    stepNo: item.stepNo,
    title: item.title,
    description: item.description,
    mediaId: item.media?.id ?? null,
    status: item.status,
  };
}

function ProcessEditor({
  draft,
  mediaAssets,
  uploadAction,
  actionResult,
  isSaving,
  onChange,
  onSave,
  onCancel,
  isNew,
}: {
  draft: ProcessDraft;
  mediaAssets: readonly AdminMediaAsset[];
  uploadAction?: MediaUploadAction;
  actionResult?: ActionResult<AdminProcessStep> | null;
  isSaving?: boolean;
  onChange: (patch: Partial<ProcessDraft>) => void;
  onSave: () => void;
  onCancel: () => void;
  isNew: boolean;
}) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSave();
  }

  return (
    <section
      className="border-line bg-surface tablet:p-8 mt-8 border p-5"
      aria-label="Process step editor"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="type-meta text-foreground-muted">{isNew ? "New step" : "Edit step"}</p>
          <h2 className="font-display mt-2 text-4xl leading-tight">
            {draft.title || "Untitled step"}
          </h2>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="type-meta text-foreground-muted min-h-11 px-2"
        >
          Close editor
        </button>
      </div>
      <form id="process-editor" onSubmit={submit} className="desktop:grid-cols-2 mt-8 grid gap-6">
        <FormField id="process-step-no" label="Step number" required>
          <TextInput
            type="number"
            min={1}
            value={draft.stepNo}
            onValueChange={(value) => onChange({ stepNo: Number(value) || 1 })}
          />
        </FormField>
        <FormField id="process-title" label="Title" required>
          <TextInput value={draft.title} onValueChange={(value) => onChange({ title: value })} />
        </FormField>
        <FormField
          id="process-description"
          label="Description"
          required
          className="desktop:col-span-2"
        >
          <TextArea
            value={draft.description}
            onValueChange={(value) => onChange({ description: value })}
          />
        </FormField>
        <MediaPicker
          id="process-media"
          value={draft.mediaId}
          onChange={(mediaId) => onChange({ mediaId })}
          assets={mediaAssets}
          uploadAction={uploadAction}
          description="Optional image for the public process timeline."
        />
        <FormField id="process-status" label="Status">
          <StatusSelect
            value={draft.status}
            options={contentStatusOptions}
            onValueChange={(value) => onChange({ status: value as ContentStatus })}
          />
        </FormField>
      </form>
      <SaveBar
        formId="process-editor"
        hasChanges
        actionResult={actionResult}
        isSaving={isSaving}
        onSave={onSave}
        onCancel={onCancel}
      />
    </section>
  );
}

export function ProcessCollectionScreen({
  initialItems,
  mediaAssets = [],
  uploadAction,
  createAction,
  updateAction,
  deleteAction,
  reorderAction,
}: {
  initialItems: readonly AdminProcessStep[];
  mediaAssets?: readonly AdminMediaAsset[];
  uploadAction?: MediaUploadAction;
  createAction?: ProcessCreateAction;
  updateAction?: ProcessUpdateAction;
  deleteAction?: ProcessDeleteAction;
  reorderAction?: ProcessReorderAction;
}) {
  const [items, setItems] = useState(() => [...initialItems]);
  const [draft, setDraft] = useState<ProcessDraft | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminProcessStep | null>(null);
  const [actionResult, setActionResult] = useState<ActionResult<AdminProcessStep> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function saveDraft() {
    const currentDraft = draft;
    if (!currentDraft) return;

    const payload: ProcessStepMutationInput = {
      ...currentDraft,
      sortOrder: items.find((item) => item.id === currentDraft.id)?.sortOrder ?? items.length,
    };
    setActionResult(null);

    if ((currentDraft.id && updateAction) || (!currentDraft.id && createAction)) {
      setIsSaving(true);
      const result = currentDraft.id
        ? await updateAction?.({ ...payload, id: currentDraft.id })
        : await createAction?.(payload);
      setIsSaving(false);
      if (!result) return;
      setActionResult(result);
      if (!result.ok || !result.data) return;
      const saved = result.data;

      setItems((current) => {
        const next = current.some((item) => item.id === saved.id)
          ? current.map((item) => (item.id === saved.id ? saved : item))
          : [...current, saved];
        return next.map((item, index) => ({ ...item, sortOrder: index }));
      });
      setDraft(null);
      return;
    }

    const existing = items.find((item) => item.id === currentDraft.id);
    const id = currentDraft.id ?? draftId("process");
    const nextItem: AdminProcessStep = {
      id,
      stepNo: currentDraft.stepNo,
      title: currentDraft.title,
      description: currentDraft.description,
      media: resolveMediaAsset(currentDraft.mediaId, mediaAssets) ?? existing?.media ?? null,
      sortOrder: existing?.sortOrder ?? items.length,
      status: currentDraft.status,
    };
    setItems((current) => {
      const next = existing
        ? current.map((item) => (item.id === id ? nextItem : item))
        : [...current, nextItem];
      return next.map((item, index) => ({ ...item, sortOrder: index }));
    });
    setDraft(null);
    toast.success(existing ? "Process step draft updated." : "Process step draft added.");
  }

  async function reorderItems(nextItems: AdminProcessStep[]) {
    const previousItems = items;
    const orderedItems = nextItems.map((item, index) => ({ ...item, sortOrder: index }));
    setItems(orderedItems);
    if (!reorderAction) return;

    const result = await reorderAction(orderedItems.map((item) => item.id));
    if (!result.ok) {
      setItems(previousItems);
      toast.error(result.formError ?? "The process step order could not be saved.");
      return;
    }
    toast.success(result.message ?? "Process step order saved.");
  }

  async function deleteItem() {
    const target = deleteTarget;
    if (!target) return;

    if (deleteAction) {
      const result = await deleteAction(target.id);
      if (!result.ok) {
        toast.error(result.formError ?? "The process step could not be deleted.");
        return;
      }
      toast.success(result.message ?? "Process step deleted.");
    } else {
      toast.success("Process step draft deleted.");
    }

    setItems((current) => current.filter((item) => item.id !== target.id));
    setDeleteTarget(null);
  }

  return (
    <>
      <AdminCollectionHeader
        eyebrow="Process"
        title="Process"
        description="Keep the studio method legible, ordered, and easy to scan from first conversation to final detail."
        actionLabel="Add process step"
        onAction={() => setDraft(emptyProcessDraft())}
      />
      <DraftNotice />
      {draft ? (
        <ProcessEditor
          draft={draft}
          mediaAssets={mediaAssets}
          uploadAction={uploadAction}
          actionResult={actionResult}
          isSaving={isSaving}
          onChange={(patch) =>
            setDraft((current) => (current ? { ...current, ...patch } : current))
          }
          onSave={saveDraft}
          onCancel={() => setDraft(null)}
          isNew={!draft.id}
        />
      ) : null}
      <section className="mt-10" aria-labelledby="process-list-title">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="type-meta text-foreground-muted">Ordered collection</p>
            <h2 id="process-list-title" className="font-display mt-2 text-3xl">
              {items.length} {items.length === 1 ? "step" : "steps"}
            </h2>
          </div>
          <p className="type-spec text-foreground-muted">
            Order is independent from the visible step number.
          </p>
        </div>
        <SortableCollectionList
          items={items}
          ariaLabel="Process steps order"
          emptyLabel="process steps"
          getTitle={(item) => `${item.stepNo}. ${item.title}`}
          getMeta={(item) => <StatusBadge status={item.status} />}
          onReorder={reorderItems}
          onEdit={(item) => setDraft(processDraftFromItem(item))}
          onDelete={setDeleteTarget}
          renderExtra={(item) => (
            <p className="type-spec text-foreground-muted mt-2 line-clamp-2">{item.description}</p>
          )}
        />
      </section>
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={`Delete ${deleteTarget?.title ?? "process step"}?`}
        description={
          deleteAction
            ? "This permanently removes the process step from the collection."
            : "This removes the draft record from the current editing session."
        }
        confirmLabel="Delete step"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={deleteItem}
      />
    </>
  );
}

interface ExplorationMediaDraft {
  id: string;
  mediaId: string;
  caption: string;
}

interface ExplorationDraft {
  id?: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  year: number | null;
  coverMediaId: string | null;
  status: ContentStatus;
  media: ExplorationMediaDraft[];
}

function explorationDraftFromItem(
  item: AdminExplorationSummary,
  media: readonly ExplorationMediaItem[],
): ExplorationDraft {
  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    category: item.category,
    description: item.description ?? "",
    year: item.year,
    coverMediaId: item.coverMedia?.id ?? null,
    status: item.status,
    media: media
      .filter((asset) => asset.explorationId === item.id)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((asset) => ({ id: asset.id, mediaId: asset.mediaId, caption: asset.caption ?? "" })),
  };
}

function emptyExplorationDraft(): ExplorationDraft {
  return {
    slug: "",
    title: "",
    category: "",
    description: "",
    year: null,
    coverMediaId: null,
    status: "draft",
    media: [],
  };
}

function ExplorationEditor({
  draft,
  mediaAssets,
  uploadAction,
  actionResult,
  isSaving,
  onChange,
  onSave,
  onCancel,
  isNew,
}: {
  draft: ExplorationDraft;
  mediaAssets: readonly AdminMediaAsset[];
  uploadAction?: MediaUploadAction;
  actionResult?: ActionResult<AdminExplorationSummary | ExplorationMediaItem[]> | null;
  isSaving?: boolean;
  onChange: (patch: Partial<ExplorationDraft>) => void;
  onSave: () => void;
  onCancel: () => void;
  isNew: boolean;
}) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSave();
  }

  function updateMedia(id: string, patch: Partial<ExplorationMediaDraft>) {
    onChange({ media: draft.media.map((item) => (item.id === id ? { ...item, ...patch } : item)) });
  }

  return (
    <section
      className="border-line bg-surface tablet:p-8 mt-8 border p-5"
      aria-label="Exploration editor"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="type-meta text-foreground-muted">
            {isNew ? "New exploration" : "Edit exploration"}
          </p>
          <h2 className="font-display mt-2 text-4xl leading-tight">
            {draft.title || "Untitled exploration"}
          </h2>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="type-meta text-foreground-muted min-h-11 px-2"
        >
          Close editor
        </button>
      </div>
      <form
        id="exploration-editor"
        onSubmit={submit}
        className="desktop:grid-cols-2 mt-8 grid gap-6"
      >
        <FormField id="exploration-title" label="Title" required>
          <TextInput value={draft.title} onValueChange={(value) => onChange({ title: value })} />
        </FormField>
        <FormField id="exploration-slug" label="Slug" required>
          <TextInput value={draft.slug} onValueChange={(value) => onChange({ slug: value })} />
        </FormField>
        <FormField id="exploration-category" label="Category" required>
          <TextInput
            value={draft.category}
            onValueChange={(value) => onChange({ category: value })}
          />
        </FormField>
        <FormField id="exploration-year" label="Year">
          <TextInput
            type="number"
            value={draft.year ?? ""}
            onValueChange={(value) => onChange({ year: value ? Number(value) : null })}
          />
        </FormField>
        <FormField id="exploration-description" label="Description" className="desktop:col-span-2">
          <TextArea
            value={draft.description}
            onValueChange={(value) => onChange({ description: value })}
          />
        </FormField>
        <MediaPicker
          id="exploration-cover"
          label="Cover media"
          value={draft.coverMediaId}
          assets={mediaAssets}
          uploadAction={uploadAction}
          onChange={(coverMediaId) => onChange({ coverMediaId })}
        />
        <FormField id="exploration-status" label="Status">
          <StatusSelect
            value={draft.status}
            options={contentStatusOptions}
            onValueChange={(value) => onChange({ status: value as ContentStatus })}
          />
        </FormField>
      </form>

      <div className="border-line rule-hairline mt-8 pt-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="type-meta text-foreground-muted">Ordered exploration media</p>
            <p className="type-spec text-foreground-muted mt-2 max-w-xl">
              Attach active media from the library; captions remain editable per asset.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              onChange({
                media: [
                  ...draft.media,
                  { id: draftId("exploration-media"), mediaId: "", caption: "" },
                ],
              })
            }
            className="border-line-strong type-meta hover:bg-ink hover:text-warm-white inline-flex min-h-11 items-center border px-4 transition-colors duration-(--duration-quick)"
          >
            Add media
          </button>
        </div>
        <div className="mt-5">
          <SortableList
            items={draft.media}
            getItemId={(item) => item.id}
            onReorder={(media) => onChange({ media })}
            ariaLabel="Exploration media order"
            emptyState="No exploration media attached."
            renderItem={(item, helpers) => (
              <div className="border-line desktop:grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)_auto] desktop:items-end grid gap-3 border p-4">
                <button
                  type="button"
                  ref={helpers.setActivatorNodeRef}
                  {...helpers.attributes}
                  {...helpers.listeners}
                  aria-label={`Move media ${item.mediaId || "asset"}`}
                  className="border-line-strong type-meta inline-flex min-h-12 items-center justify-center border px-3"
                >
                  ↕<span className="sr-only">Reorder</span>
                </button>
                <MediaPicker
                  id={`${item.id}-media-picker`}
                  label="Media"
                  value={item.mediaId || null}
                  assets={mediaAssets}
                  uploadAction={uploadAction}
                  onChange={(mediaId) => updateMedia(item.id, { mediaId: mediaId ?? "" })}
                />
                <FormField id={`${item.id}-caption`} label="Caption">
                  <TextInput
                    value={item.caption}
                    onValueChange={(caption) => updateMedia(item.id, { caption })}
                    placeholder="Optional caption"
                  />
                </FormField>
                <button
                  type="button"
                  onClick={() =>
                    onChange({ media: draft.media.filter((media) => media.id !== item.id) })
                  }
                  className="border-line-strong type-meta hover:bg-ink hover:text-warm-white inline-flex min-h-12 items-center justify-center border px-3 transition-colors duration-(--duration-quick)"
                >
                  Remove
                </button>
              </div>
            )}
          />
        </div>
      </div>
      <SaveBar
        formId="exploration-editor"
        hasChanges
        actionResult={actionResult}
        isSaving={isSaving}
        onSave={onSave}
        onCancel={onCancel}
      />
    </section>
  );
}

export function ExplorationsCollectionScreen({
  initialItems,
  initialMedia,
  mediaAssets = [],
  uploadAction,
  createAction,
  updateAction,
  deleteAction,
  reorderAction,
  syncMediaAction,
}: {
  initialItems: readonly AdminExplorationSummary[];
  initialMedia: readonly ExplorationMediaItem[];
  mediaAssets?: readonly AdminMediaAsset[];
  uploadAction?: MediaUploadAction;
  createAction?: ExplorationCreateAction;
  updateAction?: ExplorationUpdateAction;
  deleteAction?: ExplorationDeleteAction;
  reorderAction?: ExplorationReorderAction;
  syncMediaAction?: ExplorationMediaSyncAction;
}) {
  const [items, setItems] = useState(() => [...initialItems]);
  const [media, setMedia] = useState(() => [...initialMedia]);
  const [draft, setDraft] = useState<ExplorationDraft | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminExplorationSummary | null>(null);
  const [actionResult, setActionResult] = useState<ActionResult<
    AdminExplorationSummary | ExplorationMediaItem[]
  > | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function saveDraft() {
    const currentDraft = draft;
    if (!currentDraft) return;

    const payload: ExplorationMutationInput = {
      id: currentDraft.id,
      slug: currentDraft.slug,
      title: currentDraft.title,
      category: currentDraft.category,
      description: currentDraft.description,
      year: currentDraft.year,
      coverMediaId: currentDraft.coverMediaId,
      sortOrder: items.find((item) => item.id === currentDraft.id)?.sortOrder ?? items.length,
      status: currentDraft.status,
    };
    setActionResult(null);

    if ((currentDraft.id && updateAction) || (!currentDraft.id && createAction)) {
      setIsSaving(true);
      const result = currentDraft.id
        ? await updateAction?.({ ...payload, id: currentDraft.id })
        : await createAction?.(payload);
      if (!result) {
        setIsSaving(false);
        return;
      }
      setActionResult(result);
      if (!result.ok || !result.data) {
        setIsSaving(false);
        return;
      }

      const saved = result.data;
      setItems((current) => {
        const next = current.some((item) => item.id === saved.id)
          ? current.map((item) => (item.id === saved.id ? saved : item))
          : [...current, saved];
        return next.map((item, index) => ({ ...item, sortOrder: index }));
      });

      if (syncMediaAction) {
        const mediaResult = await syncMediaAction({
          explorationId: saved.id,
          items: currentDraft.media.map((item, index) => ({
            id: item.id,
            explorationId: saved.id,
            mediaId: item.mediaId,
            caption: item.caption,
            sortOrder: index,
          })),
        });
        setActionResult(mediaResult);
        setIsSaving(false);
        if (!mediaResult.ok || !mediaResult.data) {
          setDraft({ ...currentDraft, id: saved.id });
          return;
        }
        const savedMedia = mediaResult.data;
        setMedia((current) => [
          ...current.filter((item) => item.explorationId !== saved.id),
          ...savedMedia,
        ]);
      } else {
        setMedia((current) => [
          ...current.filter((item) => item.explorationId !== saved.id),
          ...currentDraft.media.map((item, index) => ({
            id: item.id,
            explorationId: saved.id,
            mediaId: item.mediaId,
            caption: item.caption || null,
            sortOrder: index,
            media:
              resolveMediaAsset(item.mediaId, mediaAssets) ??
              current.find((asset) => asset.id === item.id)?.media ??
              null,
          })),
        ]);
      }
      setDraft(null);
      setIsSaving(false);
      return;
    }

    const existing = items.find((item) => item.id === currentDraft.id);
    const id = currentDraft.id ?? draftId("exploration");
    const nextItem: AdminExplorationSummary = {
      id,
      slug: currentDraft.slug,
      title: currentDraft.title,
      category: currentDraft.category,
      description: currentDraft.description || null,
      year: currentDraft.year,
      coverMedia:
        resolveMediaAsset(currentDraft.coverMediaId, mediaAssets) ?? existing?.coverMedia ?? null,
      sortOrder: existing?.sortOrder ?? items.length,
      status: currentDraft.status,
    };
    setItems((current) => {
      const next = existing
        ? current.map((item) => (item.id === id ? nextItem : item))
        : [...current, nextItem];
      return next.map((item, index) => ({ ...item, sortOrder: index }));
    });
    setMedia((current) => [
      ...current.filter((item) => item.explorationId !== id),
      ...currentDraft.media.map((item, index) => ({
        id: item.id,
        explorationId: id,
        mediaId: item.mediaId,
        caption: item.caption || null,
        sortOrder: index,
        media:
          resolveMediaAsset(item.mediaId, mediaAssets) ??
          current.find((asset) => asset.id === item.id)?.media ??
          null,
      })),
    ]);
    setDraft(null);
    toast.success(existing ? "Exploration draft updated." : "Exploration draft added.");
  }

  async function reorderItems(nextItems: AdminExplorationSummary[]) {
    const previousItems = items;
    const orderedItems = nextItems.map((item, index) => ({ ...item, sortOrder: index }));
    setItems(orderedItems);
    if (!reorderAction) return;

    const result = await reorderAction(orderedItems.map((item) => item.id));
    if (!result.ok) {
      setItems(previousItems);
      toast.error(result.formError ?? "The exploration order could not be saved.");
      return;
    }
    toast.success(result.message ?? "Exploration order saved.");
  }

  async function deleteItem() {
    const target = deleteTarget;
    if (!target) return;

    if (deleteAction) {
      const result = await deleteAction(target.id);
      if (!result.ok) {
        toast.error(result.formError ?? "The exploration could not be deleted.");
        return;
      }
      toast.success(result.message ?? "Exploration deleted.");
    } else {
      toast.success("Exploration draft deleted.");
    }

    setItems((current) => current.filter((item) => item.id !== target.id));
    setMedia((current) => current.filter((item) => item.explorationId !== target.id));
    setDeleteTarget(null);
  }

  return (
    <>
      <AdminCollectionHeader
        eyebrow="Explorations"
        title="Explorations"
        description="Curate material studies, references, and quiet experiments outside the formal project archive."
        actionLabel="Add exploration"
        onAction={() => setDraft(emptyExplorationDraft())}
      />
      <DraftNotice />
      {draft ? (
        <ExplorationEditor
          draft={draft}
          mediaAssets={mediaAssets}
          uploadAction={uploadAction}
          actionResult={actionResult}
          isSaving={isSaving}
          onChange={(patch) =>
            setDraft((current) => (current ? { ...current, ...patch } : current))
          }
          onSave={saveDraft}
          onCancel={() => {
            setActionResult(null);
            setDraft(null);
          }}
          isNew={!draft.id}
        />
      ) : null}
      <section className="mt-10" aria-labelledby="explorations-list-title">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="type-meta text-foreground-muted">Ordered collection</p>
            <h2 id="explorations-list-title" className="font-display mt-2 text-3xl">
              {items.length} {items.length === 1 ? "exploration" : "explorations"}
            </h2>
          </div>
          <p className="type-spec text-foreground-muted">
            Each entry can carry its own ordered media set.
          </p>
        </div>
        <SortableCollectionList
          items={items}
          ariaLabel="Explorations order"
          emptyLabel="explorations"
          getTitle={(item) => item.title}
          getMeta={(item) => <StatusBadge status={item.status} />}
          onReorder={reorderItems}
          onEdit={(item) => setDraft(explorationDraftFromItem(item, media))}
          onDelete={setDeleteTarget}
          renderExtra={(item) => (
            <p className="type-spec text-foreground-muted mt-2 truncate">
              {item.category} · {item.year ?? "Undated"} ·{" "}
              {media.filter((asset) => asset.explorationId === item.id).length} media
            </p>
          )}
        />
      </section>
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={`Delete ${deleteTarget?.title ?? "exploration"}?`}
        description={
          deleteAction
            ? "The exploration and its ordered media references will be permanently removed."
            : "The exploration and its ordered media references will be removed from this editing session."
        }
        confirmLabel="Delete exploration"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={deleteItem}
      />
    </>
  );
}

interface TestimonialDraft {
  id?: string;
  clientName: string;
  clientRole: string;
  projectName: string;
  quote: string;
  featured: boolean;
  status: ContentStatus;
}

function emptyTestimonialDraft(): TestimonialDraft {
  return {
    clientName: "",
    clientRole: "",
    projectName: "",
    quote: "",
    featured: false,
    status: "draft",
  };
}

function testimonialDraftFromItem(item: AdminTestimonial): TestimonialDraft {
  return {
    id: item.id,
    clientName: item.clientName,
    clientRole: item.clientRole ?? "",
    projectName: item.projectName ?? "",
    quote: item.quote,
    featured: item.featured,
    status: item.status,
  };
}

export function TestimonialsCollectionScreen({
  initialItems,
  createAction,
  updateAction,
  deleteAction,
  reorderAction,
}: {
  initialItems: readonly AdminTestimonial[];
  createAction?: TestimonialCreateAction;
  updateAction?: TestimonialUpdateAction;
  deleteAction?: TestimonialDeleteAction;
  reorderAction?: TestimonialReorderAction;
}) {
  const [items, setItems] = useState(() => [...initialItems]);
  const [draft, setDraft] = useState<TestimonialDraft | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminTestimonial | null>(null);
  const [actionResult, setActionResult] = useState<ActionResult<AdminTestimonial> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  function updateDraft(patch: Partial<TestimonialDraft>) {
    setDraft((current) => (current ? { ...current, ...patch } : current));
  }

  async function saveDraft() {
    const currentDraft = draft;
    if (!currentDraft) return;

    const payload: TestimonialMutationInput = {
      id: currentDraft.id,
      clientName: currentDraft.clientName,
      clientRole: currentDraft.clientRole,
      projectName: currentDraft.projectName,
      quote: currentDraft.quote,
      sortOrder: items.find((item) => item.id === currentDraft.id)?.sortOrder ?? items.length,
      featured: currentDraft.featured,
      status: currentDraft.status,
    };
    setActionResult(null);

    if ((currentDraft.id && updateAction) || (!currentDraft.id && createAction)) {
      setIsSaving(true);
      const result = currentDraft.id
        ? await updateAction?.({ ...payload, id: currentDraft.id })
        : await createAction?.(payload);
      setIsSaving(false);
      if (!result) return;
      setActionResult(result);
      if (!result.ok || !result.data) return;
      const saved = result.data;

      setItems((current) => {
        const next = current.some((item) => item.id === saved.id)
          ? current.map((item) => (item.id === saved.id ? saved : item))
          : [...current, saved];
        return next.map((item, index) => ({ ...item, sortOrder: index }));
      });
      setDraft(null);
      return;
    }

    const existing = items.find((item) => item.id === currentDraft.id);
    const id = currentDraft.id ?? draftId("testimonial");
    const nextItem: AdminTestimonial = {
      id,
      clientName: currentDraft.clientName,
      clientRole: currentDraft.clientRole || null,
      projectName: currentDraft.projectName || null,
      quote: currentDraft.quote,
      sortOrder: existing?.sortOrder ?? items.length,
      featured: currentDraft.featured,
      status: currentDraft.status,
    };
    setItems((current) => {
      const next = existing
        ? current.map((item) => (item.id === id ? nextItem : item))
        : [...current, nextItem];
      return next.map((item, index) => ({ ...item, sortOrder: index }));
    });
    setDraft(null);
    toast.success(existing ? "Testimonial draft updated." : "Testimonial draft added.");
  }

  async function reorderItems(nextItems: AdminTestimonial[]) {
    const previousItems = items;
    const orderedItems = nextItems.map((item, index) => ({ ...item, sortOrder: index }));
    setItems(orderedItems);
    if (!reorderAction) return;

    const result = await reorderAction(orderedItems.map((item) => item.id));
    if (!result.ok) {
      setItems(previousItems);
      toast.error(result.formError ?? "The testimonial order could not be saved.");
      return;
    }
    toast.success(result.message ?? "Testimonial order saved.");
  }

  async function deleteItem() {
    const target = deleteTarget;
    if (!target) return;

    if (deleteAction) {
      const result = await deleteAction(target.id);
      if (!result.ok) {
        toast.error(result.formError ?? "The testimonial could not be deleted.");
        return;
      }
      toast.success(result.message ?? "Testimonial deleted.");
    } else {
      toast.success("Testimonial draft deleted.");
    }

    setItems((current) => current.filter((item) => item.id !== target.id));
    setDeleteTarget(null);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    saveDraft();
  }

  return (
    <>
      <AdminCollectionHeader
        eyebrow="Testimonials"
        title="Testimonials"
        description="Keep social proof specific, credible, and ready to support the right project story."
        actionLabel="Add testimonial"
        onAction={() => setDraft(emptyTestimonialDraft())}
      />
      <DraftNotice />
      {draft ? (
        <section
          className="border-line bg-surface tablet:p-8 mt-8 border p-5"
          aria-label="Testimonial editor"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="type-meta text-foreground-muted">
                {draft.id ? "Edit record" : "New record"}
              </p>
              <h2 className="font-display mt-2 text-4xl leading-tight">
                {draft.clientName || "Unnamed client"}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setDraft(null)}
              className="type-meta text-foreground-muted min-h-11 px-2"
            >
              Close editor
            </button>
          </div>
          <form
            id="testimonial-editor"
            onSubmit={submit}
            className="desktop:grid-cols-2 mt-8 grid gap-6"
          >
            <FormField id="testimonial-client" label="Client name" required>
              <TextInput
                value={draft.clientName}
                onValueChange={(value) => updateDraft({ clientName: value })}
              />
            </FormField>
            <FormField id="testimonial-role" label="Client role">
              <TextInput
                value={draft.clientRole}
                onValueChange={(value) => updateDraft({ clientRole: value })}
              />
            </FormField>
            <FormField id="testimonial-project" label="Project name">
              <TextInput
                value={draft.projectName}
                onValueChange={(value) => updateDraft({ projectName: value })}
              />
            </FormField>
            <FormField id="testimonial-status" label="Status">
              <StatusSelect
                value={draft.status}
                options={contentStatusOptions}
                onValueChange={(value) => updateDraft({ status: value as ContentStatus })}
              />
            </FormField>
            <FormField id="testimonial-quote" label="Quote" required className="desktop:col-span-2">
              <TextArea
                rows={7}
                value={draft.quote}
                onValueChange={(value) => updateDraft({ quote: value })}
              />
            </FormField>
            <label className="type-spec flex min-h-12 items-center gap-3">
              <input
                type="checkbox"
                checked={draft.featured}
                onChange={(event) => updateDraft({ featured: event.target.checked })}
                className="accent-ink size-5"
              />
              Show in featured credibility content
            </label>
          </form>
          <SaveBar
            formId="testimonial-editor"
            hasChanges
            onSave={saveDraft}
            actionResult={actionResult}
            isSaving={isSaving}
            onCancel={() => {
              setActionResult(null);
              setDraft(null);
            }}
          />
        </section>
      ) : null}
      <section className="mt-10" aria-labelledby="testimonials-list-title">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="type-meta text-foreground-muted">Ordered collection</p>
            <h2 id="testimonials-list-title" className="font-display mt-2 text-3xl">
              {items.length} {items.length === 1 ? "testimonial" : "testimonials"}
            </h2>
          </div>
          <p className="type-spec text-foreground-muted">
            Featured state is visible before opening an editor.
          </p>
        </div>
        <SortableCollectionList
          items={items}
          ariaLabel="Testimonials order"
          emptyLabel="testimonials"
          getTitle={(item) => item.clientName}
          getMeta={(item) => (
            <>
              <StatusBadge status={item.status} />
              {item.featured ? (
                <span className="type-meta text-foreground-muted">Featured</span>
              ) : null}
            </>
          )}
          onReorder={reorderItems}
          onEdit={(item) => setDraft(testimonialDraftFromItem(item))}
          onDelete={setDeleteTarget}
          renderExtra={(item) => (
            <p className="type-spec text-foreground-muted mt-2 line-clamp-2">“{item.quote}”</p>
          )}
        />
      </section>
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={`Delete ${deleteTarget?.clientName ?? "testimonial"}?`}
        description={
          deleteAction
            ? "This permanently removes the testimonial from the collection."
            : "This removes the draft record from the current editing session."
        }
        confirmLabel="Delete testimonial"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={deleteItem}
      />
    </>
  );
}

type MediaFilter = "all" | "active" | "archived";

export function MediaCollectionScreen({
  initialItems,
  uploadAction,
  archiveAction,
  hardDeleteAction,
}: {
  initialItems: readonly AdminMediaAsset[];
  uploadAction?: MediaUploadAction;
  archiveAction?: MediaArchiveAction;
  hardDeleteAction?: MediaHardDeleteAction;
}) {
  const [items, setItems] = useState(() => [...initialItems]);
  const [filter, setFilter] = useState<MediaFilter>("active");
  const [search, setSearch] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState<AdminMediaAsset | null>(null);
  const [hardDeleteTarget, setHardDeleteTarget] = useState<AdminMediaAsset | null>(null);

  const visibleItems = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return items.filter((item) => {
      const matchesFilter =
        filter === "all" || (filter === "archived" ? item.isArchived : !item.isArchived);
      const matchesSearch =
        !normalizedSearch ||
        `${item.altText} ${item.storagePath}`.toLowerCase().includes(normalizedSearch);
      return matchesFilter && matchesSearch;
    });
  }, [filter, items, search]);

  async function restoreAsset(asset: AdminMediaAsset) {
    if (archiveAction) {
      const result = await archiveAction({ id: asset.id, isArchived: false });
      if (!result.ok) {
        toast.error(result.formError ?? "The asset could not be restored.");
        return;
      }
    }

    setItems((current) =>
      current.map((item) => (item.id === asset.id ? { ...item, isArchived: false } : item)),
    );
    toast.success("Media asset restored.");
  }

  async function archiveAsset() {
    const target = archiveTarget;
    if (!target) return;

    if (archiveAction) {
      const result = await archiveAction({ id: target.id, isArchived: true });
      if (!result.ok) {
        toast.error(result.formError ?? "The asset could not be archived.");
        return;
      }
    }

    setItems((current) =>
      current.map((item) => (item.id === target.id ? { ...item, isArchived: true } : item)),
    );
    setArchiveTarget(null);
    toast.success("Media asset archived.");
  }

  async function hardDeleteAsset() {
    const target = hardDeleteTarget;
    if (!target || !hardDeleteAction) return;

    const result = await hardDeleteAction(target.id);
    if (!result.ok) {
      toast.error(result.formError ?? "The asset could not be permanently deleted.");
      return;
    }

    setItems((current) => current.filter((item) => item.id !== target.id));
    setHardDeleteTarget(null);
    toast.success("Media asset permanently deleted.");
  }

  return (
    <>
      <AdminCollectionHeader
        eyebrow="Media"
        title="Media library"
        description="Keep image and video references findable, described, and safe to archive without breaking published stories."
        actionLabel="Upload media"
        onAction={() => setUploadOpen(true)}
      />
      <p className="type-meta text-foreground-subtle mt-5">
        {uploadAction
          ? "Storage-backed · uploads and archive changes are saved immediately."
          : "Session draft · changes are ready for the collection action layer."}
      </p>
      <section className="mt-10" aria-labelledby="media-library-title">
        <div className="desktop:grid-cols-[minmax(0,1fr)_14rem] grid gap-4">
          <div>
            <label htmlFor="media-search" className="type-meta text-foreground-muted">
              Search media
            </label>
            <TextInput
              id="media-search"
              value={search}
              onValueChange={setSearch}
              placeholder="Search alt text or storage path"
              className="mt-2"
            />
          </div>
          <FormField id="media-filter" label="View">
            <StatusSelect
              value={filter}
              options={[
                { value: "active", label: "Active" },
                { value: "archived", label: "Archived" },
                { value: "all", label: "All media" },
              ]}
              onValueChange={(value) => setFilter(value as MediaFilter)}
            />
          </FormField>
        </div>
        <div className="mt-8 flex items-end justify-between gap-3">
          <div>
            <p className="type-meta text-foreground-muted">Library view</p>
            <h2 id="media-library-title" className="font-display mt-2 text-3xl">
              {visibleItems.length} assets
            </h2>
          </div>
          <p className="type-spec text-foreground-muted">
            Archived assets remain resolvable for existing references.
          </p>
        </div>
        {visibleItems.length === 0 ? (
          <div className="mt-4">
            <CollectionEmpty label="media assets" />
          </div>
        ) : (
          <ul
            className="tablet:grid-cols-2 desktop:grid-cols-3 mt-4 grid gap-4"
            aria-label="Media assets"
          >
            {visibleItems.map((item) => (
              <li
                key={item.id}
                className="border-line bg-surface flex min-h-64 flex-col border p-4"
              >
                <div className="bg-surface-sunken flex min-h-28 items-center justify-center px-4 text-center">
                  <span className="type-meta text-foreground-muted">{item.mediaType} asset</span>
                </div>
                <div className="mt-4 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="type-spec truncate font-medium">{item.altText}</p>
                    <p className="type-meta text-foreground-subtle mt-2 truncate">
                      {item.storagePath}
                    </p>
                  </div>
                  <StatusBadge status={item.isArchived ? "archived" : "active"} />
                </div>
                <div className="type-meta text-foreground-muted mt-auto flex justify-between gap-3 pt-5">
                  <span>{formatFileSize(item.fileSizeBytes)}</span>
                  <span>{formatDate(item.createdAt)}</span>
                </div>
                <div className="mt-4 flex gap-2">
                  {item.isArchived ? (
                    <>
                      <button
                        type="button"
                        onClick={() => void restoreAsset(item)}
                        className="border-line-strong type-meta hover:bg-ink hover:text-warm-white inline-flex min-h-11 flex-1 items-center justify-center border px-3 transition-colors duration-(--duration-quick)"
                      >
                        Restore
                      </button>
                      {hardDeleteAction ? (
                        <button
                          type="button"
                          onClick={() => setHardDeleteTarget(item)}
                          className="border-critical text-critical hover:bg-critical hover:text-warm-white type-meta inline-flex min-h-11 flex-1 items-center justify-center border px-3 transition-colors duration-(--duration-quick)"
                        >
                          Delete permanently
                        </button>
                      ) : null}
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setArchiveTarget(item)}
                      className="border-line-strong type-meta hover:bg-ink hover:text-warm-white inline-flex min-h-11 flex-1 items-center justify-center border px-3 transition-colors duration-(--duration-quick)"
                    >
                      Archive
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <MediaUploadModal
        key={uploadOpen ? "media-upload-open" : "media-upload-closed"}
        open={uploadOpen}
        submitLabel={uploadAction ? "Upload to library" : "Queue upload"}
        uploadAction={uploadAction}
        onCancel={() => setUploadOpen(false)}
        onUploaded={(asset) => setItems((current) => [asset, ...current])}
      />
      <ConfirmDialog
        open={Boolean(archiveTarget)}
        title={`Archive ${archiveTarget?.altText ?? "this asset"}?`}
        description="Archiving hides the asset from normal selection while preserving existing published references."
        confirmLabel="Archive asset"
        onCancel={() => setArchiveTarget(null)}
        onConfirm={archiveAsset}
      />
      <ConfirmDialog
        open={Boolean(hardDeleteTarget)}
        title={`Delete ${hardDeleteTarget?.altText ?? "this asset"} permanently?`}
        description="The asset can only be deleted when no content or JSON section references it. Archive is safer when you are unsure."
        confirmLabel="Delete permanently"
        onCancel={() => setHardDeleteTarget(null)}
        onConfirm={hardDeleteAsset}
      />
    </>
  );
}

const inquiryStatusFilterOptions = [
  { value: "all", label: "All statuses" },
  ...inquiryStatusOptions,
] as const;

export function InquiriesCollectionScreen({
  initialItems,
}: {
  initialItems: readonly InquiryRecord[];
}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | InquiryStatus>("all");
  const normalizedSearch = search.trim().toLowerCase();
  const visibleItems = initialItems.filter((item) => {
    const matchesStatus = status === "all" || item.status === status;
    const matchesSearch =
      !normalizedSearch ||
      `${item.name} ${item.email} ${item.projectLocation}`.toLowerCase().includes(normalizedSearch);
    return matchesStatus && matchesSearch;
  });

  return (
    <>
      <AdminCollectionHeader
        eyebrow="Inquiries"
        title="Inquiries"
        description="Review incoming project briefs, qualify the opportunity, and leave a clear internal trail for follow-up."
        actionLabel="View contact form"
        onAction={() => window.open("/contact", "_blank", "noopener,noreferrer")}
      />
      <section className="mt-10" aria-labelledby="inquiries-list-title">
        <div className="desktop:grid-cols-[minmax(0,1fr)_14rem] grid gap-4">
          <div>
            <label htmlFor="inquiry-search" className="type-meta text-foreground-muted">
              Search inquiries
            </label>
            <TextInput
              id="inquiry-search"
              value={search}
              onValueChange={setSearch}
              placeholder="Name, email, or location"
              className="mt-2"
            />
          </div>
          <FormField id="inquiry-status-filter" label="Status">
            <StatusSelect
              value={status}
              options={inquiryStatusFilterOptions}
              onValueChange={(value) => setStatus(value as "all" | InquiryStatus)}
            />
          </FormField>
        </div>
        <div className="mt-8 flex items-end justify-between gap-3">
          <div>
            <p className="type-meta text-foreground-muted">Lead inbox</p>
            <h2 id="inquiries-list-title" className="font-display mt-2 text-3xl">
              {visibleItems.length} inquiries
            </h2>
          </div>
          <p className="type-spec text-foreground-muted">Newest submissions appear first.</p>
        </div>
        {visibleItems.length === 0 ? (
          <div className="mt-4">
            <CollectionEmpty label="inquiries" />
          </div>
        ) : (
          <div className="border-line mt-4 overflow-x-auto border">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead className="bg-surface-sunken">
                <tr className="type-meta text-foreground-muted">
                  <th scope="col" className="px-4 py-4 font-normal">
                    Name
                  </th>
                  <th scope="col" className="px-4 py-4 font-normal">
                    Project
                  </th>
                  <th scope="col" className="px-4 py-4 font-normal">
                    Received
                  </th>
                  <th scope="col" className="px-4 py-4 font-normal">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-4 font-normal">
                    <span className="sr-only">Open</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {visibleItems.map((item) => (
                  <tr key={item.id} className="border-line border-t align-top">
                    <td className="px-4 py-5">
                      <p className="type-spec font-medium">{item.name}</p>
                      <p className="type-meta text-foreground-muted mt-1">{item.email}</p>
                    </td>
                    <td className="px-4 py-5">
                      <p className="type-spec">{item.projectType}</p>
                      <p className="type-meta text-foreground-muted mt-1">{item.projectLocation}</p>
                    </td>
                    <td className="type-spec px-4 py-5">{formatDate(item.submittedAt)}</td>
                    <td className="px-4 py-5">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-4 py-5 text-right">
                      <Link
                        href={`/admin/inquiries/${item.id}`}
                        className="border-line-strong type-meta hover:bg-ink hover:text-warm-white inline-flex min-h-11 items-center border px-4 transition-colors duration-(--duration-quick)"
                      >
                        View detail
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

export function InquiryDetailScreen({ inquiry }: { inquiry: InquiryRecord }) {
  const [status, setStatus] = useState<InquiryStatus>(inquiry.status);
  const [adminNotes, setAdminNotes] = useState(inquiry.adminNotes ?? "");
  const [dirty, setDirty] = useState(false);

  function save() {
    setDirty(false);
    toast.success("Inquiry draft updated.");
  }

  return (
    <>
      <header className="border-line rule-hairline pb-8">
        <Link
          href="/admin/inquiries"
          className="type-meta text-foreground-muted hover:text-foreground"
        >
          ← Back to inquiries
        </Link>
        <div className="desktop:flex-row desktop:items-end desktop:justify-between mt-8 flex flex-col gap-5">
          <div>
            <p className="type-meta text-foreground-muted">Inquiry detail</p>
            <h1 className="font-display desktop:text-7xl mt-4 text-5xl leading-none tracking-tight">
              {inquiry.name}
            </h1>
            <p className="type-spec text-foreground-muted mt-4">
              Received {formatDate(inquiry.submittedAt)} · {inquiry.email}
            </p>
          </div>
          <StatusBadge status={status} />
        </div>
      </header>
      <div className="desktop:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)] mt-10 grid gap-10">
        <section aria-labelledby="inquiry-brief-title">
          <p className="type-meta text-foreground-muted">Project brief</p>
          <h2 id="inquiry-brief-title" className="font-display mt-3 text-3xl">
            {inquiry.projectType}
          </h2>
          <p className="type-spec text-foreground-muted mt-2">
            {inquiry.projectLocation}
            {inquiry.areaSqm ? ` · ${inquiry.areaSqm} m²` : ""}
          </p>
          <p className="type-spec mt-8 max-w-2xl whitespace-pre-wrap">{inquiry.projectBrief}</p>
          <dl className="border-line tablet:grid-cols-2 mt-10 grid gap-4 border-t pt-5">
            {[
              ["Required service", inquiry.requiredService],
              ["Project status", inquiry.projectStatus],
              ["Desired timeline", inquiry.desiredTimeline],
              ["Budget range", inquiry.budgetRange ?? "Not supplied"],
              ["Phone", inquiry.phone ?? "Not supplied"],
              ["Referral source", inquiry.referralSource ?? "Not supplied"],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="type-meta text-foreground-muted">{label}</dt>
                <dd className="type-spec mt-1">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
        <section
          className="border-line bg-surface tablet:p-6 h-fit border p-5"
          aria-labelledby="inquiry-workflow-title"
        >
          <p className="type-meta text-foreground-muted">Operations</p>
          <h2 id="inquiry-workflow-title" className="font-display mt-3 text-3xl">
            Follow-up
          </h2>
          <div className="mt-6 flex flex-col gap-6">
            <FormField id="inquiry-detail-status" label="Status">
              <StatusSelect
                value={status}
                options={inquiryStatusOptions}
                onValueChange={(value) => {
                  setStatus(value as InquiryStatus);
                  setDirty(true);
                }}
              />
            </FormField>
            <FormField
              id="inquiry-admin-notes"
              label="Internal notes"
              description="Notes are never shown on the public site."
            >
              <TextArea
                value={adminNotes}
                onValueChange={(value) => {
                  setAdminNotes(value);
                  setDirty(true);
                }}
              />
            </FormField>
          </div>
          <SaveBar
            hasChanges={dirty}
            onSave={save}
            cancelLabel="Reset"
            onCancel={() => {
              setStatus(inquiry.status);
              setAdminNotes(inquiry.adminNotes ?? "");
              setDirty(false);
            }}
          />
        </section>
      </div>
    </>
  );
}
