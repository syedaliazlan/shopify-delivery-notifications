-- AlterTable
ALTER TABLE "SmsTemplate" ADD COLUMN     "sent_delivered" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sent_in_transit" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sent_out_for_delivery" BOOLEAN NOT NULL DEFAULT false;
