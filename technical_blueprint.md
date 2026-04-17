# eleoro.com — Technical Blueprint

> **Purpose:** This document is the single source of truth for the eleoro.com migration and build project. Add it to the root of the repo. Start every new thread by pasting the relevant phase section plus the thread context block at the top.

---

## Roles and responsibilities

**Gemini CLI** is the builder. All file writes, shell commands, package installs, builds, and git operations are executed by Gemini CLI. Never ask Claude to write files or run commands directly.

**Claude (Cowork / Claude.ai)** is the architect and advisor. Claude reads the blueprint, plans each phase, produces the prompts Roberto pastes into Gemini CLI, validates output, and updates the blueprint. Claude does not write repo files or run terminal commands.

**Roberto** reviews all output visually before any commit is made. No phase is committed without explicit approval.

---

## Project overview

Migrating eleoro.com from a static HTML site hosted on GitHub Pages to a full-stack Astro application hosted on Cloudflare Pages, with a blog, client portal, SEO optimization, and AI discoverability — without changing any existing content, look & feel, or functionality.

**Live site:** https://eleoro.com  
**GitHub repo:** https://github.com/robertoanibal/eleoro (currently public — made private after Phase 7)  
**Owner:** Roberto Lopez (Co-Founder, eleoro)

---

## Decisions already made

| Topic | Decision | Reason |
|---|---|---|
| Hosting | Cloudflare Pages | Edge CDN, free tier, auto-deploy from GitHub |
| Framework | Astro (SSR via Cloudflare adapter) | Content collections for blog, server rendering for portal |
| CSS approach | Preserve existing CSS for homepage; Tailwind for new pages only | Zero risk of breaking homepage styles |
| Auth | Supabase magic link (email only) | No passwords, free tier, under 10 clients |
| Database + storage | Supabase (Postgres + Storage) | RLS, signed URLs, free tier sufficient |
| Automatic RLS | Enabled in Supabase dashboard | Auto-enables RLS on every new table, safety net |
| Blog | Astro Content Collections, MDX | No CMS needed, files in repo |
| Portal URL | eleoro.com/portal | Auth-gated, Cloudflare middleware |
| Repo visibility | Stay public until Phase 7 | GitHub Pages requires public repo on free plan |
| CSS optimization | Visual diff with Playwright before any commit | Previous attempt broke styles |
| Branch strategy | All work on `astro-migration`, never touch `main` until approved | Live site stays up throughout |
| File delivery | Supabase Storage, portal queries Storage directly | No separate files metadata table needed |
| File upload workflow | Gemini CLI + Supabase MCP or Claude UI + Supabase MCP | Upload from local folder or attach in chat |
| Portal data management | Claude UI + Supabase MCP for day-to-day, Gemini CLI + Supabase MCP for bulk | Natural language in chat for client updates |
| Supabase MCP | Connected to both Claude UI and Gemini CLI | Full flexibility — manage portal from either |

---

## Tech stack

```
Frontend:       Astro 4.x, TypeScript strict mode
Styling:        Existing global.css (homepage) + Tailwind CSS (blog, portal)
Auth:           @supabase/ssr, Supabase Auth magic link
Database:       Supabase Postgres with row-level security (auto-enabled)
File storage:   Supabase Storage, private buckets per client, signed URLs
Hosting:        Cloudflare Pages
Edge runtime:   Cloudflare Pages Functions (middleware + API routes)
Build:          Astro + @astrojs/cloudflare adapter
Testing:        Playwright (visual diff only, not e2e suite)
CSS audit:      PurgeCSS + postcss (Phase 1 only)
Email:          Resend or Postmark (Phase 4, update notifications — optional)
MCP (Claude):   @supabase/mcp-server-supabase connected to Claude UI
MCP (Gemini):   @supabase/mcp-server-supabase connected to Gemini CLI
```

---

## Environment variables

These go in `.env` (never committed) and in Cloudflare Pages dashboard under Settings → Environment Variables.

```bash
# Supabase — anon key for Astro app (safe to expose, RLS protects data)
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Supabase — service role key for MCP servers ONLY (NEVER in Astro app)
# Used in Gemini CLI settings.json and Claude UI MCP integration only
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Set during Phase 5
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_API_TOKEN=
```

**Key distinction:**
- `anon` key → goes in Astro app, safe to be client-facing, RLS enforces security
- `service_role` key → MCP servers only, full DB access, never in any app code

---

## Repository structure (target)

