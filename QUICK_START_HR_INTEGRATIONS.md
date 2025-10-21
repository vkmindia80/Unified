# Quick Start: HR Integrations

## 🚀 Quick Access

**To access the HR Integrations:**
1. Log in as an **Admin** user
2. Go to **Admin Panel** (top navigation)
3. Click the **"Integrations"** button
4. You'll see 11 integrations (1 communication + 10 HR systems)

## 📋 Available HR Systems

| System | Icon | Status |
|--------|------|--------|
| BambooHR | 🎋 | ✅ Fully Functional |
| Gusto | 💰 | ✅ Fully Functional |
| Rippling | 🌊 | ✅ Fully Functional |
| Zenefits | ⚡ | ✅ Fully Functional |
| Workday | 💼 | 🔧 Framework Ready |
| ADP Workforce Now | 📊 | 🔧 Framework Ready |
| Namely | 👥 | 🔧 Framework Ready |
| SAP SuccessFactors | 🏢 | 🔧 Framework Ready |
| Oracle HCM Cloud | 🏛️ | 🔧 Framework Ready |
| Paycor | 💳 | 🔧 Framework Ready |

## ⚡ Quick Setup (Example: BambooHR)

### Step 1: Get API Credentials
- Log in to BambooHR as admin
- Go to **Account** → **API Keys**
- Generate a new API key
- Note your subdomain (e.g., if URL is `mycompany.bamboohr.com`, subdomain is `mycompany`)

### Step 2: Configure in Platform
1. Open **Admin Panel** → **Integrations**
2. Find the **BambooHR** card
3. Fill in the fields:
   - **API Key**: Paste your API key
   - **Subdomain**: Enter your company subdomain
   - **Webhook URL**: (Optional) Leave empty for now
4. Click **"Save"** button

### Step 3: Test Connection
1. Click the **"Test"** button
2. Wait for confirmation message
3. If successful, you'll see: "Connection to BambooHR successful" ✅

### Step 4: Enable Integration
1. Click the **"Disabled"** toggle button
2. It will turn green and show **"Enabled"**

### Step 5: Sync Employees
1. Click the **"Sync Now"** button
2. Wait for sync to complete (may take a few seconds)
3. You'll see a message like: "Synced: 25, Updated: 5"
4. Check **Admin Panel** → **Users** to see your imported employees

## 🔑 Configuration Fields by System

### BambooHR
- API Key (required) 🔐
- Company Subdomain (required)
- Webhook URL (optional)

### Gusto
- API Token (required) 🔐
- Company ID (required)

### Rippling
- API Key (required) 🔐
- Company ID (required)

### Zenefits
- Access Token (required) 🔐
- Company ID (required)

### Workday
- Client ID (required)
- Client Secret (required) 🔐
- Tenant Name (required)
- Base URL (required)

### ADP Workforce Now
- Client ID (required)
- Client Secret (required) 🔐
- SSL Certificate Path (required)

### Namely
- Access Token (required) 🔐
- Company Subdomain (required)

### SAP SuccessFactors
- Company ID (required)
- User ID (required)
- Password (required) 🔐
- Data Center (required)

### Oracle HCM Cloud
- Username (required)
- Password (required) 🔐
- Instance URL (required)

### Paycor
- Client ID (required)
- Client Secret (required) 🔐
- Company ID (required)

🔐 = Password field (hidden by default, click eye icon to reveal)

## 🎯 Features

### For Each Integration Card:

**Visual Elements:**
- 🔄 Integration icon and name
- 📝 Description of what it does
- 🏷️ Type badge (HR System)
- 🟢/⚫ Enable/Disable toggle
- 📅 Last updated timestamp

**Configuration:**
- 📋 Dynamic form fields
- 🔐 Password masking with show/hide
- ✅ Required field indicators
- 💾 Auto-save configuration

**Actions:**
- 💾 **Save** - Store your configuration
- 🔌 **Test** - Verify credentials work
- 🔄 **Sync Now** - Import employee data (HR systems only)

**Information:**
- 📖 Setup instructions with links
- ⏰ Last update timestamp
- 🎨 Color-coded status (green = enabled)

## 🎨 UI Features

### Filter Tabs
- **All Integrations** - View everything (11 total)
- **HR Systems** - Only HR integrations (10)
- **Communication** - Only communication tools (1)

