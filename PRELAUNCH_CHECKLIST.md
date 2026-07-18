# Pre-Launch Checklist — Santa Cruz Tree Pros

---

## 1. Push Latest Code

```bash
git push origin main
```

This deploys the final commit (error alert emails). Everything else is already live on Vercel.

---

## 2. Verify Vercel Environment Variables

Go to **Vercel → Project → Settings → Environment Variables** and confirm all of these are set:

| Variable | Notes |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `DIRECT_URL` | Neon direct connection (for migrations) |
| `BLOB2_READ_WRITE_TOKEN` | **Public** Vercel Blob store (`santa-cruz-tree-site-blob-new`) — used for photo uploads |
| `RESEND_API_KEY` | Lead notification + error alert emails |
| `LEAD_TO_EMAIL` | Your email address — receives lead + alert emails |
| `LEAD_FROM_EMAIL` | Verified sender address in Resend |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile (spam protection on the form) |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare Turnstile (client-side) |
| `NEXT_PUBLIC_GA_ID` | Google Analytics 4 measurement ID |
| `CRON_SECRET` | Protects the nightly rollup cron endpoint |
| `SITE_URL` | ⚠️ Currently set to Vercel preview URL — **update this last** (see Step 6) |
| `TWILIO_ACCOUNT_SID` | Twilio SMS lead forwarding — from console.twilio.com |
| `TWILIO_AUTH_TOKEN` | Twilio SMS lead forwarding — from console.twilio.com |
| `TWILIO_FROM_NUMBER` | Your Twilio phone number in E.164 format (e.g. `+18315551234`) |
| `NEXT_PUBLIC_SITE_URL` | Used by Twilio SMS to build the admin lead link — should match `SITE_URL` |

> ⚠️ Without the three `TWILIO_*` vars set, partner lead forwarding will silently fail (errors are logged to `/admin/errors` but no SMS is sent).

---

## 3. Point Your Domain

1. In **Vercel → Project → Settings → Domains**, add `santacruztreepros.com`
2. Vercel will show you the DNS records to add (typically an `A` record or `CNAME`)
3. Add those records in your domain registrar (GoDaddy, Namecheap, etc.)
4. Wait for DNS to propagate — usually **5–30 minutes**, up to 48 hours in rare cases
5. Vercel provisions the SSL certificate automatically once DNS resolves

✅ Confirm by visiting `https://santacruztreepros.com` — you should see the site with a valid padlock.

---

## 4. Update SITE_URL

Once the domain is live:

1. **Vercel → Settings → Environment Variables** → find `SITE_URL`
2. Change the value from the Vercel preview URL to `https://santacruztreepros.com`
3. Also update `NEXT_PUBLIC_SITE_URL` to the same value — it's what `lib/twilio.ts` uses to build the "Admin:" link in lead-forward SMS texts
4. Save, then **redeploy** (Deployments → three dots on latest → Redeploy)

> ⚠️ Do this **after** the domain is confirmed live — not before. If you flip it early, lead notification emails and error alert emails will have broken "View in Admin" links.

**Other places referencing the Vercel preview URL that also need to be swapped to `https://santacruztreepros.com` once the domain is live:**

- [ ] **Twilio Console → Phone Numbers → your number → Messaging Configuration → "A message comes in" webhook** — currently points at `https://santa-cruz-tree-site.vercel.app/api/twilio/inbound`
- [ ] **Twilio A2P 10DLC campaign registration** — if you submitted `https://santa-cruz-tree-site.vercel.app/sms-terms` as the terms URL, check whether Twilio lets you edit it post-approval or if it just needs to keep resolving (the preview URL will keep working either way since Vercel doesn't remove it, but the production URL looks more legitimate to carriers reviewing the campaign)

---

## 5. Set Up UptimeRobot

1. Go to [uptimerobot.com](https://uptimerobot.com) and create a free account
2. Add a new **HTTP(s)** monitor for `https://santacruztreepros.com`
3. Set check interval to **5 minutes**
4. Add your email as the alert contact

> Do this **after** Step 3 — no point monitoring a URL that isn't live yet.

---

## 6. Post-Launch Smoke Test

Run through these manually after everything is pointing correctly:

- [ ] Homepage loads at `https://santacruztreepros.com`
- [ ] All service pages load (tree removal, trimming, stump grinding, emergency, arborist)
- [ ] Free Estimate form completes all 3 steps and shows the in-panel success screen
- [ ] Lead appears in `/admin/leads` with correct details
- [ ] Photos attached to the lead (if submitted with photos)
- [ ] Lead notification email arrives in inbox with correct admin link (points to `santacruztreepros.com/admin/...`)
- [ ] Admin login works at `santacruztreepros.com/admin`
- [ ] Error alert email works — trigger a test by checking `/admin/errors` or waiting for a real one
- [ ] Add at least one partner in `/admin/partners` with a city match, then submit a test lead for that city and confirm the SMS forward arrives (check `/admin/leads/[leadId]` forward history if it doesn't)

---

## 7. Split Production and Staging Databases

Currently all environments (local dev, Vercel preview, production) share a single Neon database. Before launch, create a separate database for production so real customer data is isolated from test data and dev activity.

1. Go to [console.neon.tech](https://console.neon.tech) and create a new database (or branch) named `production`
2. Push the schema to it. **Do not use `prisma migrate deploy`** — the migration history in `prisma/migrations/` is SQLite-format and incompatible with Neon Postgres. This project's real migration path is `scripts/migrate-utm-geo.mjs`, a de-facto raw-SQL migration script that normally runs automatically as part of `npm run build`. Either:
   - Deploy once with `DATABASE_URL` pointed at the new DB (the build's `npm run build` step runs `prisma generate && node scripts/migrate-utm-geo.mjs && next build`, which creates all tables/columns idempotently), or
   - Run it manually first: `DATABASE_URL="<new-production-url>" node scripts/migrate-utm-geo.mjs`
3. In **Vercel → Settings → Environment Variables**, update `DATABASE_URL` and `DIRECT_URL` to the new production credentials — set scope to **Production** only
4. Keep the existing database credentials scoped to **Preview / Development** environments in Vercel so staging continues to use the separate DB

> ⚠️ Do this **before** going live. Once real leads start coming in on the production DB, you don't want dev/test deletions touching that data.

---

## 8. When You Get a Business Phone Number

Two places to add it:

**`components/ServiceCta.tsx`** — add as a secondary button default:
```tsx
secondaryHref = "tel:+18311234567",
secondaryLabel = "Call Now",
```

**`app/page.tsx`** — add back to the JSON-LD structured data:
```ts
telephone: "+18311234567",
```

---

*Last updated: March 2026*