```
eleoro/
├── technical_blueprint.md        ← this file
├── .env                          ← never committed
├── .env.example                  ← committed, no real values
├── .gitignore
├── astro.config.mjs
├── tailwind.config.mjs
├── tsconfig.json
├── package.json
│
├── .gemini/
│   ├── settings.json             ← Gemini CLI config including Supabase MCP
│   └── agents/
│       ├── astro-scaffolder.md
│       ├── css-auditor.md
│       ├── css-optimizer.md
│       └── visual-diff.md
│
├── public/
│   ├── robots.txt
│   ├── sitemap.xml               ← auto-generated by @astrojs/sitemap
│   ├── llms.txt                  ← AI discoverability
│   └── llms-full.txt
│
├── src/
│   ├── layouts/
│   │   ├── BaseLayout.astro      ← <html>, <head>, all meta tags
│   │   └── PortalLayout.astro    ← portal-specific shell
│   │
│   ├── pages/
│   │   ├── index.astro           ← homepage (all existing content)
│   │   ├── blog/
│   │   │   ├── index.astro       ← blog listing page
│   │   │   └── [slug].astro      ← individual post page
│   │   └── portal/
│   │       ├── index.astro       ← login page (email input)
│   │       ├── dashboard.astro   ← client dashboard
│   │       └── auth/
│   │           └── callback.astro
│   │
│   ├── content/
│   │   ├── config.ts             ← Content Collections schema
│   │   └── blog/
│   │       └── sample-post.mdx   ← first post created in Phase 2
│   │
│   ├── components/
│   │   ├── Hero.astro
│   │   ├── Services.astro
│   │   ├── HowWeWork.astro
│   │   ├── Pricing.astro
│   │   ├── CaseStudies.astro
│   │   ├── Industries.astro
│   │   ├── FAQ.astro
│   │   ├── ContactForm.astro
│   │   └── Footer.astro
│   │
│   ├── lib/
│   │   └── supabase.ts           ← Supabase client factory (server-side only)
│   │
│   └── styles/
│       └── global.css            ← existing CSS, migrated verbatim in Phase 1
│
└── functions/
    └── portal/
        └── _middleware.ts        ← Cloudflare edge function, checks session
```

---

## Supabase schema

Run this SQL in Supabase dashboard → SQL Editor once the project is created (Phase 4). Automatic RLS is enabled in dashboard settings so all tables get RLS automatically, but explicit policies are still required.

```sql
-- Clients table
create table clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  plan text check (plan in ('starter','growth','custom')),
  active_since date default current_date,
  created_at timestamptz default now()
);

-- Projects / workflows per client
create table projects (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  name text not null,
  status text check (status in ('live','pilot','scheduled')) default 'scheduled',
  created_at timestamptz default now()
);

-- Status update feed
create table updates (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  body text not null,
  created_at timestamptz default now()
);

-- Messages from clients to eleoro
create table messages (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  body text not null,
  created_at timestamptz default now(),
  replied_at timestamptz,
  reply_body text
);

-- RLS policies
create policy "clients see own record"
  on clients for select
  using (email = auth.email());

create policy "clients see own projects"
  on projects for select
  using (client_id in (
    select id from clients where email = auth.email()
  ));

create policy "clients see own updates"
  on updates for select
  using (project_id in (
    select id from projects where client_id in (
      select id from clients where email = auth.email()
    )
  ));

create policy "clients see own messages"
  on messages for select
  using (client_id in (
    select id from clients where email = auth.email()
  ));

create policy "clients insert own messages"
  on messages for insert
  with check (client_id in (
    select id from clients where email = auth.email()
  ));
```

---

## Supabase Storage structure

No separate files metadata table. Portal queries Storage directly for each client's folder. Files appear in the portal immediately after upload — no extra step.

```
Storage bucket: client-files (private)
│
└── clients/
    ├── {client_id}/
    │   ├── intake-workflow-docs.pdf
    │   ├── pilot-results-week1.pdf
    │   ├── n8n-exports.zip
    │   └── data-processing-agreement.pdf
    └── {client_id}/
        └── ...
```

**Storage RLS policy:**
```sql
create policy "clients access own storage folder"
  on storage.objects for select
  using (
    bucket_id = 'client-files' and
    (storage.foldername(name))[2] in (
      select id::text from clients where email = auth.email()
    )
  );
```

---

## Supabase MCP setup

### Option A — Claude UI (recommended for day-to-day portal management)

1. Go to claude.ai → Settings → Integrations
2. Add MCP server with these details:
   - Command: `npx`
   - Args: `-y @supabase/mcp-server-supabase@latest --supabase-url https://yourproject.supabase.co --supabase-key YOUR_SERVICE_ROLE_KEY`
