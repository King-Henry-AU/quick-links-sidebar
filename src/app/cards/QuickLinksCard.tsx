import React from "react";
import {
  Flex,
  Text,
  EmptyState,
  LoadingSpinner,
  Alert,
  hubspot,
} from "@hubspot/ui-extensions";
import { CrmActionButton, useCrmProperties } from "@hubspot/ui-extensions/crm";

// Define the button configuration type
interface ButtonConfig {
  urlProperty: string;
  labelProperty: string;
  defaultLabel: string;
}

// Configuration for the buttons - customize these property names as needed
const BUTTON_CONFIGS: ButtonConfig[] = [
  {
    urlProperty: "button_url_1",
    labelProperty: "button_label_1",
    defaultLabel: "Link 1",
  },
  {
    urlProperty: "button_url_2",
    labelProperty: "button_label_2",
    defaultLabel: "Link 2",
  },
  {
    urlProperty: "button_url_3",
    labelProperty: "button_label_3",
    defaultLabel: "Link 3",
  },
];

// Get all property names we need to fetch
const propertiesToFetch = BUTTON_CONFIGS.flatMap((config) => [
  config.urlProperty,
  config.labelProperty,
]);

hubspot.extend<"crm.record.sidebar">(({ context }) => (
  <QuickLinksCard context={context} />
));

interface QuickLinksCardProps {
  context: any;
}

const QuickLinksCard = ({ context }: QuickLinksCardProps) => {
  // Fetch the URL and label properties from the current record
  const { properties, isLoading, error } = useCrmProperties(propertiesToFetch);

  if (isLoading) {
    return (
      <Flex direction="column" align="center" gap="small">
        <LoadingSpinner label="Loading links..." />
      </Flex>
    );
  }

  if (error) {
    return (
      <Alert title="Error loading properties" variant="error">
        {error.message || "Unable to load link properties from this record."}
      </Alert>
    );
  }

  // Build the list of buttons that have valid URLs
  const buttons = BUTTON_CONFIGS.map((config) => {
    const url = properties?.[config.urlProperty];
    const label = properties?.[config.labelProperty] || config.defaultLabel;

    return {
      url,
      label,
      hasUrl: Boolean(url && url.trim() !== ""),
    };
  }).filter((button) => button.hasUrl);

  // If no buttons have URLs configured, show empty state
  if (buttons.length === 0) {
    return (
      <EmptyState title="No links configured" layout="vertical" imageName="link">
        <Text>
          This card displays quick link buttons based on custom properties.
          To configure, create the following properties on this object type:
        </Text>
        <Text format={{ fontWeight: "demibold" }}>
          URL Properties (Calculation - String):
        </Text>
        <Text>button_url_1, button_url_2, button_url_3</Text>
        <Text format={{ fontWeight: "demibold" }}>
          Label Properties (Single-line text):
        </Text>
        <Text>button_label_1, button_label_2, button_label_3</Text>
      </EmptyState>
    );
  }

  return (
    <Flex direction="column" gap="small">
      <Text format={{ fontWeight: "demibold" }}>Quick Links</Text>
      <Flex direction="column" gap="extra-small">
        {buttons.map((button, index) => (
          <CrmActionButton
            key={index}
            actionType="EXTERNAL_URL"
            actionContext={{
              href: normalizeUrl(button.url),
            }}
            variant="secondary"
          >
            {button.label}
          </CrmActionButton>
        ))}
      </Flex>
    </Flex>
  );
};

// Helper function to ensure URLs have a protocol
function normalizeUrl(url: string): string {
  if (!url) return url;
  const trimmed = url.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `https://${trimmed}`;
}
