"use client";

import { useState } from "react";
import { toast } from "sonner";

import { ConfirmDialog, FormField, SortableList, TextInput } from "@/components/admin";
import type { ActionResult } from "@/components/admin/action-result";
import type {
  NavigationItem,
  NavigationItemMutationInput,
  NavigationPlacement,
} from "@/types/content";

const PLACEMENTS: readonly { value: NavigationPlacement; label: string; description: string }[] = [
  {
    value: "header",
    label: "Header Navigation",
    description: "Primary navigation links shown in top nav bar and mobile drawer",
  },
  {
    value: "footer",
    label: "Footer Links",
    description: "Secondary and legal links displayed in the page footer",
  },
  {
    value: "social",
    label: "Social Links",
    description: "Social media and portfolio destination links",
  },
];

export interface NavigationScreenProps {
  initialItems: NavigationItem[];
  createAction: (input: NavigationItemMutationInput) => Promise<ActionResult<NavigationItem>>;
  updateAction: (
    input: NavigationItemMutationInput & { id: string },
  ) => Promise<ActionResult<NavigationItem>>;
  deleteAction: (id: string) => Promise<ActionResult<{ id: string }>>;
  reorderAction: (ids: string[]) => Promise<ActionResult>;
}

export function NavigationScreen({
  initialItems,
  createAction,
  updateAction,
  deleteAction,
  reorderAction,
}: NavigationScreenProps) {
  const [items, setItems] = useState<NavigationItem[]>(initialItems);
  const [editingItem, setEditingItem] = useState<NavigationItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State
  const [label, setLabel] = useState("");
  const [href, setHref] = useState("");
  const [placement, setPlacement] = useState<NavigationPlacement>("header");
  const [isVisible, setIsVisible] = useState(true);
  const [targetBlank, setTargetBlank] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function openCreate(p: NavigationPlacement) {
    setEditingItem(null);
    setLabel("");
    setHref("");
    setPlacement(p);
    setIsVisible(true);
    setTargetBlank(false);
    setFieldErrors({});
    setFormError(null);
    setIsCreating(true);
  }

  function openEdit(item: NavigationItem) {
    setEditingItem(item);
    setLabel(item.label);
    setHref(item.href);
    setPlacement(item.placement);
    setIsVisible(item.isVisible);
    setTargetBlank(item.targetBlank);
    setFieldErrors({});
    setFormError(null);
    setIsCreating(false);
  }

  function closeModal() {
    setEditingItem(null);
    setIsCreating(false);
    setFieldErrors({});
    setFormError(null);
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setFieldErrors({});
    setFormError(null);

    const payload: NavigationItemMutationInput = {
      label: label.trim(),
      href: href.trim(),
      placement,
      sortOrder: editingItem
        ? editingItem.sortOrder
        : items.filter((i) => i.placement === placement).length,
      isVisible,
      targetBlank,
    };

    if (editingItem) {
      const result = await updateAction({ ...payload, id: editingItem.id });
      setIsSubmitting(false);
      if (result.ok) {
        if (result.data) {
          setItems((prev) =>
            prev.map((item) => (item.id === result.data!.id ? result.data! : item)),
          );
        }
        toast.success("Navigation item updated.");
        closeModal();
      } else {
        if (result.fieldErrors) setFieldErrors(result.fieldErrors);
        if (result.formError) setFormError(result.formError);
        toast.error(result.formError ?? "Could not update item.");
      }
    } else {
      const result = await createAction(payload);
      setIsSubmitting(false);
      if (result.ok) {
        if (result.data) {
          setItems((prev) => [...prev, result.data!]);
        }
        toast.success("Navigation item created.");
        closeModal();
      } else {
        if (result.fieldErrors) setFieldErrors(result.fieldErrors);
        if (result.formError) setFormError(result.formError);
        toast.error(result.formError ?? "Could not create item.");
      }
    }
  }

  async function confirmDelete() {
    if (!deletingId) return;
    const id = deletingId;
    setDeletingId(null);

    const result = await deleteAction(id);
    if (result.ok) {
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast.success("Navigation item removed.");
    } else {
      toast.error(result.formError ?? "Could not delete item.");
    }
  }

  async function handleReorder(placement: NavigationPlacement, reorderedItems: NavigationItem[]) {
    const updated = items.map((item) => {
      if (item.placement !== placement) return item;
      const idx = reorderedItems.findIndex((r) => r.id === item.id);
      return idx >= 0 ? reorderedItems[idx]! : item;
    });
    setItems(updated);

    const ids = reorderedItems.map((i) => i.id);
    const result = await reorderAction(ids);
    if (result.ok) {
      toast.success("Navigation order updated.");
    } else {
      toast.error(result.formError ?? "Could not reorder items.");
    }
  }

  return (
    <div className="space-y-12">
      <header className="border-line rule-hairline pb-8">
        <p className="type-meta text-foreground-muted">Structure</p>
        <h1 className="font-display desktop:text-7xl mt-4 text-5xl leading-none tracking-tight">
          Navigation Menus
        </h1>
        <p className="type-spec text-foreground-muted mt-4 max-w-2xl">
          Manage header links, footer colophon links, and social menu destinations. Drag or use
          keyboard to reorder.
        </p>
      </header>

      {PLACEMENTS.map((group) => {
        const groupItems = items
          .filter((i) => i.placement === group.value)
          .sort((a, b) => a.sortOrder - b.sortOrder);

        return (
          <section
            key={group.value}
            aria-labelledby={`nav-group-${group.value}`}
            className="border-line bg-surface tablet:p-8 border p-6"
          >
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h2
                  id={`nav-group-${group.value}`}
                  className="font-display tablet:text-3xl text-2xl"
                >
                  {group.label}
                </h2>
                <p className="type-meta text-foreground-muted mt-1">{group.description}</p>
              </div>
              <button
                type="button"
                onClick={() => openCreate(group.value)}
                className="border-line-strong type-meta hover:bg-ink hover:text-warm-white border px-4 py-2 text-xs transition-colors"
              >
                + Add link
              </button>
            </div>

            <div className="mt-6">
              {groupItems.length === 0 ? (
                <p className="type-spec text-foreground-muted py-4">
                  No items configured in {group.label.toLowerCase()}.
                </p>
              ) : (
                <SortableList
                  items={groupItems}
                  getItemId={(item) => item.id}
                  onReorder={(newOrder) => handleReorder(group.value, newOrder)}
                  renderItem={(item, helpers) => (
                    <div className="border-line bg-canvas flex w-full items-center justify-between gap-4 border p-3">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          ref={helpers.setActivatorNodeRef}
                          {...helpers.attributes}
                          {...helpers.listeners}
                          aria-label={`Move ${item.label}`}
                          className="border-line-strong type-meta hover:bg-ink hover:text-warm-white inline-flex min-h-9 items-center justify-center border px-2.5 text-xs transition-colors"
                        >
                          ↕
                        </button>
                        <span className="type-spec font-medium">{item.label}</span>
                        <code className="text-foreground-muted font-mono text-xs">{item.href}</code>
                      </div>
                      <div className="flex items-center gap-3">
                        {!item.isVisible && (
                          <span className="type-meta text-foreground-muted bg-line px-2 py-0.5 text-xs">
                            Hidden
                          </span>
                        )}
                        {item.targetBlank && (
                          <span className="type-meta text-foreground-muted text-xs">
                            ↗ External
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => openEdit(item)}
                          className="border-line-strong type-meta hover:bg-surface border px-3 py-1 text-xs"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingId(item.id)}
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
        );
      })}

      {/* Edit / Create Modal */}
      {(isCreating || editingItem) && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={editingItem ? "Edit navigation item" : "Create navigation item"}
          className="bg-ink/50 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xs"
        >
          <div className="border-line bg-canvas tablet:p-8 w-full max-w-lg border p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-4">
              <h2 className="font-display text-2xl">
                {editingItem ? "Edit Navigation Link" : "Add Navigation Link"}
              </h2>
              <button
                type="button"
                onClick={closeModal}
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

            <form onSubmit={handleFormSubmit} className="mt-6 space-y-4">
              <FormField id="nav-label" label="Link Label" errors={fieldErrors.label}>
                <TextInput
                  id="nav-label"
                  value={label}
                  onValueChange={setLabel}
                  required
                  placeholder="e.g. Work, About, Contact"
                />
              </FormField>

              <FormField
                id="nav-href"
                label="Destination URL (Internal path or external link)"
                errors={fieldErrors.href}
              >
                <TextInput
                  id="nav-href"
                  value={href}
                  onValueChange={setHref}
                  required
                  placeholder="e.g. /projects or https://..."
                />
              </FormField>

              <FormField id="nav-placement" label="Placement">
                <select
                  id="nav-placement"
                  value={placement}
                  onChange={(e) => setPlacement(e.target.value as NavigationPlacement)}
                  className="border-line focus:border-foreground w-full border bg-transparent p-3 text-base outline-none"
                >
                  {PLACEMENTS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </FormField>

              <div className="space-y-2 pt-2">
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={isVisible}
                    onChange={(e) => setIsVisible(e.target.checked)}
                    className="border-line h-4 w-4 rounded"
                  />
                  <span className="type-meta">Visible on public site</span>
                </label>

                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={targetBlank}
                    onChange={(e) => setTargetBlank(e.target.checked)}
                    className="border-line h-4 w-4 rounded"
                  />
                  <span className="type-meta">
                    Open in new tab (<code>target=&quot;_blank&quot;</code>)
                  </span>
                </label>
              </div>

              <div className="flex justify-end gap-3 border-t pt-6">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={closeModal}
                  className="border-line-strong type-meta hover:bg-surface border px-5 py-2.5 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  aria-busy={isSubmitting}
                  className="bg-ink text-warm-white hover:bg-foreground-muted type-meta px-5 py-2.5 text-xs"
                >
                  {isSubmitting ? "Saving..." : editingItem ? "Save changes" : "Create link"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={Boolean(deletingId)}
        title="Remove Navigation Link"
        description="Are you sure you want to remove this navigation item? Visitors will no longer see it in the menu."
        confirmLabel="Remove link"
        destructive
        onConfirm={confirmDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
}