3. Once connected, manage portal directly from Claude chat:
   - "Add Harmon & Lee as a new client, plan growth, email harmon@harmon-lee.com"
   - "Post an update to Harmon & Lee — intake workflow is live as of today"
   - "Show me all open client messages"
   - "Upload [attached file] to Harmon & Lee's portal folder"

### Option B — Gemini CLI (recommended for bulk operations and scripting)

Add to `.gemini/settings.json` in repo root:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--supabase-url", "https://yourproject.supabase.co",
        "--supabase-key", "YOUR_SERVICE_ROLE_KEY"
      ]
    }
  }
}
```

Once connected, manage portal from terminal:
```
Upload all files in ~/eleoro-clients/harmon-lee/ to Supabase Storage under clients/{id}/
Add three status updates for Harmon & Lee projects from this notes file
```

### File upload workflow (either option)

| Method | How |
|---|---|
| Claude UI | Attach file to chat → "Upload this to [client] portal folder" |
| Gemini CLI | "Upload all new files in ~/eleoro-clients/[client]/ to their portal folder" |
| Supabase dashboard | Drag and drop into Storage → client folder (fallback) |

---

## Phase status

| Phase | Description | Status |
|---|---|---|
| 0 | Create Supabase project, verify local tooling | ✅ Complete |
| 1 | Scaffold Astro, migrate homepage, CSS audit + visual diff optimization | ✅ Complete |
| 2 | Blog with Astro Content Collections + Tailwind, sample post | ✅ Complete |
| 3 | SEO: meta tags, sitemap, llms.txt, JSON-LD structured data | ✅ Complete |
| 4 | Client portal: auth middleware, dashboard, updates, files, messages + Supabase MCP setup | ⬜ Not started |
| 5 | Deploy to Cloudflare Pages, point DNS, verify live | ⬜ Not started |
| 6 | Google Search Console + Bing Webmaster Tools submission | ⬜ Not started |
| 7 | Validate: Lighthouse, RLS check, form test, disable GitHub Pages, make repo private | ⬜ Not started |

---

## Phase 1 — Scaffold Astro + migrate homepage + CSS optimization

**Status: ✅ Complete and approved**

**Completed:**
- [x] Astro project scaffolded on `astro-migration` branch
- [x] Homepage migrated — pixel-perfect confirmed at Checkpoint 1
- [x] CSS bug fixed: orphaned font-weight values from broken @import reconstructed
- [x] `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap')` added as line 1 of global.css
- [x] CSS audit complete — 184 unused rules identified, protected rules marked DO NOT TOUCH
- [x] False positive confirmed: `.hero-text` is used in Hero.astro, excluded from removal
- [x] `.request-bar`, `.dropdown-grid`, `.connectivity-graph` confirmed truly orphaned
- [x] Chunk 1 applied — 3 rule sets removed, visual diff pending

**Remaining:**
- [x] Visual diff after chunk 1 — approve or reject
- [x] Remaining CSS chunks (duplicates) — one at a time with diff after each
- [x] Final full-page diff at 1440px and 375px
- [x] Your approval → commit and push `astro-migration` branch

