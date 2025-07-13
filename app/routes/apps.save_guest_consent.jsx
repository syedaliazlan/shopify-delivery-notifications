import { json } from "@remix-run/node";
import db from "../db.server";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*", // Change to "https://mglaser.com" for better security
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

export async function action({ request }) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405, headers: CORS_HEADERS });
  }

  try {
    const { sessionId, consent } = await request.json();

    if (!sessionId) {
      return json({ error: "Missing sessionId" }, { status: 400, headers: CORS_HEADERS });
    }

    // Save guest consent in database
    await db.guestConsent.upsert({
      where: { sessionId },
      update: { consent },
      create: { sessionId, consent },
    });

    console.log(`✅ Guest consent saved: session=${sessionId}, consent=${consent}`);
    return json({ success: true }, { headers: CORS_HEADERS });

  } catch (error) {
    console.error("❌ Error saving guest consent:", error);
    return json({ error: error.message }, { status: 500, headers: CORS_HEADERS });
  }
}

// ✅ Handle CORS Preflight Requests (OPTIONS)
export function loader() {
  return json({}, { status: 200, headers: CORS_HEADERS });
}
