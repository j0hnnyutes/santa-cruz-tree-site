# Santa Cruz Tree Pros — Site Audit Report
**Date:** March 21, 2026
**Scope:** Full front-end + back-end review of staging at `santa-cruz-tree-site.vercel.app`

---

## Summary

| Category | Status |
|---|---|
| Page titles / SEO metadata | ✅ Fixed (17 pages) |
| Structured data / JSON-LD | ✅ Pass |
| Analytics pipeline | ✅ Pass |
| Admin panel & session security | ✅ Pass |
| Lead form & attribution | ✅ Pass |
| Database schema & migration | ✅ Pass |
| Sitemap & robots.txt | ✅ Pass |
| Blog | ✅ Pass (32 posts loading) |
| Branding consistency | ✅ Fixed |
| Dev artifacts in public/ | ✅ Fixed |
| Phone number placeholder | ⚠️ Must set before launch |

---

## Bugs Fixed This Session

### 1. Title Duplication — All Service, Service Area & Blog Pages *(SEO Critical)*
**Problem:** `layout.tsx` uses `template: "%s | Santa Cruz Tree Pros"` but 16 individual pages already included `| Santa Cruz Tree Pros` in their hardcoded title strings, causing double-branding in search results:
> *"Tree Removal in Santa Cruz, CA | Santa Cruz Tree Pros | Santa Cruz Tree Pros"*

**Affected pages (17 total):**
- 3 service pages: tree-removal, tree-trimming, stump-grinding
- 11 service area pages: all cities
- Blog listing page
- Blog post `generateMetadata`
- Thank-you page

**Fix:** Stripped ` | Santa Cruz Tree Pros` from all top-level `metadata.title` values — the layout template now appends it once. OG and Twitter titles were intentionally left unchanged (social cards benefit from explicit brand inclusion).

---

### 2. Free-Estimate Page Missing Metadata *(SEO — High-Conversion Page)*
**Problem:** `app/free-estimate/page.tsx` was a `"use client"` component with no exported `metadata`, so the page fell back to the root layout default: title = `"Santa Cruz Tree Pros"`, no description, no OG image. This is the primary conversion page on the site.

**Fix:** Split into:
- `app/free-estimate/page.tsx` — server component that exports full metadata (title, description, canonical, OG with image, Twitter card, robots)
- `app/free-estimate/FreeEstimateClient.tsx` — the existing client component (form logic unchanged)

New title in search results: **"Get a Free Estimate | Santa Cruz Tree Pros"**

---

### 3. Branding Copy — "SC Tree Pros" on Free-Estimate Form
**Problem:** The form intro paragraph used "SC Tree Pros" twice instead of the full brand name, and the copy was generic/verbose.

**Fix:** Replaced with concise, on-brand copy that encourages submission.

---

### 4. Dev Artifacts in `public/`
**Problem:** `public/design-preview.html` and `public/header-mockups.html` were accessible at public URLs (`/design-preview.html`, `/header-mockups.html`), exposing design process and internal tooling.

**Fix:** Deleted both files.

---

## Pre-Launch Action Required

### ⚠️ Phone Number Placeholder
`+1XXXXXXXXXX` appears in 6 places:
- `app/page.tsx` — LocalBusiness JSON-LD schema `telephone` field (indexed by Google)
- `app/services/tree-removal/page.tsx` — "Call Now" button `href="tel:+1XXXXXXXXXX"`
- `app/services/tree-trimming/page.tsx` — same
- `app/services/stump-grinding-root-removal/page.tsx` — same
- `app/services/emergency-tree-service/page.tsx` — same
- `app/services/arborist-consulting/page.tsx` — same

Replace all instances of `+1XXXXXXXXXX` with the real E.164-formatted phone number before going live.

---

## Features Verified Working

