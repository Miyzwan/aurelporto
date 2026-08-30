"use server";

import { revalidatePath } from "next/cache";
import * as z from "zod";

import type { ActionResult } from "@/components/admin/action-result";
import { requireAdmin } from "@/lib/auth/require-admin";
import { mapNavigationItem } from "@/lib/data/site";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { uuidSchema } from "@/lib/validation/common";
import { navigationItemFormSchema } from "@/lib/validation/site";
import type { NavigationItem, NavigationItemMutationInput } from "@/types/content";

function fieldErrors(error: z.ZodError): Record<string, string[]> {
  return error.issues.reduce<Record<string, string[]>>((errors, issue) => {
    const field = issue.path[0];
    if (typeof field !== "string") return errors;
    errors[field] = [...(errors[field] ?? []), issue.message];
    return errors;
  }, {});
}

export async function createNavigationItem(
  input: NavigationItemMutationInput,
): Promise<ActionResult<NavigationItem>> {
  const dbPayload = {
    label: input.label,
    href: input.href,
    placement: input.placement,
    sort_order: input.sortOrder ?? 0,
    is_visible: input.isVisible ?? true,
    target_blank: input.targetBlank ?? false,
  };

  const parsed = navigationItemFormSchema.safeParse(dbPayload);
  if (!parsed.success) {
    return { ok: false, fieldErrors: fieldErrors(parsed.error) };
  }

  try {
    await requireAdmin();
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("navigation_items")
      .insert(parsed.data)
      .select("*")
      .single();

    if (error || !data) {
      console.error("[createNavigationItem] insertion failed:", error);
      return { ok: false, formError: "Could not create navigation item." };
    }

    revalidatePath("/", "layout");
    revalidatePath("/admin/navigation");

    return {
      ok: true,
      data: mapNavigationItem(data),
      message: "Navigation item created.",
    };
  } catch (error) {
    console.error("[createNavigationItem] unexpected error:", error);
    return { ok: false, formError: "Could not create navigation item." };
  }
}

export async function updateNavigationItem(
  input: NavigationItemMutationInput & { id: string },
): Promise<ActionResult<NavigationItem>> {
  const idParsed = uuidSchema.safeParse(input.id);
  if (!idParsed.success) {
    return { ok: false, formError: "Invalid navigation item identifier." };
  }

  const dbPayload = {
    label: input.label,
    href: input.href,
    placement: input.placement,
    sort_order: input.sortOrder,
    is_visible: input.isVisible,
    target_blank: input.targetBlank,
  };

  const parsed = navigationItemFormSchema.safeParse(dbPayload);
  if (!parsed.success) {
    return { ok: false, fieldErrors: fieldErrors(parsed.error) };
  }

  try {
    await requireAdmin();
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("navigation_items")
      .update(parsed.data)
      .eq("id", idParsed.data)
      .select("*")
      .single();

    if (error || !data) {
      console.error("[updateNavigationItem] update failed:", error);
      return { ok: false, formError: "Could not update navigation item." };
    }

    revalidatePath("/", "layout");
    revalidatePath("/admin/navigation");

    return {
      ok: true,
      data: mapNavigationItem(data),
      message: "Navigation item updated.",
    };
  } catch (error) {
    console.error("[updateNavigationItem] unexpected error:", error);
    return { ok: false, formError: "Could not update navigation item." };
  }
}

export async function deleteNavigationItem(id: string): Promise<ActionResult<{ id: string }>> {
  const idParsed = uuidSchema.safeParse(id);
  if (!idParsed.success) {
    return { ok: false, formError: "Invalid navigation item identifier." };
  }

  try {
    await requireAdmin();
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.from("navigation_items").delete().eq("id", idParsed.data);

    if (error) {
      console.error("[deleteNavigationItem] deletion failed:", error);
      return { ok: false, formError: "Could not delete navigation item." };
    }

    revalidatePath("/", "layout");
    revalidatePath("/admin/navigation");

    return {
      ok: true,
      data: { id: idParsed.data },
      message: "Navigation item deleted.",
    };
  } catch (error) {
    console.error("[deleteNavigationItem] unexpected error:", error);
    return { ok: false, formError: "Could not delete navigation item." };
  }
}

export async function reorderNavigationItems(ids: string[]): Promise<ActionResult> {
  const idsParsed = z.array(uuidSchema).safeParse(ids);
  if (!idsParsed.success) {
    return { ok: false, formError: "Invalid navigation item identifiers." };
  }

  try {
    await requireAdmin();
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.rpc("reorder_navigation_items", {
      item_ids: idsParsed.data,
    });

    if (error) {
      console.error("[reorderNavigationItems] RPC failed:", error);
      return { ok: false, formError: "Could not reorder navigation items." };
    }

    revalidatePath("/", "layout");
    revalidatePath("/admin/navigation");

    return { ok: true, message: "Navigation order updated." };
  } catch (error) {
    console.error("[reorderNavigationItems] unexpected error:", error);
    return { ok: false, formError: "Could not reorder navigation items." };
  }
}
