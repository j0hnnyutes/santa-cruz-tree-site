/**
 * Idempotent migration script — adds columns that Prisma migrate can't handle
 * cleanly due to the SQLite-format migration history in this project.
 *
 * Uses prisma.$executeRawUnsafe so it works against any Postgres database
 * without touching _prisma_migrations or requiring prisma migrate deploy.
 * All statements use IF NOT EXISTS so it is safe to run multiple times.
 *
 * Covers:
 *   - PageView: utmSource, utmMedium, utmCampaign, country, region, city + indexes
 *   - Lead: photoUrls (TEXT[] for Vercel Blob URLs)
 *
 * Usage: node scripts/migrate-utm-geo.mjs
 * Vercel build: called automatically via `npm run build`.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const steps = [
  {
    name: 'Add utmSource column',
    sql: `ALTER TABLE "PageView" ADD COLUMN IF NOT EXISTS "utmSource" TEXT`,
  },
  {
    name: 'Add utmMedium column',
    sql: `ALTER TABLE "PageView" ADD COLUMN IF NOT EXISTS "utmMedium" TEXT`,
  },
  {
    name: 'Add utmCampaign column',
    sql: `ALTER TABLE "PageView" ADD COLUMN IF NOT EXISTS "utmCampaign" TEXT`,
  },
  {
    name: 'Add country column',
    sql: `ALTER TABLE "PageView" ADD COLUMN IF NOT EXISTS "country" TEXT`,
  },
  {
    name: 'Add region column',
    sql: `ALTER TABLE "PageView" ADD COLUMN IF NOT EXISTS "region" TEXT`,
  },
  {
    name: 'Add city column',
    sql: `ALTER TABLE "PageView" ADD COLUMN IF NOT EXISTS "city" TEXT`,
  },
  {
    name: 'Create UTM index',
    sql: `CREATE INDEX IF NOT EXISTS "PageView_utmSource_createdAt_idx" ON "PageView" ("utmSource", "createdAt")`,
  },
  {
    name: 'Create country index',
    sql: `CREATE INDEX IF NOT EXISTS "PageView_country_createdAt_idx" ON "PageView" ("country", "createdAt")`,
  },
  {
    name: 'Add photoUrls column to Lead',
    sql: `ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "photoUrls" TEXT[] DEFAULT '{}'`,
  },
  {
    name: 'Add utmSource column to Lead',
    sql: `ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "utmSource" TEXT`,
  },
  {
    name: 'Add utmMedium column to Lead',
    sql: `ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "utmMedium" TEXT`,
  },
  {
    name: 'Add utmCampaign column to Lead',
    sql: `ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "utmCampaign" TEXT`,
  },
  {
    name: 'Add isNewVisitor column to PageView',
    sql: `ALTER TABLE "PageView" ADD COLUMN IF NOT EXISTS "isNewVisitor" BOOLEAN`,
  },
  {
    name: 'Create DailyRollup table',
    sql: `CREATE TABLE IF NOT EXISTS "DailyRollup" (
      "id"             SERIAL PRIMARY KEY,
      "date"           TEXT NOT NULL,
      "views"          INTEGER NOT NULL,
      "sessions"       INTEGER NOT NULL,
      "avgDuration"    INTEGER,
      "bounceCount"    INTEGER NOT NULL,
      "newSessions"    INTEGER NOT NULL DEFAULT 0,
      "returnSessions" INTEGER NOT NULL DEFAULT 0,
      "mobileViews"    INTEGER NOT NULL DEFAULT 0,
      "desktopViews"   INTEGER NOT NULL DEFAULT 0,
      "topPages"       TEXT NOT NULL DEFAULT '[]',
      "topReferrers"   TEXT NOT NULL DEFAULT '[]',
      "utmSources"     TEXT NOT NULL DEFAULT '[]',
      "archivedAt"     TIMESTAMP NOT NULL DEFAULT NOW(),
      CONSTRAINT "DailyRollup_date_key" UNIQUE ("date")
    )`,
  },
  {
    name: 'Create DailyRollup date index',
    sql: `CREATE INDEX IF NOT EXISTS "DailyRollup_date_idx" ON "DailyRollup" ("date")`,
  },
  {
    name: 'Add sessionId column to Lead',
    sql: `ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "sessionId" TEXT`,
  },
  {
    name: 'Add maxScrollDepth column to PageView',
    sql: `ALTER TABLE "PageView" ADD COLUMN IF NOT EXISTS "maxScrollDepth" INTEGER`,
  },
];

console.log("Running UTM + geo schema migration...\n");

let allOk = true;
for (const step of steps) {
  try {
    await prisma.$executeRawUnsafe(step.sql);
    console.log(`  ✓ ${step.name}`);
  } catch (err) {
    console.error(`  ✗ ${step.name}: ${err.message}`);
    allOk = false;
  }
}

await prisma.$disconnect();

if (!allOk) {
  console.error("\nMigration completed with errors — see above.\n");
  process.exit(1);
}

console.log("\nMigration complete.\n");
