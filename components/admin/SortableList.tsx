"use client";

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DraggableSyntheticListeners,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { CSSProperties, ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

export interface SortableItemRenderProps {
  attributes: ReturnType<typeof useSortable>["attributes"];
  listeners: DraggableSyntheticListeners;
  setActivatorNodeRef: (element: HTMLElement | null) => void;
  isDragging: boolean;
  isSorting: boolean;
}

export interface SortableListProps<T> {
  items: readonly T[];
  getItemId: (item: T) => UniqueIdentifier;
  onReorder: (items: T[]) => void;
  renderItem: (item: T, helpers: SortableItemRenderProps) => ReactNode;
  ariaLabel?: string;
  emptyState?: ReactNode;
  disabled?: boolean;
  className?: string;
}

interface SortableRowProps<T> {
  item: T;
  id: UniqueIdentifier;
  renderItem: SortableListProps<T>["renderItem"];
  disabled: boolean;
}

function SortableRow<T>({ item, id, renderItem, disabled }: SortableRowProps<T>) {
  const {
    attributes,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isSorting,
  } = useSortable({ id, disabled });
  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li ref={setNodeRef} style={style} className={cn(isDragging && "relative z-10 opacity-70")}>
      {renderItem(item, {
        attributes,
        listeners,
        setActivatorNodeRef,
        isDragging,
        isSorting,
      })}
    </li>
  );
}

export function SortableList<T>({
  items,
  getItemId,
  onReorder,
  renderItem,
  ariaLabel = "Sortable list",
  emptyState = "No items yet.",
  disabled = false,
  className,
}: SortableListProps<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const itemIds = items.map(getItemId);

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (disabled || !over || active.id === over.id) return;

    const oldIndex = itemIds.indexOf(active.id);
    const newIndex = itemIds.indexOf(over.id);
    if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return;

    onReorder(arrayMove([...items], oldIndex, newIndex));
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      accessibility={{
        screenReaderInstructions: {
          draggable:
            "To reorder this item, press Space. Use the arrow keys to move it, then press Space again to drop it.",
        },
      }}
    >
      <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
        {items.length > 0 ? (
          <ul aria-label={ariaLabel} className={cn("flex flex-col gap-3", className)}>
            {items.map((item) => {
              const id = getItemId(item);

              return (
                <SortableRow
                  key={id}
                  item={item}
                  id={id}
                  renderItem={renderItem}
                  disabled={disabled}
                />
              );
            })}
          </ul>
        ) : (
          <p className={cn("type-spec text-foreground-muted", className)}>{emptyState}</p>
        )}
      </SortableContext>
    </DndContext>
  );
}
