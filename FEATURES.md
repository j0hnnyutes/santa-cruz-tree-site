# Santa Cruz Tree Pros — Features & Functionality Reference

> **Keep this file up to date** when new features are added or changed.
> Last updated: 2026-03-08

---

## Build History

A chronological record of what was built and when. "Phase 1" was completed via ChatGPT prior to handoff. "Phase 2+" was completed via Claude (Cowork).

### Phase 1 — Initial Build (ChatGPT)

**Project setup & infrastructure**
- Next.js 16 App Router project scaffolded with TypeScript, Tailwind CSS v4
- Prisma ORM configured against Neon serverless PostgreSQL
- Deployed to Vercel with environment variables wired up
- `robots.ts` for auto-generated robots.txt
- `sitemap.ts` for auto-generated XML sitemap (initial version)
- Brand color system, CSS variables, `site-container` layout utility, responsive grid helpers
- Apple icon and favicon

**Frontend — public site**
- Full homepage: hero, credentials bar, services photo grid, "Why Choose Us", "How It Works" 4-step process, interactive SVG service area map, FAQ grid, CTA band
- 5 service pages (tree removal, trimming, stump grinding, emergency, arborist consulting) — shared `ServicePageKit` component with hero, description sections, related services, FAQ block, `ServiceCta`
- 11 service area pages (Santa Cruz, Capitola, Soquel, Aptos, Watsonville, Scotts Valley, Live Oak, Felton, Boulder Creek, Ben Lomond, Monterey)
- `/services` index page
- `/service-areas` index page with interactive SVG county map
- `/contact` page
- `/privacy-policy` page
- `/thank-you` page (post-form confirmation)
- Sticky header: logo, desktop nav (Services, Service Areas, Free Estimate), mobile hamburger with animated open/close, Escape key to close, "Get Free Estimate" CTA button
- Footer: brand column, services links, company links, privacy policy, copyright
- `StickyEstimateButton` — floating CTA that appears on scroll
- `HeroCarousel` — image carousel component
- `ServiceAreaMap` / `ServiceAreaMapWrapper` / `ServiceAreaSVGMap` — interactive SVG county map with city labels
- `ServiceCta` — shared "Request a Free Estimate" + "Call Now" CTA component used across all service/area pages
- `AccentCardLink` — reusable accent-bordered link card
- `ErrorBoundary` — client-side React error boundary
- `SiteAnalytics` — analytics tracking component

**Free Estimate form (`/free-estimate`)**
- Fields: Full Name, Phone, Email, Address, City, Service (dropdown), Additional Details
- Cloudflare Turnstile CAPTCHA integration (client + server-side verification)
- Client-side field validation with per-field inline error messages
- Ordered focus on first error field
- Async submit to `/api/lead` with success/error states

**Backend & database**
- PostgreSQL schema via Prisma: `Lead`, `LeadEvent` (audit trail), `ErrorLog` models
- `LeadStatus` enum: NEW, CONTACTED, CLOSED, ARCHIVED
- `/api/lead` — full lead submission pipeline: validation → Turnstile verification → duplicate check → DB write → LeadEvent audit record → email notification
- `/api/log` — client-side error ingestion endpoint
- Email notification via Resend: HTML template with all lead fields, click-to-call phone link
- HTTP-only session cookie admin auth with `bcryptjs` password hashing
- `/api/admin/login` and `/api/admin/logout`
- `/api/admin/leads` — paginated, searchable, filterable lead list
- `/api/admin/leads/export` — CSV export
- `/api/admin/leads/set-status` — lead status update
- `/api/admin/analytics` — traffic and lead analytics
- `/api/admin/analytics/stats` — dashboard summary stats
- `/api/admin/errors` — error log API
- `/api/admin/change-password` — password update
- `/api/admin/debug-env` — environment diagnostics (dev)

**Admin dashboard**
- `/admin/leads` — paginated leads table: search, status filter, sort, duplicate flag, status badges, CSV export button
- `/admin/leads/[leadId]` — lead detail: full info, status controls, auto-saving notes editor, full audit trail, click-to-call
- `/admin/analytics` — lead volume over time, device breakdown, top services, top cities
- `/admin/errors` — error log viewer with severity/type filters
- `/admin/settings` — password change
- `/admin/dashboard` — summary dashboard
- `AdminNav`, `AdminLeadsTableClient`, `AdminAnalyticsClient`, `AdminErrorsClient`, `AdminNotesEditor` components

