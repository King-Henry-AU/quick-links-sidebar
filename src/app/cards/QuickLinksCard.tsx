import React, { useState, useEffect } from "react";
import {
  Flex,
  Text,
  EmptyState,
  LoadingSpinner,
  Alert,
  Button,
  hubspot,
} from "@hubspot/ui-extensions";
import { CrmActionButton, useCrmProperties } from "@hubspot/ui-extensions/crm";

// Define the settings structure (must match Settings.tsx)
interface ButtonSettings {
  urlProperty: string;
  labelType: "property" | "static";
  labelProperty?: string;
  staticLabel: string;
}

interface AppSettings {
  contactButtons: ButtonSettings[];
  companyButtons: ButtonSettings[];
  // Legacy format for backward compatibility
  buttons?: ButtonSettings[];
}

// Default fallback configuration (backward compatibility)
const DEFAULT_BUTTON_CONFIGS: ButtonSettings[] = [
  {
    urlProperty: "button_url_1",
    labelType: "property",
    labelProperty: "button_label_1",
    staticLabel: "Link 1",
  },
  {
    urlProperty: "button_url_2",
    labelType: "property",
    labelProperty: "button_label_2",
    staticLabel: "Link 2",
  },
  {
    urlProperty: "button_url_3",
    labelType: "property",
    labelProperty: "button_label_3",
    staticLabel: "Link 3",
  },
];

hubspot.extend<"crm.record.sidebar">(({ context, actions }) => (
  <QuickLinksCard context={context} actions={actions} />
));

interface QuickLinksCardProps {
  context: any;
  actions: any;
}

const QuickLinksCard = ({ context, actions }: QuickLinksCardProps) => {
  const [buttonConfigs, setButtonConfigs] = useState<ButtonSettings[]>([]);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  // Detect object type from context
  const objectType = context.crm?.objectTypeId;
  const isContact = objectType === "0-1"; // Contact object type
  const isCompany = objectType === "0-2"; // Company object type

  // Load settings on mount
  useEffect(() => {
    const loadSettings = () => {
      try {
        const savedData = localStorage.getItem("sidebar_quick_links_settings");
        if (savedData) {
          const settings = JSON.parse(savedData) as AppSettings;
          let buttonsToUse: ButtonSettings[] = [];

          // Determine which button configuration to use based on object type
          if (isContact && settings.contactButtons) {
            buttonsToUse = settings.contactButtons;
          } else if (isCompany && settings.companyButtons) {
            buttonsToUse = settings.companyButtons;
          } else if (settings.buttons) {
            // Legacy format - use the old single array
            buttonsToUse = settings.buttons;
          }

          // Filter out buttons with no URL property configured
          const validButtons = buttonsToUse.filter(
            (btn) => btn.urlProperty && btn.urlProperty.trim() !== ""
          );
          setButtonConfigs(
            validButtons.length > 0 ? validButtons : DEFAULT_BUTTON_CONFIGS
          );
        } else {
          // No settings configured, use defaults
          setButtonConfigs(DEFAULT_BUTTON_CONFIGS);
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
        setSettingsError(
          err instanceof Error ? err.message : "Failed to load settings"
        );
        // Fall back to defaults on error
        setButtonConfigs(DEFAULT_BUTTON_CONFIGS);
      } finally {
        setIsLoadingSettings(false);
      }
    };
    loadSettings();
  }, [isContact, isCompany]);

  // Build list of properties to fetch based on button configs
  const propertiesToFetch = buttonConfigs.flatMap((config) => {
    const props = [config.urlProperty];
    if (config.labelType === "property" && config.labelProperty) {
      props.push(config.labelProperty);
    }
    return props;
  });

  // Fetch the properties from the current record
  const { properties, isLoading, error } = useCrmProperties(
    propertiesToFetch.length > 0 ? propertiesToFetch : ["hs_object_id"] // Fetch dummy property if no configs
  );

  // Show loading state while settings are loading
  if (isLoadingSettings) {
    return (
      <Flex direction="column" align="center" gap="small">
        <LoadingSpinner label="Loading settings..." />
      </Flex>
    );
  }

  // Show loading state while properties are loading
  if (isLoading) {
    return (
      <Flex direction="column" align="center" gap="small">
        <LoadingSpinner label="Loading links..." />
      </Flex>
    );
  }

  // Show error if settings failed to load
  if (settingsError) {
    return (
      <Alert title="Settings error" variant="warning">
        {settingsError}. Using default configuration.
      </Alert>
    );
  }

  // Show error if properties failed to load
  if (error) {
    return (
      <Alert title="Error loading properties" variant="error">
        {error.message || "Unable to load link properties from this record."}
      </Alert>
    );
  }

  // Build the list of buttons that have valid URLs
  const buttons = buttonConfigs
    .map((config) => {
      const url = properties?.[config.urlProperty];
      let label: string;

      if (config.labelType === "static") {
        label = config.staticLabel;
      } else if (config.labelProperty) {
        label = properties?.[config.labelProperty] || config.staticLabel;
      } else {
        label = config.staticLabel;
      }

      return {
        url,
        label,
        hasUrl: Boolean(url && url.trim() !== ""),
      };
    })
    .filter((button) => button.hasUrl);

  // If no buttons have URLs configured, show empty state
  if (buttons.length === 0) {
    return (
      <EmptyState title="No links configured" layout="vertical" imageName="link">
        <Text>
          This card displays quick link buttons based on CRM properties you
          configure.
        </Text>
        <Text>
          Go to <strong>Settings</strong> to choose which properties to use for
          button URLs and labels.
        </Text>
        <Button
          onClick={() => actions.openSettingsPage()}
          variant="primary"
          size="sm"
        >
          Open Settings
        </Button>
      </EmptyState>
    );
  }

  return (
    <Flex direction="column" gap="small">
      <Flex direction="row" justify="between" align="center">
        <Text format={{ fontWeight: "demibold" }}>Quick Links</Text>
        <Button
          onClick={() => actions.openSettingsPage()}
          variant="transparent"
          size="xs"
        >
          ⚙️
        </Button>
      </Flex>
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
      <Flex direction="row" justify="center">
        <Text variant="microcopy">
          Powered by{" "}
          <a
            href="https://kinghenry.com.au"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#0091ae", textDecoration: "none" }}
          >
            King Henry
          </a>
        </Text>
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
