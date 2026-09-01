import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { inquiryConfigSchema } from "@/lib/validation/site";

const MIGRATION = path.join(
  process.cwd(),
  "supabase/migrations/20260901000000_bootstrap_site_settings_singleton.sql",
);

// Admins hold only select and update on site_settings, so this migration is the
// only way a hosted database can ever obtain the singleton. If its inquiry_config
// does not satisfy the app's schema, /contact fails validation in production.
describe("site_settings bootstrap migration", () => {
  const sql = readFileSync(MIGRATION, "utf8");

  it("inserts the singleton without overwriting an existing row", () => {
    expect(sql).toMatch(/insert into public\.site_settings/);
    expect(sql).toMatch(/on conflict \(id\) do nothing/);
  });

  it("ships an inquiry_config that satisfies the application schema", () => {
    const match = sql.match(/'(\{[\s\S]*?\})'::jsonb/);
    expect(match).not.toBeNull();

    const parsed = inquiryConfigSchema.safeParse(JSON.parse(match![1]!));
    expect(parsed.success).toBe(true);
  });

  it("fills every not-null column the table requires", () => {
    for (const column of [
      "site_name",
      "professional_role",
      "default_seo_title",
      "default_seo_description",
    ]) {
      expect(sql).toContain(column);
    }
  });
});
