#!/usr/bin/env bun
/**
 * Validates marketplace.json: well-formed JSON, plugins array present,
 * each entry has required fields, and no duplicate plugin names.
 *
 * Usage:
 *   bun validate-marketplace.ts <path-to-marketplace.json>
 */

import { readFile } from "fs/promises";

async function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error("Usage: validate-marketplace.ts <path-to-marketplace.json>");
    process.exit(2);
  }

  const content = await readFile(filePath, "utf-8");

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch (err) {
    console.error(
      `ERROR: ${filePath} is not valid JSON: ${err instanceof Error ? err.message : err}`
    );
    process.exit(1);
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    console.error(`ERROR: ${filePath} must be a JSON object`);
    process.exit(1);
  }

  const marketplace = parsed as Record<string, unknown>;
  if (!Array.isArray(marketplace.plugins)) {
    console.error(`ERROR: ${filePath} missing "plugins" array`);
    process.exit(1);
  }

  const errors: string[] = [];
  const seen = new Set<string>();
  const required = ["name", "description", "source"] as const;

  marketplace.plugins.forEach((p, i) => {
    if (!p || typeof p !== "object") {
      errors.push(`plugins[${i}]: must be an object`);
      return;
    }
    const entry = p as Record<string, unknown>;
    for (const field of required) {
      if (!entry[field]) {
        errors.push(`plugins[${i}] (${entry.name ?? "?"}): missing required field "${field}"`);
      }
    }
    // Every externally-hosted source must be pinned to an immutable commit.
    // Unpinned entries would resolve to whatever the upstream branch points
    // at when a user installs the plugin, so a compromised or repointed
    // upstream repo could ship arbitrary code under this marketplace's name.
    const src = entry.source;
    if (typeof src === "string") {
      if (!src.startsWith("./")) {
        errors.push(`plugins[${i}] (${entry.name ?? "?"}): string source must be a local "./" path`);
      }
    } else if (src && typeof src === "object" && !Array.isArray(src)) {
      const s = src as Record<string, unknown>;
      if (s.source === "github") {
        errors.push(
          `plugins[${i}] (${entry.name ?? "?"}): "github" shorthand cannot be pinned; use {"source":"url","url":"https://github.com/<org>/<repo>.git","sha":"<40-hex>"}`
        );
      } else if (typeof s.sha !== "string" || !/^[0-9a-f]{40}$/.test(s.sha)) {
        errors.push(
          `plugins[${i}] (${entry.name ?? "?"}): external source must pin a 40-char lowercase commit "sha"`
        );
      }
    }
    if (typeof entry.name === "string") {
      if (seen.has(entry.name)) {
        errors.push(`plugins[${i}]: duplicate plugin name "${entry.name}"`);
      }
      seen.add(entry.name);
    }
  });

  if (errors.length) {
    console.error(`ERROR: ${filePath} has ${errors.length} validation error(s):`);
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }

  console.log(
    `OK: ${marketplace.plugins.length} plugins, no duplicates, all required fields present, all external sources sha-pinned`
  );
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(2);
});
