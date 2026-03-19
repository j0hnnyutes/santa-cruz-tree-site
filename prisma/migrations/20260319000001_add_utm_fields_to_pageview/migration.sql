-- Add UTM tracking columns to PageView
ALTER TABLE "PageView" ADD COLUMN IF NOT EXISTS "utmSource"   TEXT;
ALTER TABLE "PageView" ADD COLUMN IF NOT EXISTS "utmMedium"   TEXT;
ALTER TABLE "PageView" ADD COLUMN IF NOT EXISTS "utmCampaign" TEXT;

-- Index for UTM source lookups
CREATE INDEX IF NOT EXISTS "PageView_utmSource_createdAt_idx" ON "PageView" ("utmSource", "createdAt");
