import { describe, expect, it } from "vitest";

import pkg from "../../package.json";

const REQUIRED_SCRIPTS = [
  "dev",
  "build",
  "start",
  "lint",
  "typecheck",
  "test",
  "test:watch",
  "test:e2e",
  "format:check",
] as const;

// The master plan §9 defines these as the global verification commands. If a
// script disappears, every downstream task's "Verify" block silently breaks.
describe("verification tooling contract", () => {
  it.each(REQUIRED_SCRIPTS)("exposes the %s script", (script) => {
    expect(pkg.scripts).toHaveProperty(script);
  });

  it("pins next to the version required by the master plan", () => {
    expect(pkg.dependencies.next).toBe("16.3.3");
  });

  it("does not depend on the legacy supabase auth helpers", () => {
    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
    expect(allDeps).not.toHaveProperty("@supabase/auth-helpers-nextjs");
  });
});
