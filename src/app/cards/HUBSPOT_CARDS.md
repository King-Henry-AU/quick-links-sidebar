# HubSpot App Cards

## Overview

HubSpot cards are React-based UI extensions that display custom content within CRM record pages (contacts, companies, deals, etc.). Cards allow you to extend the HubSpot CRM interface with custom functionality, data visualization, and interactive elements.

Cards are stored in the `src/app/cards/` directory of your HubSpot project.

## Quick Links Card

The Quick Links card displays clickable buttons in the record sidebar that navigate to URLs stored in record properties.

### Required Property Setup

Before using the Quick Links card, you must create the following custom properties on both **Contacts** and **Companies** objects:

#### URL Properties (Calculation - String type)

These properties store the URLs that buttons will link to. Use "Calculation" field type with "String" output to allow formula-based URLs.

| Property Name | Label | Field Type | Output Type |
|--------------|-------|------------|-------------|
| `button_url_1` | Button URL 1 | Calculation | String |
| `button_url_2` | Button URL 2 | Calculation | String |
| `button_url_3` | Button URL 3 | Calculation | String |

#### Label Properties (Single-line text)

These properties store the display text for each button. Labels are optional - buttons will show "Link 1", "Link 2", etc. if not set.

| Property Name | Label | Field Type |
|--------------|-------|------------|
| `button_label_1` | Button Label 1 | Single-line text |
| `button_label_2` | Button Label 2 | Single-line text |
| `button_label_3` | Button Label 3 | Single-line text |

### Creating Properties in HubSpot

1. Go to **Settings** > **Properties**
2. Select **Contact properties** or **Company properties**
3. Click **Create property**
4. For URL properties:
   - Set **Field type** to "Calculation"
   - Set **Output type** to "String"
   - Use formulas to construct URLs from other properties (e.g., `"https://linkedin.com/in/" & [linkedin_username]`)
5. For Label properties:
   - Set **Field type** to "Single-line text"

### How It Works

- The card reads the URL and label properties from the current record
- Only buttons with non-empty URLs are displayed
- Clicking a button opens the URL in a new browser tab
- URLs without `http://` or `https://` automatically get `https://` prepended

## Structure

Each card component consists of two files:

1. **React Component (`.jsx` or `.tsx`)**: Contains the UI logic and rendering code using React and HubSpot's UI extension components from `@hubspot/ui-extensions`.
2. **Configuration File (`*-hsmeta.json`)**: Defines the card's metadata

## Using App Cards

After uploading your project with `hs project upload`, cards must be manually added to record views:

1. Navigate to a CRM record (e.g., a contact)
2. Click **Customize** in the record view
3. Select the tab where you want the card to appear
4. Click the **+** button to add a card
5. In the **Card library**, filter by **App** and select your card
6. Save the view

Cards will then appear on all records of the specified object types in that view.

## Resources

- [UI Extension Components](https://developers.hubspot.com/docs/platform/ui-components): Library of available UI components
- [App Card Reference](https://developers.hubspot.com/docs/apps/developer-platform/add-features/ui-extensibility/app-cards/reference): Complete configuration options
- [UI Extensions SDK](https://developers.hubspot.com/docs/apps/developer-platform/add-features/ui-extensibility/ui-extensions-sdk): Available utilities and methods
