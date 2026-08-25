#!/usr/bin/env bun
/**
 * Validates marketplace.json: well-formed JSON, plugins array present,
 * each entry has required fields, and no duplicate plugin names.
 *
 * Local entries (source is a "./path" string) are additionally checked to
 * resolve to a directory containing a valid .claude-plugin/plugin.json whose
 * "name" matches the marketplace entry, and every plugin directory in the
 * repository must be registered in the marketplace.
 *
 * Usage:
 *   bun validate-marketplace.ts <path-to-marketplace.json>
 */

import { readdir, readFile, stat } from "fs/promises";
import { dirname, join, resolve } from "path";

const PLUGIN_DIRS = ["plugins", "external_plugins"];

async function isDirectory(path: string): Promise<boolean> {
  try {
    return (await stat(path)).isDirectory();
  } catch {
    return false;
  }
}

/**
 * Validates a local plugin directory referenced by a marketplace entry.
 * Returns a list of error messages (empty when the directory is valid).
 */
async function validateLocalPlugin(
  repoRoot: string,
  entryName: string,
  source: string
): Promise<string[]> {
  const errors: string[] = [];
  const pluginDir = resolve(repoRoot, source);

  if (!(await isDirectory(pluginDir))) {
    errors.push(`${entryName}: source "${source}" is not a directory`);
    return errors;
  }

  const manifestPath = join(pluginDir, ".claude-plugin", "plugin.json");
  let raw: string;
  try {
    raw = await readFile(manifestPath, "utf-8");
  } catch {
    errors.push(`${entryName}: missing ${source}/.claude-plugin/plugin.json`);
    return errors;
  }

  let manifest: unknown;
  try {
    manifest = JSON.parse(raw);
  } catch (err) {
    errors.push(
      `${entryName}: ${source}/.claude-plugin/plugin.json is not valid JSON: ${err instanceof Error ? err.message : err}`
    );
    return errors;
  }

  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) {
    errors.push(
      `${entryName}: ${source}/.claude-plugin/plugin.json must be a JSON object`
    );
    return errors;
  }

  const name = (manifest as Record<string, unknown>).name;
  if (typeof name !== "string" || !name) {
    errors.push(
      `${entryName}: ${source}/.claude-plugin/plugin.json missing required "name" field`
    );
  } else if (name !== entryName) {
    errors.push(
      `${entryName}: plugin.json name "${name}" does not match marketplace entry name`
    );
  }

  return errors;
}

/**
 * Reports plugin directories present in the repository but absent from the
 * marketplace, so newly added plugins cannot silently go unregistered.
 */
async function findUnregisteredPlugins(
  repoRoot: string,
  registered: Set<string>
): Promise<string[]> {
  const errors: string[] = [];

  for (const base of PLUGIN_DIRS) {
    const baseDir = join(repoRoot, base);
    if (!(await isDirectory(baseDir))) continue;

    const entries = await readdir(baseDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const source = `./${base}/${entry.name}`;
      if (!registered.has(source)) {
        errors.push(`${source} is not registered in the marketplace`);
      }
    }
  }

  return errors;
}

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
  const localSources = new Set<string>();
  const required = ["name", "description", "source"] as const;
  const repoRoot = resolve(dirname(resolve(filePath)), "..");

  for (const [i, p] of marketplace.plugins.entries()) {
    if (!p || typeof p !== "object") {
      errors.push(`plugins[${i}]: must be an object`);
      continue;
    }
    const entry = p as Record<string, unknown>;
    for (const field of required) {
      if (!entry[field]) {
        errors.push(`plugins[${i}] (${entry.name ?? "?"}): missing required field "${field}"`);
      }
    }
    if (typeof entry.name === "string") {
      if (seen.has(entry.name)) {
        errors.push(`plugins[${i}]: duplicate plugin name "${entry.name}"`);
      }
      seen.add(entry.name);
    }
    if (typeof entry.source === "string" && typeof entry.name === "string") {
      localSources.add(entry.source);
      errors.push(
        ...(await validateLocalPlugin(repoRoot, entry.name, entry.source))
      );
    }
  }

  errors.push(...(await findUnregisteredPlugins(repoRoot, localSources)));

  if (errors.length) {
    console.error(`ERROR: ${filePath} has ${errors.length} validation error(s):`);
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }

  console.log(
    `OK: ${marketplace.plugins.length} plugins (${localSources.size} local), no duplicates, all required fields present, all local sources resolve`
  );
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(2);
});
