-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Lead" (
    "leadId" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fullName" TEXT NOT NULL,
    "phoneDigits" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "address" TEXT NOT NULL DEFAULT 'UNKNOWN',
    "city" TEXT NOT NULL DEFAULT 'UNKNOWN',
    "service" TEXT NOT NULL,
    "details" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "contactedAt" DATETIME,
    "adminNotes" TEXT,
    "archivedAt" DATETIME
);
INSERT INTO "new_Lead" ("address", "adminNotes", "archivedAt", "city", "contactedAt", "createdAt", "details", "email", "fullName", "leadId", "phoneDigits", "service", "status") SELECT coalesce("address", 'UNKNOWN') AS "address", "adminNotes", "archivedAt", coalesce("city", 'UNKNOWN') AS "city", "contactedAt", "createdAt", "details", "email", "fullName", "leadId", "phoneDigits", "service", "status" FROM "Lead";
DROP TABLE "Lead";
ALTER TABLE "new_Lead" RENAME TO "Lead";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
