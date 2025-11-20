-- CreateTable
CREATE TABLE "ProxyUsage" (
    "id" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "requestCount" INTEGER NOT NULL DEFAULT 0,
    "lastUsed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dailyQuota" INTEGER NOT NULL DEFAULT 1000,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProxyUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProxyUsage_ipAddress_key" ON "ProxyUsage"("ipAddress");

-- CreateIndex
CREATE INDEX "ProxyUsage_ipAddress_idx" ON "ProxyUsage"("ipAddress");

-- CreateIndex
CREATE INDEX "ProxyUsage_lastUsed_idx" ON "ProxyUsage"("lastUsed");

-- CreateIndex
CREATE INDEX "ProxyUsage_status_idx" ON "ProxyUsage"("status");
