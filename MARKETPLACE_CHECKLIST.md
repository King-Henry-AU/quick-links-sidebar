# Marketplace Submission Checklist

Use this checklist when preparing to submit the Quick Links Sidebar app to the HubSpot Marketplace.

## ✅ Technical Requirements

- [x] **Distribution set to "marketplace"** in app-hsmeta.json
- [x] **OAuth authentication configured** (required for public apps)
- [x] **Minimal scope requests** (only required scopes: oauth, crm.objects.contacts.read, crm.objects.companies.read)
- [x] **OAuth handler production-ready** at oauth.kinghenry.au
- [x] **No external API calls** (app is self-contained)
- [x] **TypeScript implementation** (type-safe)
- [x] **Error handling** (loading states, empty states, error alerts)
- [x] **Latest platform version** (2025.2)

## 📝 Listing Information

HubSpot will ask for these during marketplace submission:

### Required

- [ ] **App Icon/Logo** (recommended: 512x512px PNG with transparent background)
- [ ] **App Screenshots** (3-5 screenshots showing the app in action)
  - Screenshot 1: Card in CRM sidebar with buttons displayed
  - Screenshot 2: Empty state showing setup instructions
  - Screenshot 3: Custom property configuration in HubSpot
  - Screenshot 4: Example use case (e.g., LinkedIn button)
- [ ] **Short Description** (160 characters max - for listing cards)
  - Current: "Displays configurable quick link buttons in the CRM record sidebar."
- [ ] **Long Description** (detailed description for app page)
  - Use content from README.md
- [ ] **Category Selection**
  - Suggested: "Sales Tools" or "Productivity"
- [ ] **Use Cases** (what problems does this solve?)
  - Quick access to external profiles (LinkedIn, GitHub)
  - Navigate to external dashboards from CRM records
  - Link to customer portals or internal systems
  - Customizable per-record navigation

### Legal (Important!)

- [ ] **Privacy Policy URL**
  - Required by HubSpot
  - Should explain what data you access (contact/company read access)
  - Explain token storage and encryption
  - Suggested: Create at `https://kinghenry.com.au/privacy-policy-quick-links`

- [ ] **Terms of Service URL**
  - Required by HubSpot
  - Suggested: Create at `https://kinghenry.com.au/terms-quick-links`

### Support

- [x] **Support Email** (marcel@kinghenry.com.au)
- [x] **Support Phone** (+61 2 8005 0400)
- [ ] **Support URL** - Consider creating a dedicated support page
  - Current: https://kinghenry.com.au (generic)
  - Suggested: https://kinghenry.com.au/support/quick-links or GitHub Issues
- [ ] **Documentation URL** - Consider creating dedicated docs
  - Current: https://kinghenry.com.au (generic)
  - Suggested: GitHub README or https://kinghenry.com.au/docs/quick-links

## 🧪 Testing Requirements

Before submitting:

- [ ] **Test in multiple HubSpot accounts**
  - Test OAuth flow in at least 2 different portals
  - Verify tokens are stored separately per account
  - Test with both contacts and companies

- [ ] **Test all user journeys**
  - [ ] New user installs app (OAuth flow works)
  - [ ] User with no properties configured (empty state displays correctly)
  - [ ] User with 1 button configured (displays correctly)
  - [ ] User with 3 buttons configured (all display)
  - [ ] Buttons with HTTP URLs (normalized to HTTPS)
  - [ ] Buttons with HTTPS URLs (work as-is)
  - [ ] Invalid/empty URLs (buttons don't display)
  - [ ] Custom labels (override defaults)

- [ ] **Test error scenarios**
  - [ ] Properties don't exist (graceful handling)
  - [ ] Network error (error alert displays)
  - [ ] Token refresh (test after token expiry)

- [ ] **Performance testing**
  - [ ] Card loads quickly (<2 seconds)
  - [ ] No console errors
  - [ ] Works on mobile HubSpot app

## 🔐 Security & Compliance

- [x] **OAuth handler is production-ready**
  - Multi-app support configured
  - Tokens encrypted with AES-256-GCM
  - Secure token storage (consider migrating to database for production)

- [ ] **Token storage for production**
  - Current: In-memory (tokens lost on restart)
  - Recommended: Migrate to Redis or PostgreSQL before marketplace launch
  - See: ~/hubspot-oauth-handler/README.md for database integration

- [x] **HTTPS enforced everywhere**
  - OAuth handler uses HTTPS
  - No external API calls

- [ ] **Review HubSpot's security requirements**
  - Check: https://developers.hubspot.com/docs/api/marketplace-apps

## 📊 Analytics & Monitoring

Consider adding before marketplace launch:

- [ ] **Error logging** (track OAuth failures, API errors)
- [ ] **Usage analytics** (how many installs, button clicks)
- [ ] **Performance monitoring** (response times, uptime)

Suggested tools:
- Sentry (error tracking)
- Datadog (infrastructure monitoring)
- Google Analytics (usage tracking)

## 🚀 Pre-Submission Actions

1. [ ] **Update documentation URLs in app-hsmeta.json**
   - Point to dedicated docs/support pages
   - Add privacy policy and terms URLs (when created)

2. [ ] **Prepare marketing materials**
   - [ ] App icon/logo designed
   - [ ] Screenshots captured
   - [ ] Video demo recorded (optional but recommended)
   - [ ] Case study or example use cases documented

3. [ ] **Create support resources**
   - [ ] FAQ document
   - [ ] Setup guide with screenshots
   - [ ] Video tutorial (optional)
   - [ ] GitHub Issues enabled for support

4. [ ] **Migrate token storage to database**
   - Set up Redis or PostgreSQL
   - Update OAuth handler
   - Test thoroughly

5. [ ] **Test with beta users**
   - Share with 3-5 friendly customers
   - Gather feedback
   - Fix any issues

6. [ ] **Final upload to HubSpot**
   - Make any final changes
   - Upload with clear version number
   - Deploy to production

## 📤 Submission Process

1. **In HubSpot Developer Account:**
   - Go to Apps → Your App → "Submit to Marketplace"
   - Fill out all listing information
   - Upload assets (icon, screenshots)
   - Provide URLs (privacy, terms, docs, support)
   - Submit for review

2. **HubSpot Review (typically 1-2 weeks):**
   - Technical review
   - Security review
   - Listing content review
   - May request changes or clarifications

3. **After Approval:**
   - App goes live on marketplace
   - Monitor for installs and support requests
   - Plan regular updates and improvements

## 💡 Tips for Marketplace Success

- **Clear value proposition**: Make it obvious what problem you solve
- **Great screenshots**: Show the app in action, not just config screens
- **Video demo**: Highly recommended - shows how easy it is to use
- **Responsive support**: Reply to questions quickly
- **Regular updates**: Show the app is actively maintained
- **Collect reviews**: Ask happy customers to leave reviews

## 🎯 Current Status

- **Phase:** Development/Pre-Marketplace
- **Ready for:** Beta testing with friendly customers
- **Not ready for:** Marketplace submission (need privacy policy, better docs)
- **Estimated time to marketplace-ready:** 1-2 weeks (mainly legal docs and testing)

## 📧 Questions?

Contact marcel@kinghenry.com.au for any questions about marketplace submission.
