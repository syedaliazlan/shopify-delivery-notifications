-- CreateTable
CREATE TABLE "OrderNotificationStatus" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "sent_dispatched" BOOLEAN NOT NULL DEFAULT false,
    "sent_in_transit" BOOLEAN NOT NULL DEFAULT false,
    "sent_out_for_delivery" BOOLEAN NOT NULL DEFAULT false,
    "sent_delivered" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderNotificationStatus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrderNotificationStatus_shop_orderId_key" ON "OrderNotificationStatus"("shop", "orderId");
