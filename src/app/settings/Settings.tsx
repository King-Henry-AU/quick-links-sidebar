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
  contactButtons: [
    {
      urlProperty: "",
      labelType: "static",
      staticLabel: "Link 1",
    },
    {
      urlProperty: "",
      labelType: "static",
      staticLabel: "Link 2",
    },
    {
      urlProperty: "",
      labelType: "static",
      staticLabel: "Link 3",
    },
  ],
  companyButtons: [
    {
      urlProperty: "",
      labelType: "static",
      staticLabel: "Link 1",
    },
    {
      urlProperty: "",
      labelType: "static",
      staticLabel: "Link 2",
    },
    {
      urlProperty: "",
      labelType: "static",
      staticLabel: "Link 3",
    },
  ],
};

hubspot.extend(() => <Settings />);

const Settings = () => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"contacts" | "companies">("contacts");

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSettings = await hubspot.loadSettings();
        if (savedSettings) {
          const loaded = savedSettings as any;
          // Migrate old single-array format to new format
          if (loaded.buttons && !loaded.contactButtons && !loaded.companyButtons) {
            setSettings({
              contactButtons: loaded.buttons,
              companyButtons: loaded.buttons,
            });
          } else if (loaded.contactButtons || loaded.companyButtons) {
            setSettings(savedSettings as AppSettings);
          }
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      }
    };
    loadSettings().catch(err => {
      console.error("Settings load error:", err);
    });
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setError(null);

    try {
      await hubspot.saveSettings(settings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    setSaveSuccess(false);
    setError(null);
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

  const currentButtons = activeTab === "contacts" ? settings.contactButtons : settings.companyButtons;

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

      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tab value="contacts" title="Contact Buttons">
          <Flex direction="column" gap="medium">
            {renderButtonConfigurations(currentButtons)}
          </Flex>
        </Tab>
        <Tab value="companies" title="Company Buttons">
          <Flex direction="column" gap="medium">
            {renderButtonConfigurations(currentButtons)}
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
      </Flex>
    </Flex>
  );

  function renderButtonConfigurations(buttons: ButtonSettings[]) {
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
  }
};

export default Settings;
