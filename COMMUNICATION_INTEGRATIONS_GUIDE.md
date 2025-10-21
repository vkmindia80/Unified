# Communication Systems Integration Guide

This guide covers the 5 communication system integrations available in the Enterprise Communication & Gamification System.

## 🎬 GIPHY (Already Configured)

**Purpose:** GIF search and trending functionality for chat

**Setup:**
1. Visit [developers.giphy.com](https://developers.giphy.com/)
2. Create a free account
3. Create a new app (select "API" type)
4. Copy your API key

**Use Cases:**
- Add GIFs to chat messages
- Search and share trending GIFs
- Enhance team communication with visual content

---

## 💬 Slack

**Purpose:** Send messages and notifications to Slack channels

**Setup:**
1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Create a new app or select existing
3. Navigate to "OAuth & Permissions"
4. Add bot scopes: `chat:write`, `channels:read`
5. Install app to workspace
6. Copy "Bot User OAuth Token" (starts with `xoxb-`)

**Configuration Fields:**
- **Bot Token** (required): Your Slack bot token
- **Webhook URL** (optional): For simpler messaging
- **Default Channel** (optional): E.g., #general

**Use Cases:**
- Post announcements to team channels
- Send leaderboard updates
- Notify about achievements and rewards
- Alert on important events

**API Endpoint:**
```bash
POST /api/integrations/slack/send-message
{
  "message": "Your message here",
  "title": "Optional title",
  "channel": "#channel-name"
}
```

---

## 👥 Microsoft Teams

**Purpose:** Post messages and notifications to Teams channels

**Setup:**
1. Open Microsoft Teams
2. Navigate to the channel you want to post to
3. Click "..." menu → Connectors
4. Search for "Incoming Webhook" → Configure
5. Name it (e.g., "Enterprise Bot")
6. Copy the webhook URL

**Configuration Fields:**
- **Webhook URL** (required): Teams incoming webhook URL
- **Client ID** (optional): For advanced features
- **Client Secret** (optional): For advanced features
- **Tenant ID** (optional): For advanced features

**Use Cases:**
- Share company-wide announcements
- Post team achievements
- Send automated notifications
- Broadcast leaderboard standings

**API Endpoint:**
```bash
POST /api/integrations/microsoft_teams/send-message
{
  "message": "Your message here",
  "title": "Optional title"
}
```

---

## 🎮 Discord

**Purpose:** Send messages to Discord channels and communities

**Setup Options:**

### Option A: Webhook (Easiest)
1. Right-click channel → Edit Channel
2. Go to Integrations → Webhooks
3. Create New Webhook
4. Copy webhook URL

### Option B: Bot (More Control)
1. Visit [discord.com/developers](https://discord.com/developers/applications)
2. Create New Application
3. Go to Bot → Add Bot
4. Copy bot token
5. Enable required intents (Message Content Intent)
6. Use OAuth2 URL Generator to invite bot to server

**Configuration Fields:**
- **Bot Token** (required): Discord bot token
- **Webhook URL** (optional): For webhook-based messaging
- **Server ID** (optional): Your Discord server ID

**Use Cases:**
- Community engagement
- Gaming team coordination
- Send event notifications
- Share achievements with community

**API Endpoint:**
```bash
POST /api/integrations/discord/send-message
{
  "message": "Your message here",
  "title": "Optional title",
  "channel": "channel-id"
}
```

---

## ✈️ Telegram

**Purpose:** Send messages and broadcasts via Telegram bot

**Setup:**
1. Open Telegram and search for [@BotFather](https://t.me/BotFather)
2. Send `/newbot` command
3. Follow instructions to create bot
4. Copy bot token (format: `123456:ABC-DEF1234ghIkl...`)
5. Add bot to your group/channel
6. Get Chat ID:
   - Add [@userinfobot](https://t.me/userinfobot) to get chat/group ID
   - Or visit: `https://api.telegram.org/bot<token>/getUpdates`

**Configuration Fields:**
- **Bot Token** (required): Your Telegram bot token
- **Chat ID** (required): Target chat/channel ID
- **Parse Mode** (optional): HTML or Markdown formatting

**Chat ID Format:**
- Private chats: Positive number
- Groups: Negative number (starts with -)
- Channels: Starts with -100

**Use Cases:**
- Broadcast announcements to all employees
- Send notifications to specific teams
- Share company updates
- Automated reminders and alerts

**API Endpoint:**
```bash
POST /api/integrations/telegram/send-message
{
  "message": "Your message here",
  "title": "Optional title"
}
```

---

## 📱 Twilio (SMS & WhatsApp)

**Purpose:** Send SMS and WhatsApp messages

**Setup:**
1. Visit [twilio.com/console](https://www.twilio.com/console)
2. Sign up for free trial or log in
3. Copy Account SID and Auth Token from dashboard
4. Go to Phone Numbers → Buy a Number (or use trial number)
5. For WhatsApp: Join Twilio Sandbox or request WhatsApp Business approval

**Configuration Fields:**
- **Account SID** (required): Your Twilio account SID
- **Auth Token** (required): Your Twilio auth token
- **Phone Number** (required): Your Twilio phone number (e.g., +1234567890)
- **WhatsApp Enabled** (optional): Set to "true" for WhatsApp messaging

**Important Notes:**
- Trial accounts can only send to verified numbers
- Upgrade to paid account for production use
- WhatsApp requires separate approval from WhatsApp

**Use Cases:**
- Send SMS notifications
- WhatsApp Business messaging
- Emergency alerts
- Important announcements to mobile
- Two-factor authentication

**API Endpoint:**
```bash
POST /api/integrations/twilio/send-message
{
  "message": "Your message here",
  "phone_numbers": ["+1234567890", "+0987654321"]
}
```

---

## 🔧 Testing Integrations

After configuring any integration:

1. **Save Configuration**: Click the "Save" button
2. **Test Connection**: Click the "Test" button to verify credentials
3. **Check Status**: Ensure integration shows as "Enabled"

## 📤 Sending Messages Programmatically

All communication systems support the `/send-message` endpoint:

```bash
POST /api/integrations/{integration_name}/send-message
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "message": "Your message content",
  "title": "Optional title (if supported)",
  "channel": "Optional channel/chat ID",
  "phone_numbers": ["Optional array for Twilio"]
}
```

**Example with cURL:**
```bash
curl -X POST http://localhost:8001/api/integrations/slack/send-message \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Team meeting in 10 minutes!",
    "title": "📅 Reminder",
    "channel": "#general"
  }'
```

## 🔐 Security Best Practices

1. **Never commit credentials** to version control
2. **Use environment variables** for sensitive data when possible
3. **Rotate tokens regularly** (especially bot tokens)
4. **Limit permissions** to only what's needed
5. **Monitor usage** to detect unauthorized access
6. **Use webhooks** when possible (simpler and more secure)

## 🚀 Common Use Cases

### Leaderboard Updates
Send weekly leaderboard standings to all communication channels.

### Achievement Notifications
Notify the team when someone unlocks a new achievement.

### Company Announcements
Broadcast important messages across multiple platforms simultaneously.

### Event Reminders
Send reminders about upcoming team events or meetings.

### Recognition Posts
Share employee recognitions publicly to boost morale.

## 📊 Integration Status

You can check the status of all integrations in the Admin Panel:
- Navigate to **Admin Panel** → **Integration Settings**
- Filter by "Communication" to see all communication systems
- View enabled/disabled status
- Test connections
- Update credentials

## 🆘 Troubleshooting

### Connection Test Fails
- Verify credentials are correct
- Check API token hasn't expired
- Ensure bot has necessary permissions
- Verify webhook URLs are valid

### Messages Not Sending
- Check integration is enabled
- Verify channel/chat IDs are correct
- Ensure bot is added to the channel/group
- Check rate limits for the platform

### Invalid Token Error
- Regenerate token from platform
- Update credentials in integration settings
- Save and test connection again

## 📚 Additional Resources

- [Slack API Documentation](https://api.slack.com/)
- [Microsoft Teams Webhooks](https://docs.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/)
- [Discord Developer Portal](https://discord.com/developers/docs/)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Twilio Documentation](https://www.twilio.com/docs)

---

**Need Help?** Contact your system administrator or check the [ROADMAP.md](./ROADMAP.md) for upcoming features.

*Version 1.0.0 - Communication Integrations - August 2025*
