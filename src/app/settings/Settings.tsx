import React, { useState, useEffect } from "react";
import { hubspot } from "@hubspot/ui-extensions";

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

hubspot.extend(({ actions }) => <Settings actions={actions} />);

interface SettingsProps {
  actions?: any;
}

const Settings = ({ actions }: SettingsProps) => {
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
    <div style={{ padding: "20px", maxWidth: "800px" }}>
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ margin: "0 0 8px 0", fontSize: "18px", fontWeight: "600" }}>
          Quick Links Configuration
        </h2>
        <p style={{ margin: "0", color: "#666", fontSize: "14px" }}>
          Configure which CRM properties to use for quick link buttons. These
          buttons will appear in the sidebar of contact and company records.
        </p>
      </div>

      {saveSuccess && (
        <div style={{
          padding: "12px",
          marginBottom: "16px",
          backgroundColor: "#e8f5e9",
          border: "1px solid #4caf50",
          borderRadius: "4px",
          color: "#2e7d32"
        }}>
          <strong>✓ Settings saved successfully</strong>
          <p style={{ margin: "4px 0 0 0", fontSize: "14px" }}>
            Your quick links configuration has been saved.
          </p>
        </div>
      )}

      {error && (
        <div style={{
          padding: "12px",
          marginBottom: "16px",
          backgroundColor: "#ffebee",
          border: "1px solid #f44336",
          borderRadius: "4px",
          color: "#c62828"
        }}>
          <strong>✗ Error saving settings</strong>
          <p style={{ margin: "4px 0 0 0", fontSize: "14px" }}>{error}</p>
        </div>
      )}

      <hr style={{ margin: "24px 0", border: "none", borderTop: "1px solid #e0e0e0" }} />

      <div>
        <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: "600" }}>
          Button Configuration
        </h3>

        {settings.buttons.map((button, index) => (
          <div key={index} style={{
            padding: "16px",
            marginBottom: "16px",
            border: "1px solid #e0e0e0",
            borderRadius: "4px",
            backgroundColor: "#f9f9f9"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <strong style={{ fontSize: "15px" }}>Button {index + 1}</strong>
              {settings.buttons.length > 1 && (
                <button
                  onClick={() => removeButton(index)}
                  style={{
                    padding: "4px 12px",
                    fontSize: "13px",
                    backgroundColor: "#fff",
                    border: "1px solid #ccc",
                    borderRadius: "3px",
                    cursor: "pointer"
                  }}
                >
                  Remove
                </button>
              )}
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: "500" }}>
                URL Property Name
              </label>
              <input
                type="text"
                value={button.urlProperty}
                onChange={(e) => updateButton(index, { urlProperty: e.target.value })}
                placeholder="e.g., linkedin_url, github_profile, button_url_1"
                style={{
                  width: "100%",
                  padding: "8px",
                  fontSize: "14px",
                  border: "1px solid #ccc",
                  borderRadius: "3px",
                  boxSizing: "border-box"
                }}
              />
              <small style={{ display: "block", marginTop: "4px", color: "#666", fontSize: "12px" }}>
                Enter the internal name of the property containing the URL
              </small>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: "500" }}>
                Label Type
              </label>
              <select
                value={button.labelType}
                onChange={(e) => updateButton(index, { labelType: e.target.value as "property" | "static" })}
                style={{
                  width: "100%",
                  padding: "8px",
                  fontSize: "14px",
                  border: "1px solid #ccc",
                  borderRadius: "3px",
                  boxSizing: "border-box"
                }}
              >
                <option value="static">Static Text</option>
                <option value="property">From Property</option>
              </select>
            </div>

            {button.labelType === "static" ? (
              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: "500" }}>
                  Button Label
                </label>
                <input
                  type="text"
                  value={button.staticLabel}
                  onChange={(e) => updateButton(index, { staticLabel: e.target.value })}
                  placeholder="e.g., LinkedIn Profile, View Dashboard"
                  style={{
                    width: "100%",
                    padding: "8px",
                    fontSize: "14px",
                    border: "1px solid #ccc",
                    borderRadius: "3px",
                    boxSizing: "border-box"
                  }}
                />
              </div>
            ) : (
              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: "500" }}>
                  Label Property Name
                </label>
                <input
                  type="text"
                  value={button.labelProperty || ""}
                  onChange={(e) => updateButton(index, { labelProperty: e.target.value })}
                  placeholder="e.g., button_label_1, link_title"
                  style={{
                    width: "100%",
                    padding: "8px",
                    fontSize: "14px",
                    border: "1px solid #ccc",
                    borderRadius: "3px",
                    boxSizing: "border-box"
                  }}
                />
                <small style={{ display: "block", marginTop: "4px", color: "#666", fontSize: "12px" }}>
                  Property containing the button label text
                </small>
              </div>
            )}
          </div>
        ))}

        {settings.buttons.length < 10 && (
          <button
            onClick={addButton}
            style={{
              padding: "8px 16px",
              fontSize: "14px",
              backgroundColor: "#fff",
              border: "1px solid #ccc",
              borderRadius: "3px",
              cursor: "pointer",
              marginBottom: "16px"
            }}
          >
            + Add Another Button
          </button>
        )}
      </div>

      <hr style={{ margin: "24px 0", border: "none", borderTop: "1px solid #e0e0e0" }} />

      <div style={{ marginBottom: "24px" }}>
        <h3 style={{ margin: "0 0 12px 0", fontSize: "16px", fontWeight: "600" }}>
          Instructions
        </h3>
        <ol style={{ margin: "0", paddingLeft: "20px", color: "#666", fontSize: "14px" }}>
          <li style={{ marginBottom: "8px" }}>
            For each button, enter the <strong>internal name</strong> of the CRM property that contains the URL (e.g., "linkedin_url").
          </li>
          <li style={{ marginBottom: "8px" }}>
            Choose whether to use static text or a property for the button label.
          </li>
          <li style={{ marginBottom: "8px" }}>
            Click <strong>Save Settings</strong> to apply your changes.
          </li>
          <li style={{ marginBottom: "8px" }}>
            Buttons will only appear on records where the URL property has a value.
          </li>
        </ol>
      </div>

      <hr style={{ margin: "24px 0", border: "none", borderTop: "1px solid #e0e0e0" }} />

      <div style={{ display: "flex", gap: "12px" }}>
        <button
          onClick={handleSave}
          disabled={isSaving}
          style={{
            padding: "10px 20px",
            fontSize: "14px",
            fontWeight: "500",
            backgroundColor: isSaving ? "#ccc" : "#0091ae",
            color: "#fff",
            border: "none",
            borderRadius: "3px",
            cursor: isSaving ? "not-allowed" : "pointer"
          }}
        >
          {isSaving ? "Saving..." : "Save Settings"}
        </button>
        <button
          onClick={handleReset}
          disabled={isSaving}
          style={{
            padding: "10px 20px",
            fontSize: "14px",
            backgroundColor: "#fff",
            border: "1px solid #ccc",
            borderRadius: "3px",
            cursor: isSaving ? "not-allowed" : "pointer"
          }}
        >
          Reset to Defaults
        </button>
      </div>
    </div>
  );
};

export default Settings;
