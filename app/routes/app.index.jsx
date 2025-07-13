import { Page, Card, TextContainer } from "@shopify/polaris";

export default function Index() {
  return (
    <Page title="Delivery Overview">
      <Card sectioned>
        <TextContainer>
          <p>Welcome to the Delivery App. Use the sidebar to navigate.</p>
        </TextContainer>
      </Card>
    </Page>
  );
}
