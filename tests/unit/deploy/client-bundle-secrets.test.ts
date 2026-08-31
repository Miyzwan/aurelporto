import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  findServiceRoleTokens,
  scanClientAssets,
  secretPatterns,
} from "../../../scripts/verify-client-bundle-secrets.mjs";

/** Builds an unsigned JWT with the given payload, as a Supabase legacy key looks. */
function jwt(payload: Record<string, string>): string {
  const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString("base64url");
  return `${encode({ alg: "HS256", typ: "JWT" })}.${encode(payload)}.c2lnbmF0dXJlLXBsYWNlaG9sZGVy`;
}

// DEP-004 acceptance criterion: the Supabase secret key must be absent from the
// client bundle and its source maps. These tests prove the scanner that guards
// that criterion detects a real leak and tolerates the library code that
// legitimately mentions the key format.
describe("client bundle secret scan (DEP-004)", () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(path.join(tmpdir(), "client-assets-"));
    await mkdir(path.join(dir, "chunks"), { recursive: true });
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it("includes the configured secret value among its patterns", () => {
    const patterns = secretPatterns({ SUPABASE_SECRET_KEY: "sb_secret_live.value+1" });

    expect(patterns.some((entry) => entry.pattern.test("x sb_secret_live.value+1 y"))).toBe(true);
  });

  it("passes a build output that only ships publishable credentials", async () => {
    await writeFile(
      path.join(dir, "chunks", "app.js"),
      'const url="https://project.supabase.co",key="sb_publishable_browser_safe";',
      "utf8",
    );

    const result = await scanClientAssets({ dir, env: {} });

    expect(result.files).toHaveLength(1);
    expect(result.violations).toEqual([]);
  });

  // The supabase-js bundle contains this literal as a key-format predicate.
  it("does not flag the bare sb_secret_ prefix used as a format check", async () => {
    await writeFile(
      path.join(dir, "chunks", "supabase.js"),
      'const isSecret=e=>e.startsWith("sb_publishable_")||e.startsWith("sb_secret_");',
      "utf8",
    );

    const { violations } = await scanClientAssets({ dir, env: {} });

    expect(violations).toEqual([]);
  });

  it("flags a secret key inlined into a client chunk", async () => {
    await writeFile(
      path.join(dir, "chunks", "app.js"),
      'const admin="sb_secret_leaked_into_browser";',
      "utf8",
    );

    const { violations } = await scanClientAssets({ dir, env: {} });

    expect(violations).toHaveLength(1);
    expect(violations[0]?.label).toBe("Supabase secret key (sb_secret_…)");
    expect(violations[0]?.file).toContain("app.js");
  });

  it("flags a configured secret that only leaks through a source map", async () => {
    await writeFile(path.join(dir, "chunks", "app.js"), "const a=1;", "utf8");
    await writeFile(
      path.join(dir, "chunks", "app.js.map"),
      '{"sourcesContent":["const admin = \\"sb_secret_from_env\\";"]}',
      "utf8",
    );

    const { violations } = await scanClientAssets({
      dir,
      env: { SUPABASE_SECRET_KEY: "sb_secret_from_env" },
    });

    expect(violations.map((violation) => violation.file)).toContain(
      path.join(dir, "chunks", "app.js.map"),
    );
  });

  it("separates a legacy service_role key from the anon key beside it", () => {
    const anonKey = jwt({ role: "anon", iss: "supabase" });
    const serviceKey = jwt({ role: "service_role", iss: "supabase" });

    expect(findServiceRoleTokens(`const k="${anonKey}";`)).toEqual([]);
    expect(findServiceRoleTokens(`const k="${serviceKey}";`)).toEqual([serviceKey]);
  });

  it("flags a legacy service_role key found in a client chunk", async () => {
    await writeFile(
      path.join(dir, "chunks", "app.js"),
      `const admin="${jwt({ role: "service_role" })}";`,
      "utf8",
    );

    const { violations } = await scanClientAssets({ dir, env: {} });

    expect(violations).toHaveLength(1);
    expect(violations[0]?.label).toBe("legacy key with a service_role claim");
  });

  it("reports no files for a missing build output so the CLI can fail loudly", async () => {
    const { files, violations } = await scanClientAssets({
      dir: path.join(dir, "never-built"),
      env: {},
    });

    expect(files).toEqual([]);
    expect(violations).toEqual([]);
  });
});
