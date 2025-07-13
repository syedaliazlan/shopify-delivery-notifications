import { useState, useEffect } from "react";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, Form, useNavigation } from "@remix-run/react";
import { authenticate } from "../shopify.server";
import { getSmsTemplate, upsertSmsTemplate } from "../models/smsTemplate.server";
import { Page, Card, TextField, FormLayout, PageActions, Button } from "@shopify/polaris";

// ✅ Loader: Fetch existing SMS template
export async function loader({ request }) {
  const { session } = await authenticate.admin(request);
  const { shop } = session;

  const smsTemplate = await getSmsTemplate(shop);
  return json({ smsTemplate });
}

// ✅ Action: Handle form submission
export async function action({ request }) {
  const { session } = await authenticate.admin(request);
  const { shop } = session;

  const formData = await request.formData();
  const updatedTemplate = {
    dispatched: formData.get("dispatched"),
    inTransit: formData.get("inTransit"),
    outForDelivery: formData.get("outForDelivery"),
    delivered: formData.get("delivered"),
  };

  await upsertSmsTemplate(shop, updatedTemplate);

  return redirect("/app/settings?saved=true"); // ✅ Redirect after save
}

// ✅ SMS Template Form Component
export default function SmsTemplateForm() {
  const { smsTemplate } = useLoaderData();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const [templateData, setTemplateData] = useState({
    dispatched: smsTemplate?.dispatched || "",
    inTransit: smsTemplate?.inTransit || "",
    outForDelivery: smsTemplate?.outForDelivery || "",
    delivered: smsTemplate?.delivered || "",
  });

  // ✅ Available placeholders
  const placeholders = ["{First_Name}", "{Order_Id}", "{Tracking_Num}"];

  // ✅ Function to insert placeholders into the respective field
  const insertPlaceholder = (field, placeholder) => {
    setTemplateData((prev) => {
      const value = prev[field];
      const cursorPosition = document.getElementById(field).selectionStart || value.length;
      return {
        ...prev,
        [field]: value.slice(0, cursorPosition) + placeholder + value.slice(cursorPosition),
      };
    });
  };

  return (
    <Page title="SMS Templates">
      <Form method="post">
        <Card sectioned>
          <FormLayout>
            {[
              { key: "dispatched", label: "📦 Dispatched" },
              { key: "inTransit", label: "🚚 In Transit" },
              { key: "outForDelivery", label: "📍 Out for Delivery" },
              { key: "delivered", label: "✅ Delivered" },
            ].map(({ key, label }) => (
              <div key={key} style={{ marginBottom: "20px" }}>
                {/* ✅ Enhanced Heading */}
                <h2 style={{ fontWeight: "bold", fontSize: "16px", marginBottom: "5px" }}>{label}</h2>

                {/* ✅ Placeholder Toolbar */}
                <div style={{ marginBottom: "8px" }}>
                  {placeholders.map((ph) => (
                    <Button
                      key={ph}
                      size="slim"
                      onClick={(e) => {
                        e.preventDefault();
                        insertPlaceholder(key, ph);
                      }}
                    >
                      {ph}
                    </Button>
                  ))}
                </div>

                {/* ✅ Editable Text Field */}
                <TextField
                  id={key}
                  name={key}
                  value={templateData[key]}
                  onChange={(value) => setTemplateData((prev) => ({ ...prev, [key]: value }))}
                  multiline={3}
                  required
                />
              </div>
            ))}
          </FormLayout>
        </Card>

        {/* ✅ Save Button */}
        <PageActions
          primaryAction={{
            content: isSubmitting ? "Saving..." : "Save",
            submit: true,
            disabled: isSubmitting,
          }}
        />
      </Form>
    </Page>
  );
}
