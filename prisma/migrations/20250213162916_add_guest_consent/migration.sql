-- CreateTable
CREATE TABLE "GuestConsent" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "consent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuestConsent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GuestConsent_sessionId_key" ON "GuestConsent"("sessionId");
