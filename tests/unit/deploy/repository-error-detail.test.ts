import { describe, expect, it } from "vitest";

import { RepositoryError } from "@/lib/data/errors";

// A production build failed with only "Could not read site settings", which could
// not distinguish a wrong API key from a missing table or a denied grant. Supabase
// returns plain objects, so the detail has to be folded into the message itself.
describe("RepositoryError diagnostics", () => {
  it("names the Supabase code, message, and hint", () => {
    const error = new RepositoryError("database", "site settings", {
      code: "42P01",
      message: 'relation "public.site_settings" does not exist',
      hint: "Check the search_path.",
    });

    expect(error.message).toContain("Could not read site settings.");
    expect(error.message).toContain("[42P01]");
    expect(error.message).toContain('relation "public.site_settings" does not exist');
    expect(error.message).toContain("hint: Check the search_path.");
  });

  it("surfaces an invalid API key distinctly from a missing relation", () => {
    const error = new RepositoryError("database", "navigation items", {
      message: "Invalid API key",
    });

    expect(error.message).toBe("Could not read navigation items. Invalid API key");
  });

  it("stays stable when there is no usable cause", () => {
    expect(new RepositoryError("database", "pages").message).toBe("Could not read pages.");
    expect(new RepositoryError("not_found", "pages").message).toBe("pages was not found.");
  });

  it("keeps an Error cause attached for stack inspection", () => {
    const cause = new Error("socket hang up");
    expect(new RepositoryError("database", "pages", cause).cause).toBe(cause);
  });
});
