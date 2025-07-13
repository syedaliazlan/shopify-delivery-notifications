/*
  Warnings:

  - You are about to drop the column `sent_delivered` on the `SmsTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `sent_dispatched` on the `SmsTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `sent_in_transit` on the `SmsTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `sent_out_for_delivery` on the `SmsTemplate` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "SmsTemplate" DROP COLUMN "sent_delivered",
DROP COLUMN "sent_dispatched",
DROP COLUMN "sent_in_transit",
DROP COLUMN "sent_out_for_delivery";
