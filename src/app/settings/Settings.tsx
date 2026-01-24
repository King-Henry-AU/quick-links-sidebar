import React, { useState, useEffect } from "react";
import {
  Flex,
  Text,
  Button,
  Input,
  Select,
  Divider,
  Alert,
  LoadingSpinner,
  hubspot,
} from "@hubspot/ui-extensions";

// Define the settings structure
interface ButtonSettings {
  urlProperty: string;
  labelType: "property" | "static";
  labelProperty?: string;
  staticLabel: string;
}

interface AppSettings {
  buttons: ButtonSettings[];
}

const DEFAULT_SETTINGS: AppSettings = {
  buttons: [
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

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSettings = await hubspot.loadSettings();
        if (savedSettings && savedSettings.buttons) {
          setSettings(savedSettings as AppSettings);
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
        // Use default settings if load fails
      }
    };
    loadSettings();
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
    setSettings({
      ...settings,
      buttons: [
        ...settings.buttons,
        {
          urlProperty: "",
          labelType: "static",
          staticLabel: `Link ${settings.buttons.length + 1}`,
        },
      ],
    });
  };

  const removeButton = (index: number) => {
    const newButtons = settings.buttons.filter((_, i) => i !== index);
    setSettings({ ...settings, buttons: newButtons });
  };

  const updateButton = (index: number, updates: Partial<ButtonSettings>) => {
    const newButtons = [...settings.buttons];
    newButtons[index] = { ...newButtons[index], ...updates };
    setSettings({ ...settings, buttons: newButtons });
  };

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

      <Flex direction="column" gap="medium">
        <Text format={{ fontWeight: "demibold" }}>Button Configuration</Text>

        {settings.buttons.map((button, index) => (
          <Flex key={index} direction="column" gap="small">
            <Flex direction="row" justify="between" align="center">
              <Text format={{ fontWeight: "demibold" }}>Button {index + 1}</Text>
              {settings.buttons.length > 1 && (
                <Button
                  onClick={() => removeButton(index)}
                  variant="secondary"
                  size="xs"
                >
                  Remove
                </Button>
              )}
            </Flex>

            <Flex direction="column" gap="extra-small">
              <Text variant="microcopy">URL Property Name</Text>
              <Input
                name={`url-property-${index}`}
                value={button.urlProperty}
                onChange={(value) =>
                  updateButton(index, { urlProperty: value })
                }
                placeholder="e.g., linkedin_url, github_profile, button_url_1"
              />
              <Text variant="microcopy">
                Enter the internal name of the property containing the URL
              </Text>
            </Flex>

            <Flex direction="column" gap="extra-small">
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

            {button.labelType === "static" ? (
              <Flex direction="column" gap="extra-small">
                <Text variant="microcopy">Button Label</Text>
                <Input
                  name={`static-label-${index}`}
                  value={button.staticLabel}
                  onChange={(value) =>
                    updateButton(index, { staticLabel: value })
                  }
                  placeholder="e.g., LinkedIn Profile, View Dashboard"
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
                  placeholder="e.g., button_label_1, link_title"
                />
                <Text variant="microcopy">
                  Property containing the button label text
                </Text>
              </Flex>
            )}

            {index < settings.buttons.length - 1 && <Divider />}
          </Flex>
        ))}

        {settings.buttons.length < 10 && (
          <Button onClick={addButton} variant="secondary" size="sm">
            + Add Another Button
          </Button>
        )}
      </Flex>

      <Divider />

      <Flex direction="column" gap="small">
        <Text format={{ fontWeight: "demibold" }}>Instructions</Text>
        <Text variant="microcopy">
          1. For each button, enter the <strong>internal name</strong> of the
          CRM property that contains the URL (e.g., "linkedin_url").
        </Text>
        <Text variant="microcopy">
          2. Choose whether to use static text or a property for the button
          label.
        </Text>
        <Text variant="microcopy">
          3. Click <strong>Save Settings</strong> to apply your changes.
        </Text>
        <Text variant="microcopy">
          4. Buttons will only appear on records where the URL property has a
          value.
        </Text>
      </Flex>

      <Divider />

      <Flex direction="row" gap="small">
        <Button onClick={handleSave} variant="primary" disabled={isSaving}>
          {isSaving ? <LoadingSpinner size="xs" /> : "Save Settings"}
        </Button>
        <Button onClick={handleReset} variant="secondary" disabled={isSaving}>
          Reset to Defaults
        </Button>
      </Flex>
    </Flex>
  );
};

export default Settings;
