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

// Utility function to safely extract property values from nested or flat structures
function getPropertyValue(propertyValue: unknown): string {
  if (propertyValue == null) return "";

  // Handle object with .value field (nested structure)
  if (typeof propertyValue === "object" && propertyValue !== null) {
    const propObj = propertyValue as { value?: unknown };
    if ("value" in propObj) {
      return String(propObj.value ?? "");
    }
  }

  // Handle flat string value (legacy structure)
  return String(propertyValue);
}

export default hubspot.extend<"crm.record.sidebar">(({ context, actions }) => (
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
  const portalId = context.portal?.id;

  // Load settings from API on mount
  useEffect(() => {
    const loadSettings = async () => {
      if (!portalId) {
        console.error("Portal ID not available");
        setButtonConfigs(DEFAULT_BUTTON_CONFIGS);
        setIsLoadingSettings(false);
        return;
      }

      try {
        const response = await hubspot.fetch(
          `https://oauth.kinghenry.au/api/settings/${portalId}`
        );

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.settings) {
            const settings = data.settings as AppSettings;
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
          }
        } else if (response.status === 404) {
          // No settings found, use defaults
          console.log("No settings found, using defaults");
          setButtonConfigs(DEFAULT_BUTTON_CONFIGS);
        } else {
          console.error("Failed to load settings:", response.status);
          setButtonConfigs(DEFAULT_BUTTON_CONFIGS);
        }
      } catch (err) {
        console.error("Error loading settings:", err);
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
  }, [isContact, isCompany, portalId]);

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
      <Flex direction="column" align="center" gap="medium">
        <LoadingSpinner label="Loading..." />
      </Flex>
    );
  }

  // Show loading state while properties are loading
  if (isLoading) {
    return (
      <Flex direction="column" align="center" gap="medium">
        <LoadingSpinner label="Loading..." />
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
      const url = getPropertyValue(properties?.[config.urlProperty]);

      let label: string;
      if (config.labelType === "static") {
        label = config.staticLabel;
      } else if (config.labelProperty) {
        label = getPropertyValue(properties?.[config.labelProperty]) || config.staticLabel;
      } else {
        label = config.staticLabel;
      }

      const hasUrl = Boolean(url && url.trim() !== "");

      return {
        url,
        label,
        hasUrl,
      };
    })
    .filter((button) => button.hasUrl);

  // If no buttons have URLs configured, show empty state
  if (buttons.length === 0) {
    return (
      <EmptyState title="No quick links" layout="vertical" imageName="link">
        <Text>Configure URL properties in settings to display quick access buttons on this record.</Text>
        <Button
          onClick={() => actions.openSettingsPage()}
          variant="primary"
          size="sm"
        >
          Configure Links
        </Button>
      </EmptyState>
    );
  }

  return (
    <Flex direction="column" gap="small">
      {buttons.map((button, index) => (
        <CrmActionButton
          key={index}
          actionType="EXTERNAL_URL"
          actionContext={{
            href: normalizeUrl(button.url),
          }}
          variant="primary"
        >
          {button.label}
        </CrmActionButton>
      ))}
    </Flex>
  );
};

// Helper function to ensure URLs have a protocol
function normalizeUrl(url: string): string {
  if (!url) return "";
  const trimmed = url.trim();
  if (trimmed === "") return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `https://${trimmed}`;
}
