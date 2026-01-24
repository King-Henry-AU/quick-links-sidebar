# Quick Links Sidebar - HubSpot Public App

A HubSpot CRM sidebar card that displays configurable quick link buttons on contact and company records. Buttons link to URLs stored in custom properties, allowing dynamic navigation to external systems, profiles, or dashboards directly from CRM records.

## Features

- ✅ **Easy Settings Page** - Configure which properties to use through a user-friendly interface
- ✅ **Flexible Configuration** - Use any existing CRM properties for button URLs and labels
- ✅ **Unlimited Buttons** - Add as many quick link buttons as you need (up to 10)
- ✅ **Dynamic URLs** - Links are stored in HubSpot custom properties on contact/company records
- ✅ **Custom Labels** - Static text or dynamic from properties
- ✅ **OAuth Authentication** - Secure public app with OAuth 2.0
- ✅ **Multi-Object Support** - Works on both contacts and companies
- ✅ **Production Ready** - Built with TypeScript and HubSpot UI Extensions

## Installation

### For HubSpot Users

1. Install the app from the HubSpot App Marketplace (coming soon)
2. Authorize the app to access your CRM data
3. Configure the custom properties on your contact and company objects (see Configuration below)

### For Developers

1. Clone this repository
2. Install the HubSpot CLI: `npm install -g @hubspot/cli`
3. Authenticate: `hs auth`
4. Upload the project: `hs project upload`
5. Deploy: `hs project deploy`

## Configuration

### Step 1: Configure Button Properties

1. After installing the app, go to **Settings** (gear icon in the app)
2. For each button you want to add:
   - **URL Property Name**: Enter the internal name of the property containing the URL (e.g., `linkedin_url`, `github_profile`)
   - **Label Type**: Choose "Static Text" or "From Property"
   - **Label**: Enter static text (e.g., "LinkedIn Profile") or select a property containing the label
3. Click **Save Settings**

### Step 2: Populate Properties on Records

The app works with any existing single-line text or calculation properties in your CRM. Simply populate the properties you configured in settings with URL values.

### Example Configuration

**In Settings:**
| Button | URL Property | Label Type | Label |
|--------|-------------|------------|-------|
| 1 | `linkedin_url` | Static Text | `LinkedIn Profile` |
| 2 | `github_profile` | Static Text | `GitHub` |
| 3 | `external_dashboard_url` | From Property | `dashboard_label` |

**On a Contact Record:**
| Property | Value |
|----------|-------|
| `linkedin_url` | `https://linkedin.com/in/johndoe` |
| `github_profile` | `https://github.com/johndoe` |
| `external_dashboard_url` | `https://example.com/dashboard/12345` |
| `dashboard_label` | `View Dashboard` |

### No Property Setup Required

The beauty of the settings page is that you can use **any existing properties** in your CRM - no need to create specific ones unless you want to!

## OAuth Configuration

This app uses OAuth 2.0 for secure authentication. The OAuth flow is handled by:

**OAuth Handler:** `https://oauth.kinghenry.au`

**Required Scopes:**
- `oauth`
- `crm.objects.contacts.read`
- `crm.objects.companies.read`

## Development

### Local Development

Start the local development server:

```bash
hs project dev
```

This will start a local server that syncs changes to HubSpot in real-time.

### Project Structure

```
record-view-sidebar-buttons/
├── src/
│   └── app/
│       ├── app-hsmeta.json           # App configuration
│       └── cards/
│           ├── card-hsmeta.json      # Card configuration
│           └── QuickLinksCard.tsx    # Main card component
├── hsproject.json                     # HubSpot project config
└── README.md
```

### Technology Stack

- **HubSpot UI Extensions** - React-based UI framework
- **TypeScript** - Type-safe JavaScript
- **HubSpot Platform 2025.2** - Latest platform version

## Customization

### Adding More Buttons

To add more than 3 buttons, edit `QuickLinksCard.tsx`:

```typescript
const BUTTON_CONFIGS: ButtonConfig[] = [
  {
    urlProperty: "button_url_1",
    labelProperty: "button_label_1",
    defaultLabel: "Link 1",
  },
  // Add more button configurations here
  {
    urlProperty: "button_url_4",
    labelProperty: "button_label_4",
    defaultLabel: "Link 4",
  },
];
```

Then create the corresponding custom properties in HubSpot.

### Changing Button Appearance

The buttons use HubSpot's `CrmActionButton` component with `variant="secondary"`. To change the appearance, modify the variant in `QuickLinksCard.tsx`:

```typescript
<CrmActionButton
  variant="primary"  // Options: primary, secondary, tertiary
  // ... other props
>
```

## Support

- **Email:** marcel@kinghenry.com.au
- **Website:** https://kinghenry.com.au
- **Phone:** +61 2 8005 0400

## License

Copyright © 2025 King Henry. All rights reserved.

## About

Built by [King Henry](https://kinghenry.com.au) - Digital transformation and automation specialists.
