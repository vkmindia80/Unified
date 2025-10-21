# Accounting System Integrations Guide

## Overview
This document provides information about the Accounting system integrations added to the Admin Panel.

## Available Accounting Integrations

The following 5 popular accounting systems have been integrated into the platform:

### 1. **QuickBooks Online** 📗
- **Description**: Most popular small business accounting software
- **Required Fields**:
  - Client ID
  - Client Secret
  - Company ID (Realm ID)
  - Redirect URI
  - Environment (production/sandbox)
- **Features**: Financial data sync, expense tracking, chart of accounts
- **Authentication**: OAuth 2.0

### 2. **Xero** 💙
- **Description**: Cloud-based accounting software
- **Required Fields**:
  - Client ID
  - Client Secret
  - Tenant ID
  - Redirect URI
- **Features**: Organization data, accounts sync, tracking categories
- **Authentication**: OAuth 2.0

### 3. **FreshBooks** 📘
- **Description**: Invoicing and accounting for small businesses
- **Required Fields**:
  - Client ID
  - Client Secret
  - Account ID
  - Redirect URI
- **Features**: Invoice data, expense categories, client projects
- **Authentication**: OAuth 2.0

### 4. **Sage Business Cloud** 🌿
- **Description**: Accounting software for SMBs
- **Required Fields**:
  - Client ID
  - Client Secret
  - Company ID
  - Region (us, uk, ca, etc.)
- **Features**: Financial reporting, account management
- **Authentication**: OAuth 2.0

### 5. **NetSuite** 🔷
- **Description**: Oracle's ERP and financial management system
- **Required Fields**:
  - Account ID
  - Consumer Key
  - Consumer Secret
  - Token ID
  - Token Secret
- **Features**: Enterprise financial data, multi-subsidiary support
- **Authentication**: Token-Based Authentication (TBA)

## Usage

### Accessing Integration Settings
1. Log in as an **Admin** user
2. Navigate to **Admin Panel**
3. Click on **Integrations** button
4. Click on **"Accounting"** filter tab to view all accounting integrations

### Configuring an Integration

#### Example: QuickBooks Online Setup

