# Quick Links Sidebar - HubSpot Public App

A HubSpot CRM sidebar card that displays configurable quick link buttons on contact and company records. Buttons link to URLs stored in custom properties, allowing dynamic navigation to external systems, profiles, or dashboards directly from CRM records.

## Features

- ✅ **Configurable Quick Links** - Display up to 3 customizable button links in the CRM sidebar
- ✅ **Dynamic URLs** - Links are stored in HubSpot custom properties on contact/company records
- ✅ **Custom Labels** - Each button can have a custom label or use defaults
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

The app reads button URLs and labels from custom properties on your records.

### Required Custom Properties

Create these properties on your **Contact** and **Company** objects:

#### URL Properties (Single-line text)
- `button_url_1` - URL for the first button
- `button_url_2` - URL for the second button
- `button_url_3` - URL for the third button

#### Label Properties (Single-line text - Optional)
- `button_label_1` - Label for the first button (default: "Link 1")
- `button_label_2` - Label for the second button (default: "Link 2")
- `button_label_3` - Label for the third button (default: "Link 3")

### Example Property Values

| Property | Example Value |
|----------|--------------|
| `button_url_1` | `https://linkedin.com/in/johndoe` |
| `button_label_1` | `LinkedIn Profile` |
| `button_url_2` | `https://github.com/johndoe` |
| `button_label_2` | `GitHub` |
| `button_url_3` | `https://example.com/dashboard/12345` |
| `button_label_3` | `External Dashboard` |

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