### Analytics Pipeline
- **Pageview tracking** — fires 1.5s after route change, only if `visibilityState === "visible"` (filters prefetch noise)
- **Scroll depth** — passive listener accumulates `maxScrollPct` (0–100), resets on every SPA navigation, sends with `duration` on page leave
- **UTM persistence** — `utm_source/medium/campaign` captured on landing URL, stored to `sessionStorage.__utm`, inherited across pages, appended to lead form submissions
- **New visitor detection** — `localStorage.__site_visited` flag persists across sessions; `sessionStorage.__site_is_new` caches resolved value per session
- **Bot filtering** — 30+ UA patterns silently dropped before any DB write
- **Rate limiting** — 100 req/min on `/api/log/pageview`, 10 req/min on `/api/lead`
- **Geo enrichment** — Vercel headers provide country/region/city on all pageviews

### Structured Data / JSON-LD
All page types verified with correct schema output:

| Page Type | Schemas Present |
|---|---|
| Homepage | LocalBusiness + HomeAndConstructionBusiness |
| Service pages (×5) | Service + FAQPage + BreadcrumbList |
| Service area pages (×11) | Service + FAQPage + BreadcrumbList |
| Blog listing | (none — appropriate) |
| Blog posts | BlogPosting + BreadcrumbList |

BreadcrumbList structure verified: Home always position 1, current page omits `item` URL per spec.

### Lead Form
- Turnstile (invisible) bot protection — fails open so mobile errors don't block real leads
- Server-side duplicate detection — same phone/email in last 24h flags the lead and notifies via email with ⚠️ banner
- Photo upload — up to 5 files (JPG/PNG/HEIC/WebP/TIFF, 10MB each) → Vercel Blob, URLs stored on Lead row
- UTM + session attribution — form appends `utmSource`, `utmMedium`, `utmCampaign`, `sessionId` from `sessionStorage`, stored on Lead row
- Resend email — HTML-formatted notification with "View Lead in Admin →" deep link, photo attachments, duplicate warning
- Form event tracking — `STARTED`, `FIELD_ERROR`, `ABANDONED`, `SUBMITTED` events in `FormEvent` table

### Admin Panel
- **Authentication** — HMAC-SHA256 signed session token (`payloadB64.sigB64`), 8h TTL, `httpOnly` + `secure` + `sameSite=lax`
- **CSRF** — `admin_csrf` cookie must match `x-admin-csrf` header on all mutating endpoints
- **Idle timeout** — 28min warning modal with mm:ss countdown (turns red at 30s), 30min auto-logout
- **Session refresh** — "Stay logged in" POSTs to `/api/admin/refresh-session`, validates existing session + CSRF, issues new 8h token
- **Timed-out message** — Login page shows amber banner on `?timedOut=1` param
- **Analytics dashboard** — scroll depth distribution card, UTM attribution table, geo breakdown, device split, new vs. returning, custom date range

### Database Schema
All fields present and indexed:
- `PageView` — path, referrer, sessionId, userAgent, duration, utmSource/Medium/Campaign, country/region/city, isNewVisitor, **maxScrollDepth** ✓
- `Lead` — all contact fields, photoUrls[], utmSource/Medium/Campaign, **sessionId** ✓
- `DailyRollup` — views, sessions, avgDuration, bounceCount, newSessions, returnSessions, mobileViews, desktopViews, topPages, topReferrers, utmSources ✓
- Migration script (`scripts/migrate-utm-geo.mjs`) — all 17 `ALTER TABLE IF NOT EXISTS` steps, idempotent ✓

### Cron / Rollup
- Runs at `0 3 * * *` (3am America/Los_Angeles) via `vercel.json`
- 730-day raw retention, 30-day error log retention
- Aggregates pre-computed daily stats into `DailyRollup` before purging raw rows
- CRON_SECRET auth guard on the endpoint

### Sitemap & Robots
- `sitemap.xml` — covers all 33 pages: homepage, free-estimate, services (index + 5), service areas (index + 11), contact, privacy, blog (index + 32 posts)
- `robots.txt` — `Disallow: /admin`, `Disallow: /api/`, `Sitemap:` pointing to production URL
- Blog posts use actual `post.date` as `lastModified`; static pages use build time

