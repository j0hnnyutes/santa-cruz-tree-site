-- CreateTable: AdminConfig (key-value store for admin settings)
CREATE TABLE "AdminConfig" (
    "key"       TEXT NOT NULL PRIMARY KEY,
    "value"     TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
