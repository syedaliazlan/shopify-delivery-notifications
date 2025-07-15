import { json } from "@remix-run/node";
import { authenticate, registerWebhooks } from "../shopify.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);

  const result = await registerWebhooks({ session });

  console.log("✅ Manual Webhook Init Result:", result);

  return json({
    status: "Webhooks registered",
    details: result,
  });
};
