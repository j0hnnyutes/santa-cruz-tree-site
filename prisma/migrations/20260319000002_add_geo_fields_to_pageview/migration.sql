-- Add geolocation columns to PageView (populated from Vercel edge headers)
ALTER TABLE "PageView" ADD COLUMN IF NOT EXISTS "country" TEXT;
ALTER TABLE "PageView" ADD COLUMN IF NOT EXISTS "region"  TEXT;
ALTER TABLE "PageView" ADD COLUMN IF NOT EXISTS "city"    TEXT;

CREATE INDEX IF NOT EXISTS "PageView_country_createdAt_idx" ON "PageView" ("country", "createdAt");
