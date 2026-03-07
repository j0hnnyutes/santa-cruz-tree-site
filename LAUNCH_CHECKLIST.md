# Santa Cruz Tree Pros — Launch Checklist

## ✅ Done
- [x] Next.js site built and deployed to Vercel
- [x] Lead capture form with Cloudflare Turnstile
- [x] Lead email notifications (with duplicate detection)
- [x] Admin dashboard (leads table, export, analytics)
- [x] All service pages (tree removal, trimming, stump grinding, emergency, arborist)
- [x] Service area pages (Santa Cruz, Capitola, Soquel, Aptos, Watsonville, Scotts Valley, Live Oak, Felton, Boulder Creek, Ben Lomond, Monterey)
- [x] Privacy policy page
- [x] Contact page
- [x] Sitemap (all pages including /contact and /privacy-policy)
- [x] Cross-browser font consistency (Inter font via next/font/google)
- [x] LocalBusiness JSON-LD structured data on homepage
- [x] OpenGraph / Twitter Card metadata on all pages

---

## 🔧 Code — Before Launch
- [ ] **Replace `tel:+1XXXXXXXXXX` placeholder** with real phone number
  - `components/ServiceCta.tsx` (default prop)
  - `app/services/tree-removal/page.tsx`
  - `app/services/tree-trimming/page.tsx`
  - `app/services/stump-grinding-root-removal/page.tsx`
  - `app/services/emergency-tree-service/page.tsx`
  - `app/services/arborist-consulting/page.tsx`
- [ ] **Update LocalBusiness schema** with real phone number (`app/page.tsx`)
- [ ] **Update `SITE_URL`** in Vercel environment variables from Vercel preview URL → `https://santacruztreepros.com`

---

## 🌐 Domain & Hosting — Before Launch
- [ ] **Point `santacruztreepros.com` DNS to Vercel**
  - Add Vercel nameservers or A/CNAME records at your domain registrar
  - Add domain in Vercel project settings → Domains
- [ ] Confirm SSL certificate is issued on Vercel (automatic once DNS propagates)
- [ ] Test site loads at `https://santacruztreepros.com`

---

## 📈 SEO & Marketing — After Launch
- [ ] **Create / claim Google Business Profile** at [business.google.com](https://business.google.com)
  - Add business name, address, phone, hours, photos, service area
  - This is the #1 local SEO driver
- [ ] Submit sitemap to Google Search Console (`https://santacruztreepros.com/sitemap.xml`)
- [ ] Verify site in Google Search Console
- [ ] Test LocalBusiness schema at [Google Rich Results Test](https://search.google.com/test/rich-results)
- [ ] Set up Google Analytics or equivalent
- [ ] Build local citations (Yelp, Angi, HomeAdvisor, BBB, Bing Places)

---

## 🚀 Nice to Have (Post-Launch)
- [ ] Blog section (tree care tips, seasonal content — boosts organic rankings)
- [ ] About page (team, credentials, story)
- [ ] Customer reviews / testimonials section
- [ ] Image alt text audit across all pages