1. **Get API Credentials from QuickBooks**:
   - Visit [developer.intuit.com](https://developer.intuit.com/)
   - Sign in with your Intuit account
   - Click "Create an app"
   - Select "QuickBooks Online and Payments" or "QuickBooks Online"
   - Fill in app details
   - Get your **Client ID** and **Client Secret** from the Keys & credentials tab
   - Find your **Company ID** (Realm ID) in QuickBooks Settings
   - Set up your **Redirect URI** (e.g., `https://yourapp.com/callback`)

2. **Configure in Platform**:
   - Open **Admin Panel** → **Integrations**
   - Click **"Accounting"** filter
   - Find the **QuickBooks Online** card
   - Fill in the fields:
     - **Client ID**: Your QuickBooks Client ID
     - **Client Secret**: Your QuickBooks Client Secret
     - **Company ID**: Your Realm ID
     - **Redirect URI**: Your callback URL
     - **Environment**: `production` (or `sandbox` for testing)
   - Click **"Save"** button

3. **Test & Enable**:
   - Click **"Test"** to verify connection
   - Toggle to **"Enabled"**
   - Click **"Sync Data"** to import financial information

### What Gets Synced?

#### From Accounting Systems:

**QuickBooks Online:**
- Chart of Accounts (up to 100 accounts)
- Expense categories (from expense-type accounts)
- Vendors (up to 50)
- Customers (up to 50)
- Account balances and types

**Xero:**
- Chart of Accounts (all accounts)
- Tracking Categories (for expense categorization)
- Contacts (customers and suppliers)
- Account codes and tax types

**FreshBooks:**
- Expense Categories
- Clients
- Projects (synced as categories)
- Client organizations

**Sage Business Cloud:**
- Ledger Accounts (chart of accounts)
- Contacts (customers and suppliers)
- Account balances and types
- Regional data based on configuration

**NetSuite:**
- Chart of Accounts
- Vendors
- Customers
- Account numbers and types

#### MongoDB Collections:
All synced data is stored in:
- `financial_accounts`: Chart of accounts from all systems
- `expense_categories`: Expense categories for gamification
- `vendors_customers`: Vendors and customers from all systems

#### Use Cases for Synced Data:
- **Expense Gamification**: Reward employees for staying under budget
- **Department Budgets**: Track spending by department
- **Reporting**: Financial performance dashboards
- **Rewards**: Link points to company performance
- **Analytics**: Combine HR and financial data
- **Budget Challenges**: Create challenges based on department spending
- **Financial Transparency**: Display company financial health to employees

## Features

### Dynamic Configuration Fields
- Each accounting system has specific OAuth requirements
- Password/secret fields are masked for security
- Show/hide toggle for sensitive fields
- Field validation ensures required fields are filled

### Test Connection
- Verify OAuth credentials before syncing
- Quick validation of API access
- Error messages for troubleshooting

### Financial Data Sync
- One-click financial data import
- Syncs expense categories and accounts
- Updates existing data
- Returns sync statistics

### Security
- All credentials encrypted in MongoDB
- Sensitive fields masked in UI
- OAuth tokens never displayed after saving
- Admin-only access

## API Endpoints

### Backend Endpoints

#### Get All Integrations
```
GET /api/admin/integrations
```
Returns all configured integrations including accounting systems.

#### Update Integration
```
PUT /api/admin/integrations/{integration_name}
```
Update accounting integration configuration.

#### Test Connection
```
POST /api/integrations/{integration_name}/test-connection
```
Test connection to the accounting system.

#### Sync Financial Data
```
POST /api/integrations/{integration_name}/sync-financials
```
Sync financial data from the accounting system.

#### Get Accounts
```
GET /api/integrations/{integration_name}/accounts
```
Retrieve chart of accounts from accounting system.

## Configuration Details

### QuickBooks Online
- **OAuth Flow**: Authorization Code Grant
- **Base URL**: `https://quickbooks.api.intuit.com/v3`
- **Scopes**: `com.intuit.quickbooks.accounting`
- **Token Lifetime**: 1 hour (refresh token valid for 100 days)

### Xero
- **OAuth Flow**: Authorization Code with PKCE
- **Base URL**: `https://api.xero.com/api.xro/2.0`
- **Scopes**: `accounting.transactions`, `accounting.settings`
- **Token Lifetime**: 30 minutes (refresh token valid for 60 days)

### FreshBooks
- **OAuth Flow**: Authorization Code Grant
- **Base URL**: `https://api.freshbooks.com`
- **Scopes**: `admin:all`
- **Token Lifetime**: Based on FreshBooks settings

### Sage Business Cloud
- **OAuth Flow**: Authorization Code Grant
- **Base URL**: Varies by region
- **Scopes**: `full_access`
- **Token Lifetime**: 20 minutes (refresh token valid indefinitely)

### NetSuite
- **Authentication**: Token-Based Authentication (TBA)
- **Base URL**: `https://{account_id}.suitetalk.api.netsuite.com`
- **No OAuth**: Uses consumer credentials and access tokens
- **Token Lifetime**: Tokens don't expire unless manually revoked

## Integration with Gamification

### Use Cases

#### 1. Budget Gamification
- Track department spending vs budget
- Reward teams for staying under budget
- Create challenges based on cost savings

#### 2. Expense Tracking
- Award points for proper expense categorization
- Recognize employees for timely expense submissions
- Leaderboard for cost-conscious employees

#### 3. Financial Awareness
- Display company financial health
- Tie rewards to company performance
- Transparent revenue/profit sharing

#### 4. Project Profitability
- Track project costs and revenues
- Reward teams on profitable projects
- Bonus points for high-margin work

## Implementation Status

### Current Status
- ✅ **Framework Complete**: All 5 systems configured
- ✅ **UI Ready**: Accounting filter, cards, and sync buttons with token fields
- ✅ **API Endpoints**: Test and sync endpoints implemented with real API calls
- ✅ **Token Management**: Access token and refresh token support
- ✅ **Data Sync**: Actual API integration with all 5 accounting systems
- ✅ **Test Connection**: Real API validation for all systems
- ✅ **Auto Token Refresh**: Automatic refresh of expired OAuth tokens

### Fully Functional (With Valid Credentials)
All accounting integrations are now ready to:
- Store OAuth tokens and credentials securely
- Display configuration UI with access/refresh token fields
- Test actual API connections with real credentials
- Sync financial data (chart of accounts, expense categories, vendors, customers)
- Automatically refresh expired OAuth tokens
- Store synced data in MongoDB for gamification

### Implementation Approach
**Hybrid OAuth Model**:
1. **Manual Token Input**: Admins paste OAuth access tokens and refresh tokens obtained from accounting system developer portals
2. **Automatic Refresh**: System automatically refreshes expired tokens using refresh tokens
3. **Real API Integration**: Makes actual API calls to fetch and sync financial data
4. **Future Enhancement**: Full OAuth redirect flow can be added later

## Troubleshooting

### Common Issues

#### 1. "Missing Access Token"
- **Cause**: Access token not provided
- **Solution**: Obtain OAuth access token from accounting system developer portal
- **How to get token**: Use OAuth Playground, Postman, or the system's developer console
- **Steps**: Complete OAuth flow manually and paste the access token in the configuration

#### 2. "Connection test failed"
- Verify access token is valid and not expired
- Check all required fields are filled (Client ID, Company ID, Tenant ID, etc.)
- Ensure API access is enabled in your accounting system
- Verify you have the correct permissions/scopes

#### 3. "Access token expired"
- **Cause**: OAuth tokens have limited lifespan (1 hour for QuickBooks, 30 min for Xero, etc.)
- **Solution**: Provide a refresh token for automatic renewal
- **Alternative**: Manually obtain a new access token and update configuration

#### 4. "Sync failed"
- Check if accounting system API is accessible
- Verify you have read permissions for financial data
- Review API rate limits (may need to wait before retrying)
- Check error messages in sync response for specific issues

#### 5. "No data synced"
- Verify API permissions/scopes allow reading financial data
- Check if accounting system has data to sync
- Ensure your account has access to the data (e.g., chart of accounts)
- Review error messages for permission issues

#### 6. "NetSuite authentication failed"
- NetSuite uses Token-Based Authentication (TBA), not OAuth
- Ensure all 5 credentials are provided: Account ID, Consumer Key, Consumer Secret, Token ID, Token Secret
- Verify TBA is enabled in NetSuite: Setup > Company > Enable Features
- Check that the integration record is active

## Security Best Practices

1. **OAuth Security**:
   - Use HTTPS for all redirect URIs
   - Implement state parameter for CSRF protection
   - Use PKCE for mobile/SPA applications
   - Rotate refresh tokens regularly

2. **Token Storage**:
   - Encrypt tokens at rest
   - Never log tokens
   - Use secure token storage
   - Implement token expiry checks

3. **Access Control**:
   - Admin-only access to integrations
   - Audit log all configuration changes
   - Review API permissions regularly
   - Limit scope to minimum required

4. **Data Handling**:
   - Encrypt sensitive financial data
   - Implement data retention policies
   - Regular security audits
   - Comply with financial regulations

## Next Steps

### Short Term (Completed ✅)
- [x] Implement token refresh mechanism
- [x] Implement actual API calls for each system
- [x] Add data transformation logic
- [x] Test connection with real API validation
- [x] Store synced data in MongoDB

### Medium Term
- [ ] Implement full OAuth 2.0 redirect flow (currently using manual token input)
- [ ] Add automated sync scheduling (hourly/daily)
- [ ] Create financial dashboards showing synced data
- [ ] Add expense approval workflows using synced categories
- [ ] Implement data pagination for large datasets
- [ ] Add webhook receivers for real-time updates
- [ ] Implement bi-directional sync where supported
- [ ] Add custom field mapping

### Long Term
- [ ] Add more accounting systems (Wave, Zoho Books, Oracle Financials, etc.)
- [ ] Advanced financial analytics and reporting
- [ ] Budget forecasting using historical data
- [ ] Integration with payroll systems
- [ ] Tax reporting features
- [ ] Multi-currency support
- [ ] Automated reconciliation
- [ ] AI-powered expense categorization

## Support Resources

### Official Documentation
- [QuickBooks API Docs](https://developer.intuit.com/app/developer/qbo/docs/get-started)
- [Xero API Docs](https://developer.xero.com/documentation/)
- [FreshBooks API Docs](https://www.freshbooks.com/api/start)
- [Sage API Docs](https://developer.sage.com/)
- [NetSuite API Docs](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/book_1559132836.html)

### Platform Support
- Full Guide: `/app/ACCOUNTING_INTEGRATIONS_GUIDE.md` (this file)
- Integration Summary: `/app/INTEGRATION_SUMMARY.md`
- API Documentation: `http://localhost:8001/docs`
- Backend Logs: `/var/log/supervisor/backend.err.log`

## Version History

### Version 1.0.0 (Current)
- Initial implementation of 5 accounting system integrations
- Dynamic field configuration
- Financial data sync framework
- Test connection feature
- OAuth preparation
- Admin panel UI with accounting filter

---

**Last Updated**: August 2025
**Maintainer**: Platform Development Team
