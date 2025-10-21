# HR System Integrations Guide

## Overview
This document provides information about the HR system integrations added to the Admin Panel.

## Available HR Integrations

The following 10 popular HR systems have been integrated into the platform:

### 1. **BambooHR** 🎋
- **Description**: Popular HR management platform
- **Required Fields**:
  - API Key
  - Company Subdomain
  - Webhook URL (Optional)
- **Features**: Employee sync, directory management

### 2. **Workday** 💼
- **Description**: Enterprise HR and financial management
- **Required Fields**:
  - Client ID
  - Client Secret
  - Tenant Name
  - Base URL
- **Features**: Comprehensive HR data sync

### 3. **ADP Workforce Now** 📊
- **Description**: Payroll and HR management
- **Required Fields**:
  - Client ID
  - Client Secret
  - SSL Certificate Path
- **Features**: Payroll and employee data integration

### 4. **Gusto** 💰
- **Description**: HR, payroll, and benefits
- **Required Fields**:
  - API Token
  - Company ID
- **Features**: Employee sync, payroll integration

### 5. **Namely** 👥
- **Description**: HR platform for mid-sized companies
- **Required Fields**:
  - Access Token
  - Company Subdomain
- **Features**: Employee directory sync

### 6. **SAP SuccessFactors** 🏢
- **Description**: Enterprise HR management solution
- **Required Fields**:
  - Company ID
  - User ID
  - Password
  - Data Center
- **Features**: Enterprise-grade HR sync

### 7. **Oracle HCM Cloud** 🏛️
- **Description**: Human capital management solution
- **Required Fields**:
  - Username
  - Password
  - Instance URL
- **Features**: Cloud-based HR data sync

### 8. **Rippling** 🌊
- **Description**: HR, IT, and Finance platform
- **Required Fields**:
  - API Key
  - Company ID
- **Features**: Multi-system employee sync

### 9. **Zenefits** ⚡
- **Description**: HR software platform
- **Required Fields**:
  - Access Token
  - Company ID
- **Features**: Employee benefits and HR sync

### 10. **Paycor** 💳
- **Description**: HR and payroll solutions
- **Required Fields**:
  - Client ID
  - Client Secret
  - Company ID
- **Features**: Payroll and HR integration

## Usage

### Accessing Integration Settings
1. Log in as an **Admin** user
2. Navigate to **Admin Panel**
3. Click on **Integrations** button
4. Select the HR System filter to view all HR integrations

### Configuring an Integration
1. Select the HR system you want to configure
2. Fill in all required fields:
   - API Keys/Tokens
   - Company identifiers (subdomain, company ID, etc.)
   - Additional configuration (URLs, certificates, etc.)
3. Click **Save** to store the configuration
4. Click **Test** to verify the connection
5. Toggle **Enable** to activate the integration

### Syncing Employee Data
1. Ensure the integration is configured and enabled
2. Click **Sync Now** button
3. The system will:
   - Fetch employee data from the HR system
   - Create new users if they don't exist
   - Update existing user information
   - Display sync results (synced count, updated count)

### Features

#### Dynamic Configuration Fields
- Each HR system has its own set of required fields
- Password/token fields are masked for security
- Show/hide toggle for sensitive fields
- Field validation ensures required fields are filled

#### Test Connection
- Verify credentials before syncing
- Quick validation of API access
- Error messages for troubleshooting

#### Employee Sync
- One-click employee data import
- Creates new users automatically
- Updates existing user information
- Syncs: name, email, department, role
- Generated passwords for new users

#### Security
- All credentials are encrypted in MongoDB
- Sensitive fields are masked in the UI
- API keys are never displayed in full after saving
- Admin-only access to integration settings

## API Endpoints

### Backend Endpoints

#### Get All Integrations
```
GET /api/admin/integrations
```
Returns all configured integrations with masked credentials.

#### Update Integration
```
PUT /api/admin/integrations/{integration_name}
```
Update integration configuration and settings.

#### Test Connection
```
POST /api/integrations/{integration_name}/test-connection
```
Test connection to the HR system.

#### Sync Employees
```
POST /api/integrations/{integration_name}/sync-employees
```
Sync employee data from the HR system.

#### Get Sync History
```
GET /api/integrations/{integration_name}/sync-history
```
View sync history and logs.

