import { json } from "@remix-run/node";
import db from "../db.server";

const SHOPIFY_API_VERSION = "2025-01";
const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;

export async function action({ request }) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const payload = await request.json();
    const orderId = payload.id;
    const customerId = payload.customer?.id;

    console.log(`📦 Processing orders/create webhook for Order ID: ${orderId}`);

    if (!customerId) {
      return json({ error: "No customer ID found" }, { status: 400 });
    }

    // ✅ Fetch sessionId from Shopify order attributes
    const sessionId = payload.note_attributes?.find(attr => attr.name === "guest_session_id")?.value;

    if (!sessionId) {
      console.log(`🚫 No guest sessionId found in order attributes.`);
      return json({ success: false });
    }

    // ✅ Fetch guest consent from DB
    const guestConsent = await db.guestConsent.findUnique({ where: { sessionId } });

    if (!guestConsent) {
      console.log(`🚫 No guest consent found for session: ${sessionId}`);
      return json({ success: false });
    }

    console.log(`✅ Guest consent found! Updating metafield for customer ID: ${customerId}`);

    // ✅ Update Shopify Customer Metafield
    const mutation = `
      mutation {
        metafieldsSet(metafields: [{
          namespace: "custom",
          key: "sms_notifications",
          ownerId: "gid://shopify/Customer/${customerId}",
          type: "boolean",
          value: "${guestConsent.consent}"
        }]) {
          metafields { id key value }
        }
      }
    `;

    await fetch(`https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
      },
      body: JSON.stringify({ query: mutation }),
    });

    console.log(`✅ Successfully updated metafield for Customer ID: ${customerId}`);

    return json({ success: true });
  } catch (error) {
    console.error("❌ Error processing orders/create webhook:", error);
    return json({ error: error.message }, { status: 500 });
  }
}
