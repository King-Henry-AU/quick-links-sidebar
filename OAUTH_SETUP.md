# OAuth Setup Guide

This app uses the centralized OAuth handler at `oauth.kinghenry.au` to manage authentication for multiple HubSpot apps.

## Prerequisites

1. The OAuth handler must be running at `https://oauth.kinghenry.au`
2. You need your HubSpot app's Client ID and Client Secret

## Step 1: Upload the App to HubSpot

```bash
cd ~/record-view-sidebar-buttons
hs project upload
```

This will create a build and give you a **Client ID** and **Client Secret**.

## Step 2: Add App to OAuth Handler

Go to your DigitalOcean App Platform for `oauth.kinghenry.au` and update the `HUBSPOT_APPS` environment variable:

### Current Format (Example)

```json
{"app1":{"clientId":"abc123","clientSecret":"secret1","redirectUri":"https://oauth.kinghenry.au/oauth/callback"}}
```

### Add Your Quick Links App

```json
{
  "app1": {
    "clientId": "abc123",
    "clientSecret": "secret1",
    "redirectUri": "https://oauth.kinghenry.au/oauth/callback"
  },
  "quick_links_sidebar": {
    "clientId": "YOUR_CLIENT_ID_FROM_HUBSPOT",
    "clientSecret": "YOUR_CLIENT_SECRET_FROM_HUBSPOT",
    "redirectUri": "https://oauth.kinghenry.au/oauth/callback"
  }
}
```

**Minified (required for environment variable):**

```json
{"app1":{"clientId":"abc123","clientSecret":"secret1","redirectUri":"https://oauth.kinghenry.au/oauth/callback"},"quick_links_sidebar":{"clientId":"YOUR_CLIENT_ID","clientSecret":"YOUR_SECRET","redirectUri":"https://oauth.kinghenry.au/oauth/callback"}}
```

### Update in DigitalOcean

1. Go to: https://cloud.digitalocean.com/apps
2. Select: `oauth` app
3. Navigate to: **Settings** → **Environment Variables**
4. Find: `HUBSPOT_APPS`
5. Click **Edit**
6. Paste your updated JSON (minified)
7. Click **Save**

DigitalOcean will automatically redeploy the OAuth handler (takes 2-5 minutes).

## Step 3: Configure HubSpot App Settings

In your HubSpot Developer Account:

1. Go to your app settings for "Quick Links Sidebar"
2. Navigate to **Auth** settings
3. Verify redirect URL is: `https://oauth.kinghenry.au/oauth/callback`
4. Ensure required scopes are enabled:
   - `oauth`
   - `crm.objects.contacts.read`
   - `crm.objects.companies.read`
5. Save changes

## Step 4: Deploy the App

Once you've verified the OAuth configuration:

```bash
hs project deploy
```

Select the most recent build to deploy.

## Step 5: Test OAuth Flow

Once deployed:

1. Install the app in a test HubSpot portal
2. Go through the OAuth authorization flow
3. The redirect should go to: `https://oauth.kinghenry.au/oauth/callback`
4. After authorization, you should be redirected back with success

### Test OAuth Endpoints

**List configured apps:**
```
https://oauth.kinghenry.au/oauth/apps
```

**Start OAuth for this app:**
```
https://oauth.kinghenry.au/oauth/authorize?app_id=quick_links_sidebar&user_id=TEST_USER
```

**Check token status:**
```
https://oauth.kinghenry.au/oauth/tokens/TEST_USER
```

## OAuth Flow Diagram

```
User installs app in HubSpot
           ↓
HubSpot redirects to: oauth.kinghenry.au/oauth/callback
           ↓
OAuth handler exchanges code for tokens
           ↓
Tokens encrypted and stored
           ↓
User redirected back to HubSpot
           ↓
App is now authorized and functional
```

## Troubleshooting

### Error: "Invalid app_id"

The `quick_links_sidebar` app is not configured in the OAuth handler. Check the `HUBSPOT_APPS` environment variable in DigitalOcean.

### Error: "redirect_uri_mismatch"

The redirect URL in your HubSpot app settings doesn't match `https://oauth.kinghenry.au/oauth/callback`. Update it in HubSpot Developer Account.

### OAuth handler not responding

Check the deployment status in DigitalOcean App Platform. Visit `https://oauth.kinghenry.au/health` to verify it's running.

### Tokens not persisting

The OAuth handler currently uses in-memory storage. Tokens will be lost on restart. For production, migrate to Redis or PostgreSQL (see main OAuth handler README).

## Security Notes

- Never expose your `clientSecret` in frontend code
- Store the `TOKEN_ENCRYPTION_KEY` as a secret in DigitalOcean
- Use HTTPS for all OAuth endpoints (already configured)
- Regularly rotate your HubSpot app credentials

## Multi-App Benefits

Using the centralized OAuth handler allows you to:

- ✅ Manage multiple HubSpot apps from one endpoint
- ✅ Centralized token storage and encryption
- ✅ Consistent OAuth flow across all apps
- ✅ Easy token refresh handling
- ✅ Single codebase to maintain

## Next Steps

1. Upload and deploy the Quick Links Sidebar app
2. Add app credentials to OAuth handler
3. Test the OAuth flow
4. Create the required custom properties in HubSpot
5. Test the sidebar card on contact/company records

## Support

Questions? Contact marcel@kinghenry.com.au
