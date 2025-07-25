import { authenticate, registerWebhooks } from "../shopify.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);

  // ✅ Register all webhooks after auth
  const result = await registerWebhooks({ session });

  console.log("✅ Webhooks registered:", result);

  return null;
};
