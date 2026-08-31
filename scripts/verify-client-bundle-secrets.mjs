#!/usr/bin/env node
/**
 * DEP-004 — proves the Supabase secret key never reaches the browser.
 *
 * Vercel injects `SUPABASE_SECRET_KEY` into every deployment because the public
 * inquiry server action needs it, so "the secret stays server-side" has to be a
 * property of the build output rather than a code-review opinion. This scans
 * every asset Next.js serves to the browser — `.next/static`, source maps
 * included — for the configured key and for anything key-shaped that would
 * surface a leak in a build made with placeholder credentials, as CI does.
 *
 * Usage: node scripts/verify-client-bundle-secrets.mjs [--dir .next/static]
 */

import { Buffer } from "node:buffer";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

/** Everything under this directory is served verbatim to the browser. */
export const CLIENT_ASSET_DIR = ".next/static";

/** JWT-shaped tokens, capturing the payload segment for role inspection. */
const JWT_PATTERN = /eyJ[A-Za-z0-9_-]{8,}\.(eyJ[A-Za-z0-9_-]{8,})\.[A-Za-z0-9_-]{8,}/g;

/** @param {string} value */
function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Patterns that must not match a browser-served asset. The configured key is
 * the exact check; the others hold when the build ran without a real key.
 *
 * `sb_secret_` deliberately requires trailing key material: `@supabase/supabase-js`
 * ships the bare literal as a key-format predicate, which is not a leak.
 *
 * @param {Record<string, string | undefined>} [env]
 * @returns {{ label: string, pattern: RegExp }[]}
 */
export function secretPatterns(env = process.env) {
  const patterns = [
    { label: "Supabase secret key (sb_secret_…)", pattern: /sb_secret_[A-Za-z0-9_-]{8,}/ },
    { label: "server-only env var name", pattern: /SUPABASE_SECRET_KEY/ },
  ];

  const configured = env.SUPABASE_SECRET_KEY?.trim();
  if (configured) {
    patterns.push({
      label: "configured SUPABASE_SECRET_KEY value",
      pattern: new RegExp(escapeRegExp(configured)),
    });
  }

  return patterns;
}

/**
 * Finds legacy Supabase keys that claim the `service_role`. The publishable and
 * anon keys are also JWTs and legitimately ship to the browser, so the role
 * claim — not the JWT shape — is what separates a leak from normal output.
 *
 * @param {string} contents
 * @returns {string[]}
 */
export function findServiceRoleTokens(contents) {
  const hits = [];

  for (const match of contents.matchAll(JWT_PATTERN)) {
    const payload = match[1];
    if (!payload) continue;

    let decoded;
    try {
      decoded = Buffer.from(payload, "base64url").toString("utf8");
    } catch {
      continue;
    }

    if (/"role"\s*:\s*"service_role"/.test(decoded)) {
      hits.push(match[0]);
    }
  }

  return hits;
}

/**
 * Recursively lists every file under `dir`; an absent directory yields none.
 *
 * @param {string} dir
 * @returns {Promise<string[]>}
 */
export async function collectAssets(dir) {
  let entries;

  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }

  const nested = await Promise.all(
    entries.map((entry) => {
      const entryPath = path.join(dir, entry.name);
      return entry.isDirectory() ? collectAssets(entryPath) : [entryPath];
    }),
  );

  return nested.flat().sort();
}

/**
 * Scans one build output tree and returns every hit it contains.
 *
 * @param {{ dir?: string, env?: Record<string, string | undefined> }} [options]
 * @returns {Promise<{ files: string[], violations: { file: string, label: string }[] }>}
 */
export async function scanClientAssets({ dir = CLIENT_ASSET_DIR, env = process.env } = {}) {
  const patterns = secretPatterns(env);
  const files = await collectAssets(dir);
  /** @type {{ file: string, label: string }[]} */
  const violations = [];

  for (const file of files) {
    const contents = await readFile(file, "utf8");

    for (const { label, pattern } of patterns) {
      if (pattern.test(contents)) {
        violations.push({ file, label });
      }
    }

    if (findServiceRoleTokens(contents).length > 0) {
      violations.push({ file, label: "legacy key with a service_role claim" });
    }
  }

  return { files, violations };
}

/**
 * @param {string[]} argv
 * @returns {Promise<number>}
 */
async function main(argv) {
  const dirFlag = argv.indexOf("--dir");
  const dir = dirFlag === -1 ? CLIENT_ASSET_DIR : argv[dirFlag + 1];

  if (!dir) {
    console.error("verify-client-bundle-secrets: --dir requires a path.");
    return 2;
  }

  const { files, violations } = await scanClientAssets({ dir });

  // An empty tree would otherwise report a vacuous pass.
  if (files.length === 0) {
    console.error(
      `verify-client-bundle-secrets: no client assets under ${dir}. Run \`npm run build\` first.`,
    );
    return 2;
  }

  if (violations.length > 0) {
    console.error(
      `verify-client-bundle-secrets: secret material found in ${violations.length} client asset(s).`,
    );
    for (const violation of violations) {
      console.error(`  ${violation.file} — ${violation.label}`);
    }
    return 1;
  }

  console.log(
    `verify-client-bundle-secrets: scanned ${files.length} client assets under ${dir}; no secret material found.`,
  );
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = await main(process.argv.slice(2));
}
