-- CreateTable: ErrorLog
CREATE TABLE "ErrorLog" (
    "id"        INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "severity"  TEXT NOT NULL,
    "type"      TEXT NOT NULL,
    "message"   TEXT NOT NULL,
    "stack"     TEXT,
    "path"      TEXT,
    "ip"        TEXT,
    "userAgent" TEXT,
    "metadata"  TEXT
);

-- CreateTable: PageView
CREATE TABLE "PageView" (
    "id"        INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "path"      TEXT NOT NULL,
    "referrer"  TEXT,
    "ip"        TEXT,
    "userAgent" TEXT,
    "sessionId" TEXT,
    "duration"  INTEGER
);

-- CreateTable: FormEvent
CREATE TABLE "FormEvent" (
    "id"        INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sessionId" TEXT,
    "eventType" TEXT NOT NULL,
    "fieldName" TEXT,
    "metadata"  TEXT
);

-- CreateIndex
CREATE INDEX "ErrorLog_createdAt_idx" ON "ErrorLog"("createdAt");
CREATE INDEX "ErrorLog_severity_createdAt_idx" ON "ErrorLog"("severity", "createdAt");
CREATE INDEX "ErrorLog_type_createdAt_idx" ON "ErrorLog"("type", "createdAt");
CREATE INDEX "PageView_createdAt_idx" ON "PageView"("createdAt");
CREATE INDEX "PageView_path_createdAt_idx" ON "PageView"("path", "createdAt");
CREATE INDEX "PageView_sessionId_createdAt_idx" ON "PageView"("sessionId", "createdAt");
CREATE INDEX "FormEvent_eventType_createdAt_idx" ON "FormEvent"("eventType", "createdAt");
CREATE INDEX "FormEvent_sessionId_createdAt_idx" ON "FormEvent"("sessionId", "createdAt");
