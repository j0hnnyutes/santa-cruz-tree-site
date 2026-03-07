# Santa Cruz Tree Pros — Features & Functionality Reference

> **Keep this file up to date** when new features are added or changed.
> Last updated: 2026-03-07

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
| `/api/log` | POST | Client-side error logging |
| `/api/admin/login` | POST | Admin authentication |
| `/api/admin/logout` | POST | Admin session logout |
| `/api/admin/leads` | GET | Paginated lead list with filters |
| `/api/admin/leads/export` | GET | CSV export of all leads |
| `/api/admin/leads/set-status` | POST | Update lead status |
| `/api/admin/analytics` | GET | Analytics data (page views, leads, devices) |
| `/api/admin/analytics/stats` | GET | Summary stats for dashboard |
| `/api/admin/errors` | GET | Error log entries |
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

### Blog Articles (10 at launch)

| Slug | Category |
|---|---|
| `tree-removal-cost-santa-cruz` | Pricing & Planning |
| `best-time-trim-trees-santa-cruz` | Seasonal |
| `how-to-tell-if-tree-is-dead` | Safety & Hazards |
| `fire-resistant-landscaping-santa-cruz` | Safety & Hazards |
| `stump-grinding-vs-stump-removal` | Services |
| `what-to-do-after-storm-tree-damage` | Safety & Hazards |
| `diy-vs-hiring-arborist` | Tree Care |
| `how-often-trim-trees` | Tree Care |
| `dangerous-trees-santa-cruz` | Safety & Hazards |
| `tree-removal-permits-santa-cruz` | Local Regulations |
| `tree-care-after-drought` | Tree Care |
| `what-to-expect-tree-removal` | Services |

### Other Components
- `HeroCarousel` — image carousel used in hero sections
- `ServiceAreaMap` / `ServiceAreaMapWrapper` / `ServiceAreaSVGMap` — interactive county map
- `SiteKit` / `SiteShell` — shared layout wrappers
- `AccentCardLink` — reusable accent-bordered card with link
- `ErrorBoundary` — client-side React error boundary
- `SiteAnalytics` — analytics tracking component

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

### Error Logging (`POST /api/log`)
- Accepts client-side JS errors and server-side errors
- Stores to `ErrorLog` table with severity, type, message, stack trace, path, IP

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
| `type` | String | client_js, server_api, form_validation, rate_limit, auth, etc. |
| `message` | String | |
| `stack` | String? | |
| `path` | String? | URL path where error occurred |
| `ip` | String? | |

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

### Error Log (`/admin/errors`)
- Chronological error log viewer
- Severity and type filters

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
- Sent to site owner on every new lead submission
- HTML email template with lead details
- Includes: name, phone (formatted, click-to-call link), email, address, city, service, details, submission timestamp
- **Duplicate warning banner** displayed prominently if lead flagged as duplicate (same phone/email within 24h)
- Fire-and-forget with `await` (non-blocking to form response)

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

### Error Logging
- Client-side JS errors reported to `/api/log`
- Stored in `ErrorLog` table for admin review

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