**SEO (initial)**
- Per-page `<title>` and `<meta description>` on all public pages
- OpenGraph tags on all pages
- Initial sitemap covering homepage, free-estimate, services, service areas, 5 service pages, 11 city pages

---

### Phase 2 — Polish & SEO (Claude)

**Bug fixes**
- Fixed lead email: changed `sendLeadNotification()` to `await sendLeadNotification()` (was fire-and-forget, caused emails to not send on Vercel's serverless functions)
- Verified duplicate lead detection working correctly via direct DB query

**Cross-browser rendering fix**
- Diagnosed Safari vs Chrome size difference: Safari's CoreText renders `system-ui` (SF Pro) visually larger than Chrome
- Switched from `system-ui` to Inter via `next/font/google` — self-hosted at build time, zero FOUT, consistent across all browsers

**Site-wide sizing pass**
- Base font: `16px → 15px`
- Header height tuned: final `h-[104px] sm:h-[112px]`
- Nav link text: final `text-[1rem]`
- Hero H1: `clamp(38px,5.5vw,68px) → clamp(28px,4vw,50px)`
- Hero body/buttons reduced
- All section H2s: `clamp(26px,3.5vw,40px) → clamp(20px,2.5vw,30px)`
- All section subtext: `17px → 15px`
- ServiceCta: heading `text-2xl → text-xl`, button `text-lg → text-sm`
- FAQ questions on service pages: `text-xl → text-base`
- Homepage FAQ questions: `19px → 14px`

**Sitemap additions**
- Added `/contact` (priority 0.6) and `/privacy-policy` (priority 0.3)

**SEO — structured data**
- Added `LocalBusiness` + `HomeAndConstructionBusiness` JSON-LD to homepage (address, geo, hours, area served 11 cities, offer catalog 5 services)

---

### Phase 3 — Blog (Claude)

- `lib/markdown.ts` — zero-dependency pure-TypeScript markdown → HTML renderer
- `lib/blog.ts` — frontmatter parser and post reader using Node.js `fs` (no external packages)
- `/blog` listing page — category-color-coded cards, read time, publish date, CSS hover effects
- `/blog/[slug]` article pages — dark hero, breadcrumb, category tag, metadata, formatted body, inline CTA block
- Blog added to header nav (desktop + mobile) and footer
- Blog + all article URLs added to sitemap (with per-article `lastModified` from frontmatter date)
- `blog-body` CSS typography system (headings, paragraphs, lists, links, blockquotes, hr)
- 12 SEO-optimized articles at launch (see article table in [Blog section](#blog))
- `BlogPosting` JSON-LD structured data on every article page
- `article:published_time` in OpenGraph on article pages
- Twitter Card metadata on blog listing and article pages
- Canonical URLs on all blog pages
- Mobile-responsive hero padding via `clamp()` on both blog pages
- `FEATURES.md` — this document (auto-maintained going forward)
- `LAUNCH_CHECKLIST.md` — pre-launch and post-launch task tracker

---

### Phase 4 — Observability, Bug Fixes & Polish (Claude)

**Admin dashboard — analytics bug fixes**
- Form Conversion stat card now shows "N/A" (not "0.0%") when `started=0` but submissions exist; shows "—" when no activity at all
- API returns `null` for `conversionRate` when started=0 rather than forcing 0.0
- Added subtitle to Form Funnel section clarifying that "Field Errors" = client-side form validation events (not server errors)
- Added "View all errors →" link from Recent Errors section on dashboard → `/admin/errors`

**Error observability — client-side**
- `GlobalErrorTracker` component — hooks `window.onerror` + `window.unhandledrejection`; captures unhandled JS errors and promise rejections that occur outside the React tree (setTimeout callbacks, async chains, third-party scripts). Filters benign browser noise (ResizeObserver, cross-origin script errors). Mounted in root layout.
- `app/error.tsx` — Next.js route-segment error boundary; catches errors during page/layout rendering, shows "Try again / Go home" UI, logs automatically with `digest` in metadata
- `app/global-error.tsx` — root layout error boundary (critical severity); renders its own `<html>/<body>` since root layout is gone

**Error observability — server-side**
- Added `logError()` to `/api/admin/analytics` catch block (was console.error only)
- Added `logError()` to `/api/admin/stats` catch block (was console.error only)
- Added `logError()` to `/api/admin/change-password` catch block (was console.error only)
- Added `logError()` to `/api/admin/leads/bulk` catch block (was console.error only)
- Email delivery failures now logged as `critical` / type `email_delivery` — both Resend API non-2xx responses (with status code + response body in metadata) and unexpected throws
- Turnstile `success=false` logged as `warning` / type `captcha` (includes Cloudflare `error-codes` array in metadata)
- Turnstile network errors logged as `warning` / type `captcha`
- `/api/log/error` public endpoint now persists the `metadata` field from client (was hardcoded to `null`); includes source, filename, lineno, digest, errorCodes, etc.

**Error type taxonomy** (used in `type` field across all `logError` calls)
- `client_js` — unhandled browser JS errors and React crashes
- `server_api` — unexpected throws in API route handlers
- `email_delivery` — Resend API failures
- `captcha` — Cloudflare Turnstile failures

**Email — dark mode fix**
- Added `<meta name="color-scheme" content="light">` and `<meta name="supported-color-schemes" content="light">` to lead notification email `<head>`
- Added `:root { color-scheme: light only }` CSS and `@media (prefers-color-scheme: dark)` overrides with `!important`
- Prevents Apple Mail on iOS from auto-inverting `#1b5e35` (forest green) to lime green

**PostgreSQL raw SQL fix**
- `/api/admin/analytics` page-views-by-day query: fixed `FROM PageView` → `FROM "PageView"` (PostgreSQL requires double-quotes for mixed-case table names)
- Replaced SQLite-only `strftime('%Y-%m-%d', ...)` with PostgreSQL `TO_CHAR("createdAt", 'YYYY-MM-DD')`
- All camelCase column references double-quoted: `createdAt` → `"createdAt"`, `sessionId` → `"sessionId"`
- Cutoff value passed as a `Date` object (Prisma parameterises natively) instead of ISO string

---

## Table of Contents
1. [Tech Stack](#tech-stack)
2. [Pages & Routes](#pages--routes)
3. [Frontend Features](#frontend-features)
4. [Backend & API](#backend--api)
5. [Database](#database)
6. [Admin Dashboard](#admin-dashboard)
7. [SEO & Metadata](#seo--metadata)
8. [Email](#email)
9. [Security](#security)
10. [Infrastructure & Deployment](#infrastructure--deployment)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + inline styles |
| Font | Inter via `next/font/google` (self-hosted at build time) |
| Database ORM | Prisma |
| Database | PostgreSQL (Neon serverless) |
| Email | Resend |
| CAPTCHA | Cloudflare Turnstile |
| Deployment | Vercel (production) |
| Package manager | npm |

---

## Pages & Routes

### Public Pages

| Route | Description |
|---|---|
| `/` | Homepage |
| `/services` | Services index |
| `/services/tree-removal` | Tree Removal service page |
| `/services/tree-trimming` | Tree Trimming service page |
| `/services/stump-grinding-root-removal` | Stump Grinding & Root Removal service page |
| `/services/emergency-tree-service` | Emergency Tree Service page |
| `/services/arborist-consulting` | Arborist Consulting page |
| `/service-areas` | Service Areas index |
| `/service-areas/santa-cruz` | Santa Cruz area page |
| `/service-areas/capitola` | Capitola area page |
| `/service-areas/soquel` | Soquel area page |
| `/service-areas/aptos` | Aptos area page |
| `/service-areas/watsonville` | Watsonville area page |
| `/service-areas/scotts-valley` | Scotts Valley area page |
| `/service-areas/live-oak` | Live Oak area page |
| `/service-areas/felton` | Felton area page |
| `/service-areas/boulder-creek` | Boulder Creek area page |
| `/service-areas/ben-lomond` | Ben Lomond area page |
| `/service-areas/monterey` | Monterey area page |
| `/free-estimate` | Lead capture form |
| `/thank-you` | Post-form submission confirmation |
| `/blog` | Blog listing page |
| `/blog/[slug]` | Individual blog article page |
| `/contact` | Contact page |
| `/privacy-policy` | Privacy Policy page |
| `/sitemap.xml` | Dynamic XML sitemap (auto-generated) |
| `/robots.txt` | Robots file (auto-generated via `robots.ts`) |

### Admin Pages (auth-protected)

| Route | Description |
|---|---|
| `/admin` | Admin entry / redirect |
| `/admin/leads` | Leads table with filters, search, pagination |
| `/admin/leads/[leadId]` | Lead detail view with notes and audit trail |
| `/admin/analytics` | Traffic and lead analytics dashboard |
| `/admin/errors` | Error log viewer |
| `/admin/settings` | Admin settings (password change, etc.) |
| `/admin/dashboard` | Main admin dashboard |

### API Routes

| Route | Method | Description |
|---|---|---|
| `/api/lead` | POST | Lead form submission — validates, deduplicates, stores, sends email |
| `/api/log/error` | POST | Client-side JS error ingestion (unhandled errors, React crashes) |
| `/api/log/event` | POST | Form interaction event tracking (STARTED, FIELD_ERROR, ABANDONED, SUBMITTED) |
| `/api/log/pageview` | POST | Page view tracking (path, referrer, session ID, duration) |
| `/api/admin/login` | POST | Admin authentication |
| `/api/admin/logout` | POST | Admin session logout |
| `/api/admin/leads` | GET | Paginated lead list with filters |
| `/api/admin/leads/[leadId]` | GET/PATCH | Single lead detail and update |
| `/api/admin/leads/bulk` | POST | Bulk action (archive) on multiple leads |
| `/api/admin/leads/export` | GET | CSV export of all leads |
| `/api/admin/leads/set-status` | POST | Update lead status |
| `/api/admin/leads/notes` | POST | Update admin notes on a lead |
| `/api/admin/analytics` | GET | Analytics data (page views by day, devices, referrers) |
| `/api/admin/stats` | GET | Summary stats for dashboard (leads, errors, form funnel, top pages) |
| `/api/admin/errors` | GET | Error log entries with filters |
| `/api/admin/change-password` | POST | Admin password update |
| `/api/admin/debug-env` | GET | Environment variable diagnostics (dev only) |

---

## Frontend Features

### Global Layout
- Sticky header with logo, desktop nav, mobile hamburger menu (animated open/close, Escape key closes)
- Blog link in both desktop nav and mobile dropdown
- Footer with Services column, Company column (includes Blog), privacy policy link, copyright
- Inter font loaded via `next/font/google` — self-hosted, zero FOUT, consistent cross-browser rendering (fixes Safari CoreText vs Chrome rendering difference)
- `html { font-size: 15px }` base with `clamp()` for all heading sizes
- `site-container` max-width 1240px with 24px horizontal padding
- Sticky "Get Free Estimate" floating button (`StickyEstimateButton`) visible on scroll

### Homepage (`/`)
- **Hero** — full-viewport background image with gradient overlay, H1 with `clamp()` sizing, two CTA buttons
- **Credentials bar** — 4-column trust signals (licensed, insured, local, responsive)
- **Services grid** — 3-column photo cards linking to each service page
- **Why Choose Us** — 4-column icon cards
- **How It Works** — 4-step process with connecting line
- **Service area map** — interactive SVG map of Santa Cruz County with city labels
- **FAQ** — 2-column accordion-style question cards
- **CTA band** — dark section with heading and estimate button
- **LocalBusiness JSON-LD** structured data injected in page component

### Service Pages (5 pages, shared `ServicePageKit` component)
- Hero with headline, subtext, and CTA
- Service description sections with bullet points
- Related services block
- FAQ block (shared `FaqBlock` component)
- `ServiceCta` component — "Request a Free Estimate" + "Call Now" button

### Service Area Pages (11 pages)
- Same structure as service pages but localized to each city
- Internal links to relevant services
- ServiceCta with call/estimate buttons

### Free Estimate Form (`/free-estimate`)
- Fields: Full Name, Phone, Email, Address, City, Service type (dropdown), Additional Details (textarea)
- **Cloudflare Turnstile** CAPTCHA — invisible/managed challenge
- Client-side validation with inline error messages per field
- Ordered error focus (jumps to first error field)
- Submit → API call → success state with thank-you messaging
- Duplicate detection: shows soft warning if same phone/email submitted in last 24h (doesn't block — records as duplicate flag)
- Redirect to `/thank-you` on success

### Blog
- `/blog` — listing page with category-color-coded cards, read time, publish date, "Read article →" link
- `/blog/[slug]` — article pages with dark hero, breadcrumb, category tag, publish date, read time, formatted article body, in-article CTA block, "Back to all articles" link
- Blog card hover effect via CSS (`.blog-card:hover`) — lift + shadow
- 10 articles published at launch (see content below)
- Content stored as `.md` files in `content/blog/` — new articles added by dropping a file, no code changes needed
- Zero new npm dependencies — custom TypeScript markdown renderer (`lib/markdown.ts`) and frontmatter parser (`lib/blog.ts`)

### Blog Articles (17 total)

| Slug | Category |
|---|---|
| `tree-removal-cost-santa-cruz` | Pricing & Planning |
| `tree-trimming-cost-santa-cruz` | Pricing & Planning |
| `best-time-trim-trees-santa-cruz` | Seasonal |
| `how-to-tell-if-tree-is-dead` | Safety & Hazards |
| `fire-resistant-landscaping-santa-cruz` | Safety & Hazards |
| `emergency-tree-service-santa-cruz` | Safety & Hazards |
| `dangerous-trees-santa-cruz` | Safety & Hazards |
| `tree-root-damage-foundation-pipes` | Safety & Hazards |
| `what-to-do-after-storm-tree-damage` | Safety & Hazards |
| `stump-grinding-vs-stump-removal` | Services |
| `what-to-expect-tree-removal` | Services |
| `diy-vs-hiring-arborist` | Tree Care |
| `how-often-trim-trees` | Tree Care |
| `coast-live-oak-care-santa-cruz` | Tree Care |
| `how-to-choose-tree-service-santa-cruz` | Tree Care |
| `tree-care-after-drought` | Tree Care |
| `tree-removal-permits-santa-cruz` | Local Regulations |
| `what-to-expect-tree-removal` | Services |

### Other Components
- `HeroCarousel` — image carousel used in hero sections
- `ServiceAreaMap` / `ServiceAreaMapWrapper` / `ServiceAreaSVGMap` — interactive county map
- `SiteKit` / `SiteShell` — shared layout wrappers
- `AccentCardLink` — reusable accent-bordered card with link
- `ErrorBoundary` — React class component error boundary (catches component tree crashes via `componentDidCatch`, logs to `/api/log/error`, shows reload UI)
- `GlobalErrorTracker` — client component mounted in root layout; hooks `window.onerror` and `window.unhandledrejection` to capture errors outside the React tree
- `SiteAnalytics` — page view tracking component (path, referrer, session ID, time-on-page)

---

## Backend & API

### Lead Submission (`POST /api/lead`)
1. Validates all fields (name, phone 10-digit, email, address, city, service, Turnstile token)
2. Verifies Cloudflare Turnstile token server-side
3. Checks for duplicate lead: same `phoneDigits` OR `email` submitted within last 24 hours
4. Stores lead in PostgreSQL with generated `leadId`
5. Creates `LeadEvent` audit record (`CREATED` or `DUPLICATE_FLAGGED`)
6. Sends email notification via Resend (includes duplicate warning banner if flagged)
7. Returns success or field-level validation errors as JSON

### Error Logging
Three endpoints write to `ErrorLog`:
- `POST /api/log/error` — client-side errors (unhandled JS, React crashes, global error tracker). Accepts: severity, type, message, stack, path, metadata (JSON)
- `lib/logError.ts` — server-side utility called directly from API route catch blocks

**What is logged:**
- Unhandled browser JS errors (`window.onerror`) — type `client_js`
- Unhandled promise rejections (`window.unhandledrejection`) — type `client_js`
- React component tree crashes (`ErrorBoundary.componentDidCatch`) — type `client_js`
- Next.js route-segment render errors (`app/error.tsx`) — type `client_js`, severity `error`
- Root layout crashes (`app/global-error.tsx`) — type `client_js`, severity `critical`
- API route unexpected throws (`/api/lead`, `/api/admin/*`) — type `server_api`
- Email delivery failures (Resend non-2xx or throw) — type `email_delivery`, severity `critical`
- Cloudflare Turnstile failures — type `captcha`, severity `warning`

### Admin Auth
- Session-based authentication via HTTP-only cookie
- `bcryptjs` for password hashing
- Login/logout via `/api/admin/login` and `/api/admin/logout`
- All `/admin/*` routes and `/api/admin/*` routes are auth-protected

### CSV Export (`GET /api/admin/leads/export`)
- Exports all leads as a properly formatted CSV
- Columns: ID, Name, Phone, Email, Address, City, Service, Details, Status, Created, Notes

---

## Database

**Provider:** PostgreSQL (Neon serverless)
**ORM:** Prisma

### Models

#### `Lead`
| Field | Type | Notes |
|---|---|---|
| `leadId` | String | Primary key (generated) |
| `createdAt` | DateTime | Auto-set |
| `fullName` | String | |
| `phoneDigits` | String | 10 digits only, no formatting |
| `email` | String | Lowercased |
| `address` | String | |
| `city` | String | |
| `service` | String | Selected service type |
| `details` | String? | Optional additional info |
| `status` | LeadStatus | NEW, CONTACTED, CLOSED, ARCHIVED |
| `contactedAt` | DateTime? | Set when status → CONTACTED |
| `adminNotes` | String? | Rich text notes from admin |
| `archivedAt` | DateTime? | Set when archived |
| `events` | LeadEvent[] | Full audit trail |

#### `LeadEvent` (audit trail)
| Field | Type | Notes |
|---|---|---|
| `id` | Int | Auto-increment |
| `leadId` | String | FK → Lead |
| `createdAt` | DateTime | Auto-set |
| `action` | String | CREATED, STATUS_CHANGE, NOTES_UPDATED, DUPLICATE_FLAGGED |
| `detail` | String? | Human-readable change description |

#### `ErrorLog`
| Field | Type | Notes |
|---|---|---|
| `id` | Int | Auto-increment |
| `createdAt` | DateTime | Auto-set |
| `severity` | String | error, warning, critical |
| `type` | String | client_js, server_api, email_delivery, captcha, form_validation, rate_limit, auth, etc. |
| `message` | String | |
| `stack` | String? | Stack trace |
| `path` | String? | URL path where error occurred |
| `ip` | String? | Client IP |
| `userAgent` | String? | Browser/client user agent |
| `metadata` | String? | JSON string — source, filename, lineno, digest, errorCodes, etc. |

#### `PageView`
| Field | Type | Notes |
|---|---|---|
| `id` | Int | Auto-increment |
| `createdAt` | DateTime | Auto-set |
| `path` | String | Page path |
| `referrer` | String? | HTTP referrer |
| `ip` | String? | Client IP |
| `userAgent` | String? | Browser user agent |
| `sessionId` | String? | Session UUID from sessionStorage |
| `duration` | Int? | Time on page in milliseconds |

#### `FormEvent`
| Field | Type | Notes |
|---|---|---|
| `id` | Int | Auto-increment |
| `createdAt` | DateTime | Auto-set |
| `sessionId` | String? | Session UUID |
| `eventType` | String | STARTED, FIELD_ERROR, ABANDONED, SUBMITTED |
| `fieldName` | String? | Field that had an error (for FIELD_ERROR events) |
| `metadata` | String? | JSON string for future use |

#### `AdminConfig`
| Field | Type | Notes |
|---|---|---|
| `key` | String | Primary key (e.g. `password_hash`) |
| `value` | String | Stored value |
| `updatedAt` | DateTime | Auto-updated |

---

## Admin Dashboard

### Leads Table (`/admin/leads`)
- Paginated table of all leads
- Search by name, email, phone, service
- Filter by status (NEW, CONTACTED, CLOSED, ARCHIVED)
- Sort by date
- Duplicate flag indicator
- Status badge color-coding
- Link to lead detail view
- CSV export button

### Lead Detail (`/admin/leads/[leadId]`)
- Full lead information
- Status update controls
- Admin notes editor (auto-saved)
- Full audit trail / event history
- Click-to-call phone link

### Analytics (`/admin/analytics`)
- Lead volume over time
- Device breakdown (mobile vs desktop)
- Top service types requested
- Top cities

### Dashboard (`/admin/dashboard`)
- Summary stat cards: Total Leads, New Leads (30d), Errors (30d), Form Conversion
- Form Conversion shows "N/A" when no page-load tracking yet (not a misleading "0.0%")
- Form Funnel (30d): Started → Field Errors → Abandoned → Submitted
- Recent errors list with "View all errors →" link
- Top pages by view count
- Configurable date range

### Error Log (`/admin/errors`)
- Chronological error log viewer
- Severity and type filters
- Full stack trace expansion
- Metadata display (source, filename, error codes, etc.)

### Settings (`/admin/settings`)
- Password change form

---

## SEO & Metadata

### Global
- Inter font (cross-browser consistent rendering)
- `html { font-size: 15px }` baseline
- `viewport` meta tag exported from `layout.tsx`
- `robots.ts` generating `/robots.txt`

### Per-Page Metadata
- Unique `<title>` and `<meta description>` on every page
- OpenGraph tags on all pages
- Twitter Card (`summary_large_image`) on all pages
- Canonical URLs on all pages

### Structured Data (JSON-LD)
- **`LocalBusiness` + `HomeAndConstructionBusiness`** on homepage — includes name, URL, telephone (placeholder), address, geo coordinates, opening hours, area served (11 cities), offer catalog (5 services)
- **`BlogPosting`** on every blog article page — includes headline, description, datePublished, author, publisher with logo

### Sitemap (`/sitemap.xml`) — auto-generated
- Homepage (priority 1.0, weekly)
- `/free-estimate` (priority 0.9, monthly)
- `/services` (priority 0.8, monthly)
- `/service-areas` (priority 0.7, monthly)
- 5 service pages (priority 0.8, monthly)
- 11 city pages (priority 0.7, monthly)
- `/blog` (priority 0.7, weekly)
- All blog articles (priority 0.6, monthly, with per-article publish date as `lastModified`)
- `/contact` (priority 0.6, yearly)
- `/privacy-policy` (priority 0.3, yearly)

### Static Pre-rendering
- All pages statically pre-rendered at build time (`generateStaticParams` on blog)
- Blog articles auto-discovered from `content/blog/*.md` at build

---

## Email

**Provider:** Resend

### Lead Notification Email
- Sent to site owner on every new lead submission via Resend
- HTML email template with: name, phone (formatted, click-to-call link), email, address, service, details
- **Duplicate warning banner** displayed prominently if lead flagged as duplicate (same phone/email within 24h)
- **Photos attached** to email when submitted (up to 5, base64-encoded)
- "View Lead in Admin →" button linking directly to the lead detail page
- `await`ed before response so Vercel serverless function doesn't shut down before send completes
- **Delivery failures** logged as `critical` severity in `ErrorLog` (type `email_delivery`)
- **Dark mode safe** — `<meta name="color-scheme" content="light">`, `<meta name="supported-color-schemes" content="light">`, and `:root { color-scheme: light only }` prevent Apple Mail on iOS from inverting the forest green header to lime green

---

## Security

### CAPTCHA
- **Cloudflare Turnstile** on the Free Estimate form
- Token verified server-side before any lead processing

### Admin Authentication
- HTTP-only session cookie (not accessible to JS)
- Passwords stored as `bcryptjs` hashes
- All admin routes and API endpoints check session before responding

### Duplicate Lead Detection
- Checks `phoneDigits` AND `email` against leads created in the last 24 hours
- Flags duplicate in DB and email — does not silently discard

### Error Logging & Observability
- `GlobalErrorTracker` captures all unhandled browser JS errors and promise rejections
- `ErrorBoundary` catches React component tree crashes
- `app/error.tsx` and `app/global-error.tsx` handle Next.js route/layout-level crashes
- Server-side: all API route catch blocks call `logError()` — persistent DB record with severity, type, message, stack, path, IP, user agent, metadata
- Email delivery failures logged as `critical` — ensures missed lead notifications are detectable
- Turnstile failures logged as `warning` — repeated warnings can indicate bot activity or misconfigured key
- All errors viewable at `/admin/errors` with severity/type filters

---

## Infrastructure & Deployment

| Item | Details |
|---|---|
| Hosting | Vercel (production) |
| Database | Neon serverless PostgreSQL |
| Domain | `santacruztreepros.com` (pending DNS cutover) |
| Current staging URL | `santa-cruz-tree-site-git-main-jon-lawtons-projects.vercel.app` |
| Build command | `prisma generate && next build` |
| Environment variables | `DATABASE_URL`, `DIRECT_URL`, `RESEND_API_KEY`, `TURNSTILE_SECRET_KEY`, `ADMIN_PASSWORD_HASH`, `SITE_URL` |

### Pending Before Go-Live
- [ ] Replace `tel:+1XXXXXXXXXX` with real phone number (ServiceCta, all service pages, LocalBusiness schema)
- [ ] Point `santacruztreepros.com` DNS to Vercel
- [ ] Update `SITE_URL` env var in Vercel from staging URL → `https://santacruztreepros.com`

---

## Planned / To-Do

- [ ] Add hero/cover images to blog articles (frontmatter `image` field ready to wire up)
- [ ] Google Business Profile (owner action — not a code change)
- [ ] Blog post: additional articles (just drop `.md` files into `content/blog/`)
- [ ] About page
- [ ] Customer reviews / testimonials section