---

## Upgrade Recommendations

### High Impact

**1. AggregateRating / Review schema on homepage LocalBusiness**
Adding star ratings to the JSON-LD schema can unlock Google's review rich snippets in search results, significantly improving CTR. Requires collecting and displaying reviews (or integrating with Google Reviews API). This is probably the highest-ROI SEO addition possible right now.

**2. GA4 SPA re-fire on navigation**
The current GA4 init sets `page_path` once at first load only. SPA navigations via Next.js client-side routing aren't re-fired to GA4. If GA4 data is used alongside the custom analytics, add a `gtag('event', 'page_view')` call inside `SiteAnalytics.tsx` on each `pathname` change. (Custom analytics already handles this correctly.)

**3. Redis-backed rate limiter**
The current `rateLimit` uses in-memory state. On serverless deployments each cold start has isolated memory, so the 100 req/min limit isn't shared across concurrent instances. For serious abuse protection, use Vercel KV (Upstash Redis) as the backing store.

**4. OG images for service area and free-estimate pages**
Several service area pages have no `openGraph.images` defined, so social shares pull whatever OpenGraph image the scraper finds first. Adding per-page OG images (or a dynamic OG image generator via `@vercel/og`) would make shares look professional.

### Medium Impact

**5. Image sitemap**
Current sitemap is text/URL only. Adding `<image:image>` entries for the 12 hero and service images could improve Google Image search discoverability and drive incremental traffic.

**6. `WebSite` + `SearchAction` schema on homepage**
Adding `WebSite` schema with `SearchAction` (pointing to `/blog?q={search_term_string}`) can enable Google Sitelinks Search Box in branded search results.

**7. Phone/CTA click tracking**
`tel:` link clicks and the "Get Free Estimate" button are not tracked as conversion events. Adding `logPageview`-style custom events (or GA4 `gtag('event', 'generate_lead')`) on these interactions would give better top-of-funnel visibility in the analytics dashboard.

**8. Scroll depth milestone events**
Currently only the max scroll depth on page leave is stored. Firing discrete events at 25/50/75/100% thresholds (as a `logEvent` call) would enable funnel analysis of which content sections keep users engaged vs. cause drop-off.

### Lower Priority

**9. `hreflang` for future multilingual expansion**
Not needed now (English only), but worth noting if Spanish-language pages are planned given Santa Cruz County demographics.

**10. `contact` page vs `free-estimate` page**
Both `/contact` and `/free-estimate` exist in the sitemap. If `/contact` redirects to `/free-estimate`, the redirect should be confirmed and the `/contact` URL deprioritized in the sitemap (`priority: 0.3`) to avoid confusion.

**11. `lastModified` accuracy for static pages**
Service and service area pages use `new Date().toISOString()` (build time) as `lastModified`. Google ignores unstable `lastModified` values; this is low priority but could be improved by reading actual file `mtime` or committing a static date per page.

---

## File Changes Summary

| File | Change |
|---|---|
| `app/services/tree-removal/page.tsx` | Title: removed brand suffix |
| `app/services/tree-trimming/page.tsx` | Title: removed brand suffix |
| `app/services/stump-grinding-root-removal/page.tsx` | Title: removed brand suffix |
| `app/service-areas/*/page.tsx` (×11) | Title: removed brand suffix |
| `app/blog/page.tsx` | Title: removed brand suffix |
| `app/blog/[slug]/page.tsx` | `generateMetadata`: title is now `post.title` |
| `app/thank-you/page.tsx` | Title: removed brand suffix |
| `app/free-estimate/page.tsx` | **New** server component with full metadata |
| `app/free-estimate/FreeEstimateClient.tsx` | **New** extracted client component (form logic unchanged), copy fixed |
| `public/design-preview.html` | Deleted |
| `public/header-mockups.html` | Deleted |
