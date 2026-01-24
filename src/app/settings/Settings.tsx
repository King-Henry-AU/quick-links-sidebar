import React, { useState, useEffect } from "react";
import {
  Flex,
  Text,
  Button,
  Input,
  Select,
  Divider,
  Alert,
  hubspot,
  Tabs,
  Tab,
  LoadingSpinner,
} from "@hubspot/ui-extensions";

// Define the settings structure
interface ButtonSettings {
  urlProperty: string;
  labelType: "property" | "static";
  labelProperty?: string;
  staticLabel: string;
}

interface AppSettings {
  contactButtons: ButtonSettings[];
  companyButtons: ButtonSettings[];
}

const DEFAULT_SETTINGS: AppSettings = {
  contactButtons: [],
  companyButtons: [],
};

hubspot.extend(({ context }) => <Settings context={context} />);

interface SettingsProps {
  context: any;
}

const Settings = ({ context }: SettingsProps) => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("contacts");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const portalId = context.portal?.id;

  // Load settings from API on mount
  useEffect(() => {
    const loadSettings = async () => {
      if (!portalId) {
        setError("Portal ID not available");
        setIsLoading(false);
        return;
      }

      try {
        const response = await hubspot.fetch(
          `https://oauth.kinghenry.au/api/settings/${portalId}`
        );

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.settings) {
            setSettings(data.settings);
          }
        } else if (response.status === 404) {
          // No settings found, use defaults
          console.log("No settings found, using defaults");
        } else {
          console.error("Failed to load settings:", response.status);
        }
      } catch (err) {
        console.error("Error loading settings:", err);
        // Silently fail and use defaults
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [portalId]);

  const handleSave = async () => {
    if (!portalId) {
      setError("Portal ID not available");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      console.log("Saving settings for portal:", portalId);
      console.log("Settings:", JSON.stringify(settings).substring(0, 200));

      const response = await hubspot.fetch(
        `https://oauth.kinghenry.au/api/settings/${portalId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ settings }),
        }
      );

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log("Save successful:", data);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        // Try to parse error response, but handle cases where body is empty
        let errorMessage = "Failed to save settings";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
          console.error("Save failed:", errorData);
        } catch (parseError) {
          console.error("Could not parse error response:", parseError);
          errorMessage = `Server error (${response.status})`;
        }
        setError(errorMessage);
        setSaveSuccess(false);
      }
    } catch (err) {
      console.error("Error saving settings:", err);
      setError(err instanceof Error ? err.message : "Failed to save settings");
      setSaveSuccess(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    setSaveSuccess(false);
    setError(null);
  };

  const handleDebug = async () => {
    if (!portalId) {
      setError("Portal ID not available");
      return;
    }

    try {
      console.log("=== DEBUG INFO ===");
      console.log("Portal ID:", portalId);
      console.log("Settings to save:", JSON.stringify(settings, null, 2));

      // Test 1: Check if backend is reachable
      console.log("\n=== TEST 1: Health Check ===");
      try {
        const healthResponse = await hubspot.fetch(
          `https://oauth.kinghenry.au/health`
        );
        console.log("Health check status:", healthResponse.status);
        if (healthResponse.ok) {
          const healthData = await healthResponse.json();
          console.log("Health data:", JSON.stringify(healthData, null, 2));
        }
      } catch (err) {
        console.error("Health check failed:", err);
      }

      // Test 2: Try the actual settings endpoint
      console.log("\n=== TEST 2: Settings Endpoint ===");
      const response = await hubspot.fetch(
        `https://oauth.kinghenry.au/api/settings/${portalId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ settings }),
        }
      );

      console.log("Settings POST status:", response.status);
      console.log("Response headers:", JSON.stringify(Object.fromEntries(response.headers.entries())));

      if (response.ok) {
        const data = await response.json();
        console.log("SUCCESS! Response:", JSON.stringify(data, null, 2));
        setError("✓ Check console - request succeeded!");
      } else {
        const text = await response.text();
        console.error("FAILED! Response body:", text);
        setError(`Debug failed with status ${response.status} - check console`);
      }
    } catch (error) {
      console.error("Debug error:", error);
      setError(`Debug error: ${error.message}`);
    }
  };

  const addButton = () => {
    const buttonsKey = activeTab === "contacts" ? "contactButtons" : "companyButtons";
    const currentButtons = settings[buttonsKey];
    setSettings({
      ...settings,
      [buttonsKey]: [
        ...currentButtons,
        {
          urlProperty: "",
          labelType: "static",
          staticLabel: `Link ${currentButtons.length + 1}`,
        },
      ],
    });
  };

  const removeButton = (index: number) => {
    const buttonsKey = activeTab === "contacts" ? "contactButtons" : "companyButtons";
    const newButtons = settings[buttonsKey].filter((_, i) => i !== index);
    setSettings({ ...settings, [buttonsKey]: newButtons });
  };

  const updateButton = (index: number, updates: Partial<ButtonSettings>) => {
    const buttonsKey = activeTab === "contacts" ? "contactButtons" : "companyButtons";
    const newButtons = [...settings[buttonsKey]];
    newButtons[index] = { ...newButtons[index], ...updates };
    setSettings({ ...settings, [buttonsKey]: newButtons });
  };

  const renderButtonConfigurations = (buttons: ButtonSettings[]) => {
    return (
      <>
        <Text format={{ fontWeight: "demibold" }}>Button Configuration</Text>

        {buttons.map((button, index) => (
          <Flex key={index} direction="column" gap="small">
            <Flex direction="row" justify="between" align="center">
              <Text format={{ fontWeight: "demibold" }}>Button {index + 1}</Text>
              {buttons.length > 1 && (
                <Button
                  onClick={() => removeButton(index)}
                  variant="secondary"
                  size="xs"
                >
                  Remove
                </Button>
              )}
            </Flex>

            <Flex direction="row" gap="small">
              <Flex direction="column" gap="extra-small" flex={1}>
                <Text variant="microcopy">URL Property Name</Text>
                <Input
                  name={`url-property-${index}`}
                  value={button.urlProperty}
                  onChange={(value) =>
                    updateButton(index, { urlProperty: value })
                  }
                  placeholder="e.g., linkedin_url"
                />
              </Flex>

              <Flex direction="column" gap="extra-small" flex={1}>
                <Text variant="microcopy">Label Type</Text>
                <Select
                  name={`label-type-${index}`}
                  value={button.labelType}
                  onChange={(value) =>
                    updateButton(index, {
                      labelType: value as "property" | "static",
                    })
                  }
                  options={[
                    { label: "Static Text", value: "static" },
                    { label: "From Property", value: "property" },
                  ]}
                />
              </Flex>
            </Flex>

            {button.labelType === "static" ? (
              <Flex direction="column" gap="extra-small">
                <Text variant="microcopy">Button Label</Text>
                <Input
                  name={`static-label-${index}`}
                  value={button.staticLabel}
                  onChange={(value) =>
                    updateButton(index, { staticLabel: value })
                  }
                  placeholder="e.g., LinkedIn Profile"
                />
              </Flex>
            ) : (
              <Flex direction="column" gap="extra-small">
                <Text variant="microcopy">Label Property Name</Text>
                <Input
                  name={`label-property-${index}`}
                  value={button.labelProperty || ""}
                  onChange={(value) =>
                    updateButton(index, { labelProperty: value })
                  }
                  placeholder="e.g., button_label_1"
                />
              </Flex>
            )}

            {index < buttons.length - 1 && <Divider />}
          </Flex>
        ))}

        {buttons.length < 10 && (
          <Button onClick={addButton} variant="secondary" size="sm">
            + Add Another Button
          </Button>
        )}

        <Flex direction="column" gap="extra-small">
          <Text format={{ fontWeight: "demibold" }}>Instructions</Text>
          <Text variant="microcopy">
            1. Enter the internal name of the CRM property that contains the URL.
          </Text>
          <Text variant="microcopy">
            2. Choose whether to use static text or a property for the button label.
          </Text>
          <Text variant="microcopy">
            3. Click Save Settings to apply your changes.
          </Text>
          <Text variant="microcopy">
            4. Buttons will only appear on records where the URL property has a value.
          </Text>
        </Flex>
      </>
    );
  };

  // Show loading state while fetching settings
  if (isLoading) {
    return (
      <Flex direction="column" align="center" gap="medium">
        <LoadingSpinner label="Loading settings..." />
      </Flex>
    );
  }

  return (
    <Flex direction="column" gap="medium">
      <Flex direction="column" gap="small">
        <Text variant="microcopy" format={{ fontWeight: "bold" }}>
          Quick Links Configuration
        </Text>
        <Text>
          Configure which CRM properties to use for quick link buttons. These
          buttons will appear in the sidebar of contact and company records.
        </Text>
      </Flex>

      {saveSuccess && (
        <Alert title="Settings saved successfully" variant="success">
          Your quick links configuration has been saved.
        </Alert>
      )}

      {error && (
        <Alert title="Error saving settings" variant="error">
          {error}
        </Alert>
      )}

      <Divider />

      <Tabs selected={activeTab} onSelectedChange={setActiveTab}>
        <Tab tabId="contacts" title="Contact Buttons">
          <Flex direction="column" gap="medium">
            {renderButtonConfigurations(settings.contactButtons)}
          </Flex>
        </Tab>
        <Tab tabId="companies" title="Company Buttons">
          <Flex direction="column" gap="medium">
            {renderButtonConfigurations(settings.companyButtons)}
          </Flex>
        </Tab>
      </Tabs>

      <Divider />

      <Flex direction="row" gap="small">
        <Button onClick={handleSave} variant="primary" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Settings"}
        </Button>
        <Button onClick={handleReset} variant="secondary" disabled={isSaving}>
          Reset to Defaults
        </Button>
        <Button onClick={handleDebug} variant="secondary" disabled={isSaving}>
          Debug Request
        </Button>
      </Flex>
    </Flex>
  );
};

export default Settings;
