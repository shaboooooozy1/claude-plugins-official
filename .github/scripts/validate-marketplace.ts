#!/usr/bin/env bun
/**
 * Validates marketplace.json: well-formed JSON, plugins array present,
 * each entry has required fields, and no duplicate plugin names.
 *
 * Usage:
 *   bun validate-marketplace.ts <path-to-marketplace.json>
 */

import { readFile, readdir } from "fs/promises";
import { dirname, join, resolve } from "path";

/**
 * Checks that every stdio MCP server launcher in external_plugins/*\/.mcp.json
 * pins the code it runs: no `@latest`, no version-less `npx` package, no
 * `git+` source without a 40-hex commit, and no docker image without a
 * `@sha256:` digest. Servers that run repo-local code (`${CLAUDE_PLUGIN_ROOT}`)
 * and remote http/sse servers are skipped.
 */
async function validateMcpLaunchers(repoRoot: string): Promise<string[]> {
  const errors: string[] = [];
  const pluginsDir = join(repoRoot, "external_plugins");
  let dirs: string[];
  try {
    dirs = await readdir(pluginsDir);
  } catch {
    return errors;
  }
  for (const dir of dirs.sort()) {
    const mcpPath = join(pluginsDir, dir, ".mcp.json");
    let content: string;
    try {
      content = await readFile(mcpPath, "utf-8");
    } catch {
      continue;
    }
    const rel = `external_plugins/${dir}/.mcp.json`;
    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch (err) {
      errors.push(`${rel}: not valid JSON: ${err instanceof Error ? err.message : err}`);
      continue;
    }
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      errors.push(`${rel}: must be a JSON object`);
      continue;
    }
    const top = parsed as Record<string, unknown>;
    const servers =
      top.mcpServers && typeof top.mcpServers === "object" && !Array.isArray(top.mcpServers)
        ? (top.mcpServers as Record<string, unknown>)
        : top;
    for (const [name, value] of Object.entries(servers)) {
      if (!value || typeof value !== "object" || Array.isArray(value)) continue;
      const server = value as Record<string, unknown>;
      if (typeof server.command !== "string") continue; // http / sse servers
      const command = server.command;
      const args = Array.isArray(server.args)
        ? server.args.filter((a): a is string => typeof a === "string")
        : [];
      if (args.some((a) => a.includes("${CLAUDE_PLUGIN_ROOT}"))) continue; // repo-local code
      const where = `${rel} (${name})`;
      for (const a of args) {
        if (/@latest(\b|$)/.test(a)) {
          errors.push(`${where}: "${a}" uses a floating @latest tag; pin an exact version`);
        }
        if (a.startsWith("git+") && !/@[0-9a-f]{40}$/.test(a)) {
          errors.push(`${where}: "${a}" must pin a 40-hex commit (git+<url>@<sha>)`);
        }
      }
      if (command === "npx") {
        const pkg = args.find((a) => !a.startsWith("-"));
        if (pkg !== undefined && !/^(@[^/]+\/)?[^@]+@\d/.test(pkg)) {
          errors.push(`${where}: npx package "${pkg}" must pin an exact version (<pkg>@<version>)`);
        }
      }
      if (command === "docker") {
        const runIdx = args.indexOf("run");
        if (runIdx !== -1) {
          // The image is the first positional argument after `run`; every
          // option that takes a value in this repo is passed as a separate arg.
          const valueOpts = new Set(["-e", "--env", "-v", "--volume", "-p", "--publish", "--name", "--network", "-w", "--workdir", "-u", "--user", "--env-file", "--platform", "--entrypoint"]);
          let image: string | undefined;
          for (let i = runIdx + 1; i < args.length; i++) {
            const a = args[i];
            if (valueOpts.has(a)) {
              i++;
              continue;
            }
            if (a.startsWith("-")) continue;
            image = a;
            break;
          }
          if (image !== undefined && !/@sha256:[0-9a-f]{64}$/.test(image)) {
            errors.push(`${where}: docker image "${image}" must be pinned by digest (<image>:<tag>@sha256:<digest>)`);
          }
        }
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

  // marketplace.json lives in <repo>/.claude-plugin/, so the repo root is two levels up.
  const repoRoot = resolve(dirname(dirname(resolve(filePath))));
  const mcpErrors = await validateMcpLaunchers(repoRoot);
  if (mcpErrors.length) {
    console.error(`ERROR: ${mcpErrors.length} unpinned MCP server launcher(s) in external_plugins/*/.mcp.json:`);
    for (const e of mcpErrors) console.error(`  - ${e}`);
    process.exit(1);
  }

  console.log(
    `OK: ${marketplace.plugins.length} plugins, no duplicates, all required fields present, all external sources sha-pinned, MCP launchers pinned`
  );
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(2);
});
