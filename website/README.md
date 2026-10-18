# Rust / AI Learning Studio

An English Rust learning site with responsive lessons, per-account progress, offline edit backups, and read-only tutor context tools. The website makes no OpenAI model API calls and needs no API key. Teaching and code review happen in the existing ChatGPT/Codex conversation.

## Architecture

The course catalog now contains 22 sessions: 12 core and 10 advanced optimization sessions, approximately 196 hours, 16 labs and two capstones. `build.py` generates shared session limits for the browser, backend validation, and MCP schema from that catalog. Existing learning records retain their original session IDs and version; no database migration is needed to add the new sessions.

- Original HTML/CSS/JavaScript learning UI, retained across the full-stack migration.
- Vinext/Cloudflare Worker API routes using platform-owned ChatGPT identity.
- D1 stores each user’s learning state under their Site-scoped user ID.
- Field-level changes use base-value conflict detection and an atomic revision check. Independent edits merge; overlapping edits require a user choice.
- Browser outbox is scoped to the verified account, retries on reconnect, and retains pending edits across refresh. Sync runs on edits, return to the tab, and a 30-second foreground interval.
- Existing unscoped browser progress is imported only through the explicit migration button. Existing nonempty account notes take priority during that merge.
- `POST /mcp` exposes three read-only tools: active learning context, a selected session, and progress. Data calls require an authenticated user; discovery contains no learner data.

## Build and local development

Requires Node 22.13+ and Python with the `markdown` package. Use the Sites skill’s dependency installer and build workflow. Regenerate course assets before building:

```powershell
python build.py
npm run db:generate   # only after changing schema
npm run build
npm run dev
```

After the first build, apply the generated migration to local D1 using the starter instructions. The local preview at `http://127.0.0.1:5173` has a loopback-only simulated ChatGPT sign-in. That mock identity is excluded from production. Hosted authentication is supplied by Sites.

`build.py` writes `public/` from the source course documents. The root HTML is served by `app/route.ts`. The Worker build writes `dist/`. Keep deployment identity in `.openai/hosting.json`; preserve the private audience. Generated schema migrations are committed and applied by Sites at deployment.

## Checks

```powershell
node --test tests/learning.test.mjs
node tests/http.test.mjs  # local dev server and migrated local DB required
npx tsc --noEmit
```

Tests cover independent edits, same-field conflicts, idempotent replay, completion undo, invalid fields, authenticated persistence, cross-origin rejection, and MCP authorization/context. The HTTP test edits and restores only a local test note. It never calls a model or writes to hosted learner data.

The prior responsive layout is retained: 16px mobile reading/input text, 44px controls, bounded code/table scrolling, safe-area padding, and accessible navigation. Physical phone testing remains separate from viewport simulations.

## Connect the tutor in chat

After publishing, install/connect the Site’s generated plugin under **Plugins → Personal → Created by you**. Use the same account as the website. Ask the tutor to read your current Rust session context. A successful hosting deployment does not establish that connection; verify an actual authenticated tool call after connecting.

A complete session context packet can also be copied or downloaded from **Work with me**, including lecture, lab contract, notes, and checkpoint answers. This fallback needs no plugin. The website cannot read separate ChatGPT conversation history and does not automatically monitor it.

## Data and limits

Notes are limited to 40,000 characters per session and checkpoint answers to 15,000 each; the complete account state is capped at 1 MB. The sync status reports pending, offline, and conflicting edits. Account sync needs connectivity; the site itself is not an offline PWA. Keep JSON/Markdown exports as portable backups. Signed-in data responses are private/no-store; account identity is never accepted from request payloads.
