import db from "../db.server";

/**
 * Fetch the SMS template for a given shop
 */
export async function getSmsTemplate(shop) {
  return await db.smsTemplate.findFirst({ where: { shop } });
}

/**
 * Upsert (Update or Insert) SMS Template for a shop
 */
export async function upsertSmsTemplate(shop, updatedTemplate) {
  // First, find the existing template for the shop
  const existingTemplate = await db.smsTemplate.findFirst({
    where: { shop },
    select: { id: true }, // Fetch only the ID
  });

  if (existingTemplate) {
    return await db.smsTemplate.update({
      where: { id: existingTemplate.id }, // ✅ Use ID as the unique identifier
      data: updatedTemplate,
    });
  } else {
    return await db.smsTemplate.create({
      data: { shop, ...updatedTemplate },
    });
  }
}

/**
 * Check if a message has already been sent for a specific order and status
 */
export async function isNotificationSent(shop, orderId, statusType) {
  const record = await db.orderNotificationStatus.findUnique({
    where: { shop_orderId: { shop, orderId: String(orderId) } },
  });

  return record ? record[statusType] : false; // Use statusType directly
}

/**
 * Mark a notification as sent
 */
export async function markNotificationSent(shop, orderId, statusType) {
  await db.orderNotificationStatus.upsert({
    where: { shop_orderId: { shop, orderId: String(orderId) } },
    update: { [statusType]: true }, // Fix: Use statusType directly
    create: {
      shop,
      orderId: String(orderId),
      sent_dispatched: false,
      sent_in_transit: false,
      sent_out_for_delivery: false,
      sent_delivered: false,
      [statusType]: true, // Fix: Update only the relevant flag
    },
  });
}

