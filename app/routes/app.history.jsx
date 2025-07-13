import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Page, Card, DataTable, Text } from "@shopify/polaris";
import twilio from "twilio";

// Utility function to format date properly
const formatDate = (isoString) => {
  if (!isoString) return "N/A";
  const date = new Date(isoString);
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
};

// **Backend Loader Function**
export async function loader() {

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    console.error("🚫 Missing Twilio credentials in environment variables.");
    return json({ messages: [] });
  }

  const client = twilio(accountSid, authToken);

  try {
    const messagesResponse = await client.messages.list({ limit: 20 });

    const formattedMessages = messagesResponse.map((msg) => ({
      to: msg.to,
      dateSent: msg.dateSent ? formatDate(msg.dateSent) : "N/A",
      body: msg.body.replace(/\n/g, " "), // Replace newlines with spaces for cleaner display
      status: msg.status,
    }));

    // console.log("✅ Retrieved Messages:", formattedMessages.map(m => m.body));

    return json({ messages: formattedMessages });
  } catch (error) {
    console.error("❌ Error fetching Twilio messages:", error);
    return json({ messages: [] });
  }
}

// **Frontend Component**
export default function MessageHistory() {
  const { messages } = useLoaderData();

  const rows = messages.map((msg) => [
    msg.to,
    msg.dateSent,
    <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{msg.body}</div>, // Ensures text wraps properly
    msg.status,
  ]);

  return (
    <Page title="Message History">
      <Card>
        <Text as="p" alignment="center" variant="bodyMd" fontWeight="bold" tone="subdued">
          Recent 20 Messages from Twilio
        </Text>
        <DataTable
          columnContentTypes={["text", "text", "text", "text"]}
          headings={["To", "Date Sent", "Message", "Status"]}
          rows={rows}
          truncate={false} // Ensure text wraps instead of truncating
        />
      </Card>
    </Page>
  );
}