**Must-not-change list:**
- All text content, headings, pricing, copy
- All modal popup behavior (case studies, founders, privacy policy)
- FAQ accordion open/close behavior
- Contact form submission behavior
- Navigation anchor links (#contact, #pricing, etc.)
- Any animation or transition
- Font loading
- Mobile responsive breakpoints

---

## Phase 2 — Blog

**Status: ✅ Complete and approved**

**Completed:**
- [x] Astro 5 Content Layer API configured — `src/content.config.ts` with glob loader
- [x] Tailwind wired into `astro.config.mjs` with `applyBaseStyles: false` (homepage safe)
- [x] `tailwind.config.mjs` created with `site.*` CSS variable tokens and custom `prose-eleoro` typography theme
- [x] `@tailwindcss/typography` installed for blog post body rendering
- [x] Blog index at `/blog` — 3-column grid, excerpt clamped to 3 lines, hover accent on title only
- [x] Post page at `/blog/[slug]` — full post with Tailwind prose, tags, byline, CTA footer
- [x] 6 real posts written: AI workflows for law firms, document drafting, billing automation, CPA intake, n8n vs Zapier, what to automate first
- [x] Blog link added to `src/components/Nav.astro`
- [x] Committed to `astro-migration` branch

**Key implementation notes:**
- Astro 5 uses `src/content.config.ts` at the `src/` root (not `src/content/config.ts`)
- Post IDs from glob loader are the filename without extension (e.g. `ai-workflows-law-firms`)
- `applyBaseStyles: false` on Tailwind integration is critical — without it, Tailwind's CSS reset breaks homepage styles
- Blog pages use `var(--color-*)` CSS variables directly in scoped `<style>` blocks, not Tailwind dark: variants, so they respond to the site's existing `data-theme` light/dark toggle automatically

---

## Phase 3 — SEO + AI discoverability

**Status: ✅ Complete and approved**

**Completed:**
- [x] `astro.config.mjs` — `site: 'https://eleoro.com'` added, `@astrojs/sitemap` wired in (was already installed)
- [x] `src/layouts/BaseLayout.astro` — dynamic canonical via `Astro.url.pathname + Astro.site`, full OG block, Twitter Card, named `<slot name="head" />`, Organization + dynamic WebPage JSON-LD
- [x] `public/robots.txt` — allows all crawlers, points to `https://eleoro.com/sitemap-index.xml`
- [x] `public/llms.txt` — AI crawler manifest: company summary + page index with all blog post URLs
- [x] `public/llms-full.txt` — full text version: company overview, services, pricing, industries, all blog summaries
- [x] `src/pages/index.astro` — `ProfessionalService` JSON-LD injected via `<Fragment slot="head">`
- [x] `src/pages/blog/[slug].astro` — `BlogPosting` JSON-LD built from post frontmatter, injected via `<Fragment slot="head">`; passes `canonical` and `ogType="article"` to BaseLayout; injects `article:published_time` and `article:tag` meta

**Key implementation notes:**
- Sitemap auto-generates at build as `sitemap-index.xml` → `sitemap-0.xml` (all 8 pages included)
- Canonical URLs always resolve to production (`https://eleoro.com`) even during local dev, because they use `Astro.site` not `Astro.url.origin`
- OG image defaults to `/eleoro-logo-nobg.png` — swap for a proper 1200×630 card before Phase 6
- BaseLayout new props: `canonical`, `ogTitle`, `ogDescription`, `ogImage`, `ogType` (all optional with sensible defaults)

**Goal:** Every public page properly indexed by Google/Bing and discoverable by AI crawlers.

**Prerequisites:** Phase 2 complete.

**Deliverables:**
- `BaseLayout.astro` with full meta tag set (title, description, canonical, OG, Twitter card)
- `public/robots.txt` — allows all crawlers, points to sitemap
- `public/sitemap.xml` — auto-generated via `@astrojs/sitemap`
- `public/llms.txt` — AI crawler manifest (company summary, page index)
- `public/llms-full.txt` — full content version for AI indexing
- JSON-LD structured data: `ProfessionalService` schema on homepage
- JSON-LD structured data: `BlogPosting` schema on each blog post

---

## Phase 4 — Client portal + Supabase MCP

**Goal:** Auth-gated portal at eleoro.com/portal with magic link login, per-client dashboard showing status updates, file downloads, and message submission. Both MCP connections live.

**Prerequisites:** Phase 3 complete. Supabase schema SQL run (see schema section above).

**Deliverables:**
- Supabase schema created and RLS policies in place
- Supabase Storage bucket `client-files` created as private
- Storage RLS policy applied
- `src/lib/supabase.ts` — server-side Supabase client factory
- `functions/portal/_middleware.ts` — Cloudflare edge auth check
- `src/pages/portal/index.astro` — login page with email input
- `src/pages/portal/auth/callback.astro` — token exchange
- `src/pages/portal/dashboard.astro` — updates, files, messages tabs
- Portal queries Storage directly for file listing (no files metadata table)
- Acceptable use notice on login page and dashboard footer
- `.gemini/settings.json` updated with Supabase MCP configuration
- Claude UI MCP integration set up (see MCP setup section above)
- `.env.example` updated with SUPABASE_SERVICE_ROLE_KEY variable name

**Security checklist before phase complete:**
- [ ] RLS confirmed: logged-in test client cannot query another client's rows
- [ ] Storage bucket confirmed private (no public URL access)
- [ ] Signed URL expiry confirmed at 60 seconds
- [ ] Middleware redirect confirmed for unauthenticated requests
- [ ] No Supabase keys exposed in client-side JavaScript
- [ ] service_role key only in MCP config, never in Astro app

---

## Phase 5 — Deploy to Cloudflare Pages + DNS cutover

**Goal:** eleoro.com serving from Cloudflare Pages.

**Prerequisites:** Phase 4 complete. Cloudflare account created.

**Steps:**
1. Push `astro-migration` branch, merge to `main` after approval
2. Connect GitHub repo to Cloudflare Pages (via GitHub App)
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Add environment variables in Cloudflare Pages dashboard (anon key only, never service_role)
6. Confirm Cloudflare build succeeds
7. Add custom domain `eleoro.com` in Cloudflare Pages
8. Update DNS: point A/CNAME records to Cloudflare
9. Wait for propagation — confirm eleoro.com loads from Cloudflare
10. Disable GitHub Pages: repo Settings → Pages → None

---

## Phase 6 — Search engine submission

**Goal:** Google and Bing verified and sitemap submitted.

**Prerequisites:** Phase 5 complete, eleoro.com live on Cloudflare.

**Google Search Console:**
1. search.google.com/search-console → Add property → https://eleoro.com
2. Verify via HTML meta tag (add to BaseLayout.astro, redeploy)
3. Submit sitemap: https://eleoro.com/sitemap.xml

**Bing Webmaster Tools:**
1. bing.com/webmasters → Add site → https://eleoro.com
2. Verify via meta tag
3. Submit sitemap: https://eleoro.com/sitemap.xml

---

## Phase 7 — Validation + closeout

**Goal:** Everything confirmed working end-to-end. Repo secured.

**Checklist:**
- [ ] Lighthouse: Performance 90+, SEO 100, Accessibility 90+
- [ ] Structured data valid: validators.schema.org
- [ ] sitemap.xml accessible at correct URL
- [ ] llms.txt accessible and correctly formatted
- [ ] Contact form submits successfully
- [ ] Portal magic link flow works end-to-end with real email
- [ ] Portal RLS: test client A cannot see client B's data
- [ ] File download via signed URL works and expires correctly
- [ ] File upload via Claude UI MCP confirmed working
- [ ] File upload via Gemini CLI MCP confirmed working
- [ ] All modal popups open and close correctly
- [ ] Mobile layout matches original on 375px viewport
- [ ] GitHub Pages disabled ✓
- [ ] Repo made private ✓

---

## How to start a new thread for any phase

Copy and paste this block at the top of your new Claude conversation, then add the phase-specific section below it:

```
I am building eleoro.com using the technical blueprint attached below.
[paste full contents of technical_blueprint.md here]

Phase [N] is now starting. All previous phases are complete.
Please guide me through Phase [N] step by step.

IMPORTANT — role boundaries that must be respected throughout this thread:
- Gemini CLI is the builder: all file writes, shell commands, npm installs, git operations, and builds must be given to me as Gemini CLI prompts that I paste and run myself.
- Claude is the architect: plan each step, produce the Gemini prompts, validate output, and update the blueprint. Claude must never write files or run commands directly in this conversation.
- I (Roberto) visually approve all output before any commit is made.
```

---

## Notes and decisions log

| Date | Decision | Context |
|---|---|---|
| Apr 2025 | Repo stays public until Phase 7 | GitHub Pages free plan requires public repo |
| Apr 2025 | Tailwind only on new pages | Avoids any risk to homepage CSS |
| Apr 2025 | CSS optimization requires visual diff approval | Previous attempt broke styles |
| Apr 2025 | Portal for eleoro deliverables only | Not for storing client-end-client data |
| Apr 2025 | Admin UI for portal is optional | Supabase dashboard sufficient for <10 clients |
| Apr 2025 | Automatic RLS enabled in Supabase | Safety net so no table is ever accidentally unprotected |
| Apr 2025 | No files metadata table | Portal queries Storage directly, simpler architecture |
| Apr 2025 | Supabase MCP on both Claude UI and Gemini CLI | Day-to-day management from Claude chat, bulk ops from CLI |
| Apr 2025 | service_role key never in Astro app | MCP servers only, anon key + RLS handles app-level security |
| Apr 2025 | CSS false positive: .hero-text | Confirmed used in Hero.astro, excluded from optimization |
| Apr 2025 | Font @import broken during migration | Reconstructed as line 1 of global.css |
| Apr 2026 | Role boundaries enforced | Gemini CLI builds/writes/runs; Claude plans and produces prompts; Roberto approves before commits |
| Apr 2026 | OG image placeholder | Using eleoro-logo-nobg.png for now; replace with 1200×630 card before Phase 6 |
| Apr 2026 | Sitemap output is sitemap-index.xml | @astrojs/sitemap 3.x generates sitemap-index.xml, not sitemap.xml — robots.txt and GSC submission use this URL |