### Visual Feedback
- ✅ Success notifications (green toast)
- ❌ Error notifications (red toast)
- ⏳ Loading states (spinning icons, "Saving...", "Syncing...")
- 🎨 Dark mode support

## 🔒 Security Features

✅ **Admin-Only Access** - Only admins can configure integrations
✅ **Encrypted Storage** - All credentials encrypted in database
✅ **Masked Display** - API keys show as `abc12345...xyz9`
✅ **Password Fields** - Hidden by default with toggle
✅ **Audit Trail** - Tracks who updated what and when

## 📊 What Happens During Sync?

1. **Authenticate** - Use your API credentials to connect
2. **Fetch** - Get employee directory from HR system
3. **Transform** - Convert HR data to platform format
4. **Create/Update** - Create new users or update existing ones
5. **Report** - Show how many were synced/updated

### Synced Data:
- Full Name
- Email Address
- Department
- Role (set to "employee" by default)

### Auto-Generated:
- Username (from email)
- Random secure password
- User ID
- Account status (active)

## 🚨 Troubleshooting

### "Connection test failed"
- ✅ Verify API credentials are correct
- ✅ Check if you have the right permissions in HR system
- ✅ Ensure subdomain/company ID is correct
- ✅ Try regenerating API key in HR system

### "No employees synced"
- ✅ Check if HR system has employee data
- ✅ Verify API permissions allow reading employees
- ✅ Make sure employees have email addresses
- ✅ Check backend logs: `/var/log/supervisor/backend.err.log`

### "Integration not found"
- ✅ Refresh the page
- ✅ Check if logged in as admin
- ✅ Verify backend service is running: `sudo supervisorctl status`

### "Save button doesn't work"
- ✅ Fill in all required fields (marked with red *)
- ✅ Check browser console for errors (F12)
- ✅ Verify you have admin permissions

## 🔗 Helpful Links

### HR System Documentation
- [BambooHR API Docs](https://documentation.bamboohr.com/docs)
- [Gusto API Docs](https://docs.gusto.com/)
- [Workday API Docs](https://community.workday.com/api)
- [Rippling API Docs](https://developer.rippling.com/)
- [Zenefits API Docs](https://developers.zenefits.com/)

### Platform Documentation
- Full Guide: `/app/HR_INTEGRATIONS_GUIDE.md`
- Implementation Summary: `/app/HR_INTEGRATION_IMPLEMENTATION_SUMMARY.md`
- API Documentation: `http://localhost:8001/docs`

## 💡 Pro Tips

1. **Test First**: Always click "Test" before enabling an integration
2. **Start Small**: Configure one HR system at a time
3. **Check Users**: After sync, verify users in Admin Panel → Users
4. **Regular Syncs**: Sync periodically to keep data up-to-date
5. **Document Credentials**: Keep API keys in a secure password manager
6. **Read Instructions**: Each card has setup instructions specific to that system

## 📞 Need Help?

1. **Check Instructions**: Each integration card has specific setup steps
2. **View Logs**: Backend logs at `/var/log/supervisor/backend.err.log`
3. **Test Connection**: Use the "Test" button to diagnose issues
4. **Review Documentation**: See full guide at `/app/HR_INTEGRATIONS_GUIDE.md`
5. **Contact HR System**: For API access issues, contact your HR system support

## 🎉 Success Indicators

You'll know it's working when:
- ✅ Toggle shows "Enabled" in green
- ✅ Test connection returns success message
- ✅ Sync shows "Synced: X, Updated: Y"
- ✅ New users appear in Admin Panel → Users
- ✅ No errors in backend logs

## 📈 Next Steps After Setup

1. **Verify Data**: Check imported users are correct
2. **Set Roles**: Update user roles if needed (team_lead, manager, etc.)
3. **Assign Teams**: Add users to appropriate teams
4. **Configure Permissions**: Set up any role-based access
5. **Schedule Syncs**: Plan regular sync intervals
6. **Monitor**: Check sync results periodically

---

**Quick Reference:**
- **Access**: Admin Panel → Integrations
- **HR Systems Available**: 10
- **Fully Functional**: 4 (BambooHR, Gusto, Rippling, Zenefits)
- **Framework Ready**: 6 (others)
- **Status**: ✅ Ready to Use

**Last Updated**: August 2025