## Implementation Details

### Database Schema
Each integration is stored in MongoDB with the following structure:

```javascript
{
  "id": "uuid",
  "name": "bamboohr",
  "display_name": "BambooHR",
  "description": "Sync employee data from BambooHR",
  "type": "hr_system",
  "api_key": "encrypted_key",
  "config": {
    "subdomain": "company",
    "webhook_url": "https://..."
  },
  "enabled": true,
  "fields": [
    {
      "name": "api_key",
      "label": "API Key",
      "type": "password",
      "required": true
    },
    // ... more fields
  ],
  "updated_at": "ISO timestamp",
  "updated_by": "admin_user_id"
}
```

### Employee Sync Process
1. **Authentication**: Use stored credentials to authenticate with HR system
2. **Fetch Data**: Retrieve employee list via HR system API
3. **Transform**: Map HR system data to platform user model
4. **Create/Update**: 
   - Check if user exists by email
   - Create new user with generated password if not exists
   - Update existing user information if exists
5. **Report**: Return sync statistics (synced, updated, errors)

### Supported HR System APIs
- **BambooHR**: Full implementation with API v1
- **Gusto**: Full implementation with REST API
- **Rippling**: Full implementation with Platform API
- **Zenefits**: Full implementation with Core API
- **Workday**: Placeholder (complex OAuth flow)
- **ADP**: Placeholder (requires certificate authentication)
- **Others**: Framework ready for implementation

## Frontend Components

### Filter Tabs
- **All Integrations**: View all available integrations
- **HR Systems**: Filter to show only HR system integrations
- **Communication**: Filter to show communication tools (GIPHY, etc.)

### Integration Card
Each integration displays:
- Icon and name
- Description and type badge
- Enable/disable toggle
- Dynamic configuration fields
- Action buttons (Save, Test, Sync)
- Setup instructions
- Last updated timestamp

### Real-time Feedback
- Toast notifications for all actions
- Loading states for async operations
- Success/error messages
- Sync progress indicators

## Security Best Practices

1. **Admin-Only Access**: All integration endpoints require admin role
2. **Encrypted Storage**: Credentials stored securely in MongoDB
3. **Masked Display**: Sensitive data never fully displayed in UI
4. **HTTPS Only**: Use HTTPS for all API communications
5. **Token Expiry**: Implement token refresh where supported
6. **Audit Logs**: Track all integration configuration changes

## Troubleshooting

### Common Issues

#### 1. "Integration not found"
- Ensure the integration exists in the database
- Check that the integration name matches exactly

#### 2. "Connection test failed"
- Verify all required fields are filled
- Check API credentials are correct
- Ensure HR system API is accessible
- Check firewall/network settings

#### 3. "Sync failed"
- Verify integration is enabled
- Check API rate limits
- Review error messages in sync response
- Ensure HR system API is operational

#### 4. "No employees synced"
- Check if HR system has employees
- Verify API permissions allow reading employee data
- Review sync logs for specific errors

## Future Enhancements

### Planned Features
- [ ] Webhook receivers for real-time updates
- [ ] Scheduled automatic syncs
- [ ] Sync history and audit trails
- [ ] Selective sync (by department, team, etc.)
- [ ] Bi-directional sync (update HR system from platform)
- [ ] Advanced mapping configuration
- [ ] Custom field mapping
- [ ] Conflict resolution strategies
- [ ] Bulk operations
- [ ] Integration health monitoring

### Additional HR Systems
- [ ] Zoho People
- [ ] Personio
- [ ] Hibob
- [ ] ChartHop
- [ ] Lattice
- [ ] 15Five
- [ ] BreatheHR

## Support

For issues or questions regarding HR integrations:
1. Check the integration instructions in the Admin Panel
2. Review this documentation
3. Check the backend logs at `/var/log/supervisor/backend.*.log`
4. Contact your HR system provider for API access issues
5. Reach out to platform administrators

## Version History

### Version 1.0.0 (Current)
- Initial implementation of 10 HR system integrations
- Dynamic field configuration
- Employee sync functionality
- Test connection feature
- Security and encryption
- Admin panel UI

---

**Last Updated**: August 2025
**Maintainer**: Platform Development Team
