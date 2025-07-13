import { authenticate } from "../shopify.server";
import { getSmsTemplate, isNotificationSent, markNotificationSent } from "../models/smsTemplate.server";
import axios from "axios";

  // Function to send SMS via Twilio (server-only)
  const sendTwilioMessage = async (message, recipient) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;

  if (!accountSid || !authToken || !messagingServiceSid) {
    throw new Error("Twilio credentials are missing in environment variables");
  }

  const twilio = await import("twilio");
  const client = twilio.default(accountSid, authToken);

  try {
    const response = await client.messages.create({
      body: message,
      messagingServiceSid,
      to: recipient,
    });

    console.log("✅ Twilio SMS Sent:", response.sid);
  } catch (error) {
    console.error("❌ Error sending Twilio SMS:", error);
  }
};

// Function to format phone number to E.164 format
const formatPhoneNumber = (phone) => {
  if (!phone) return null;
  const cleaned = phone.replace(/[^0-9]/g, "");
  if (cleaned.length === 10) return `+1${cleaned}`;
  if (cleaned.length === 11 && cleaned.startsWith("1")) return `+${cleaned}`;
  return null;
};

// Function to fetch order details from Shopify
const getOrderDetails = async (shop, orderId, accessToken) => {
  const url = `https://${shop}/admin/api/2025-01/orders/${orderId}.json?fields=id,name,total_price,shipping_address,customer`;
  try {
    const response = await axios.get(url, {
      headers: { "X-Shopify-Access-Token": accessToken },
    });

    return response.data.order;
  } catch (error) {
    console.error("❌ Error fetching order details:", error.response?.data || error);
    return null;
  }
};

// Function to replace placeholders dynamically
// Function to replace placeholders dynamically
// Function to replace placeholders dynamically
const formatMessage = (template, orderData) => {
  console.log(`🔹 Formatting message: Order ID: ${orderData.orderId}, Order Name: ${orderData.orderName}`); // Debugging log

  return template
    .replace(/{First_Name}/g, orderData.firstName || "Customer")
    .replace(/{Order_Id}/g, orderData.orderName) // ✅ FIXED: Use orderName instead of orderId
    .replace(/{Tracking_Num}/g, orderData.trackingNumber || "N/A");
};



// Webhook handler
export const action = async ({ request }) => {
  try {
    const { shop, topic, payload } = await authenticate.webhook(request);
    console.log(`🔹 Shopify Webhook Received: ${topic} for ${shop}`);

    // Extract required fields
    const { order_id, shipment_status, tracking_number, destination } = payload;
    const first_name = destination?.first_name || "Customer";
    const country_code = destination?.country_code || null;

    console.log("📦 Webhook Data:", { order_id, shipment_status, tracking_number, first_name, country_code });

    // ✅ Ensure message is sent only for US customers
    if (country_code !== "US") {
      console.log("⚠️ Skipping message. Customer is not in the US.");
      return new Response();
    }

    // ✅ Fetch order details
    const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;
    const orderData = await getOrderDetails(shop, order_id, accessToken);
    if (!orderData) return new Response();

    // ✅ Extract and format phone number
    const rawPhone = orderData.shipping_address?.phone || null;
    const formattedPhone = formatPhoneNumber(rawPhone);
    console.log(`📞 Processed Phone Number: ${formattedPhone}`);
    if (!formattedPhone) {
      console.log("⚠️ Invalid or missing phone number. Skipping message.");
      return new Response();
    }

    // ✅ Check if customer has opted in for SMS notifications
    const customerId = orderData.customer?.id;
    if (!customerId) {
      console.log("🚫 No customer ID found. Skipping SMS notification.");
      return new Response();
    }

    const customerConsentQuery = `
      {
        customer(id: "gid://shopify/Customer/${customerId}") {
          metafield(namespace: "custom", key: "sms_notifications") {
            value
          }
        }
      }
    `;

    const consentResponse = await fetch(`https://${shop}/admin/api/2025-01/graphql.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": accessToken },
      body: JSON.stringify({ query: customerConsentQuery }),
    });

    const consentData = await consentResponse.json();
    const smsConsent = consentData?.data?.customer?.metafield?.value === "true";

    if (!smsConsent) {
      console.log("🚫 Customer did not opt-in for SMS notifications. Skipping.");
      return new Response();
    }

    console.log("✅ Customer has opted in for SMS notifications. Sending message...");

    // ✅ Fetch SMS template for the shop
    const smsTemplate = await getSmsTemplate(shop);
    if (!smsTemplate) {
      console.log("⚠️ No SMS template found, skipping message.");
      return new Response();
    }

    // ✅ Determine which message template to use
    let messageTemplate;
    let statusKey;

    switch (shipment_status) {
      case "in_transit":
        // 🚫 SKIPPING "on the way" message - enable by uncommenting below lines if needed
        /*
        messageTemplate = smsTemplate.inTransit;
        statusKey = "sent_in_transit";
        break;
        */
        console.log(`ℹ️ Skipping 'in_transit' message for order ${order_id}`);
        return new Response(); // ✅ Exits without sending the first message
    
      case "out_for_delivery":
        messageTemplate = smsTemplate.outForDelivery;
        statusKey = "sent_out_for_delivery";
        break;
    
      case "delivered":
        messageTemplate = smsTemplate.delivered;
        statusKey = "sent_delivered";
        break;
    
      default:
        console.log(`ℹ️ No message sent for status: ${shipment_status}`);
        return new Response();
    }

    // ✅ Check if message has already been sent for this specific order and status
    const alreadySent = await isNotificationSent(shop, order_id, statusKey);
    if (alreadySent) {
      console.log(`⚠️ Message for order ${order_id} (${shipment_status}) already sent, skipping.`);
      return new Response();
    }

    // ✅ Format the message by replacing placeholders
// ✅ Format the message by replacing placeholders
const message = formatMessage(messageTemplate, {
  firstName: first_name,
  orderId: order_id, // ❌ Do NOT use this
  orderName: orderData.name, // ✅ USE orderData.name instead
  trackingNumber: tracking_number,
});

console.log(`✅ Fetched order details: Order ID: ${orderData.id}, Order Name: ${orderData.name}`);



    console.log(`📨 Sending Twilio SMS: ${message} to ${formattedPhone}`);
    await sendTwilioMessage(message, formattedPhone);

    // ✅ Mark message as sent for this specific order and status
    await markNotificationSent(shop, order_id, statusKey);

    return new Response();
  } catch (error) {
    console.error("❌ Webhook processing error:", error);
    return new Response(null, { status: 500 });
  }
};
