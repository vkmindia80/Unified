# Quick Start: Communication Integrations 🚀

Get started with communication system integrations in under 5 minutes!

## Prerequisites ✅

- Admin access to the platform
- Credentials for at least one communication platform

## Step 1: Access Integration Settings

1. Login as admin
2. Navigate to **Admin Panel** → **Integration Settings**
3. Click the **Communication** filter tab

You'll see 6 communication systems:
- 🎬 GIPHY (for GIFs)
- 💬 Slack
- 👥 Microsoft Teams  
- 🎮 Discord
- ✈️ Telegram
- 📱 Twilio (SMS/WhatsApp)

## Step 2: Choose Your Platform

Pick the platform your team uses most. Here are the easiest ones to start with:

### ⚡ Fastest Setup: Microsoft Teams (Webhook)
**Time: 2 minutes**

1. Open Microsoft Teams
2. Go to your channel → "..." → Connectors → Incoming Webhook
3. Name it "Enterprise Bot" and copy the webhook URL
4. Paste URL in the integration settings
5. Click Save → Test → Success! ✅

### 🚀 Most Popular: Slack
**Time: 5 minutes**

1. Visit [api.slack.com/apps](https://api.slack.com/apps)
2. Create New App → From scratch
3. Add permissions: `chat:write`, `channels:read`
4. Install to workspace
5. Copy "Bot User OAuth Token" (starts with `xoxb-`)
6. Paste in integration settings
7. Click Save → Test → Success! ✅

### 🎮 For Communities: Discord (Webhook)
**Time: 3 minutes**

1. Right-click your Discord channel → Edit Channel
2. Integrations → Webhooks → New Webhook
3. Copy webhook URL
4. Paste in integration settings
5. Click Save → Test → Success! ✅

## Step 3: Test the Connection

After saving credentials:
1. Click the **Test** button
2. Wait for response
3. ✅ Success message = You're ready!
4. ❌ Error = Double-check credentials

## Step 4: Send Your First Message

### Option A: Use the Test Script
```bash
python3 /app/test_communication_integrations.py
```

Follow the interactive prompts to send a test message.

### Option B: Use the API
```bash
# Login to get token
TOKEN=$(curl -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@company.com","password":"Admin123!"}' \
  | jq -r '.access_token')

# Send message to Slack
curl -X POST http://localhost:8001/api/integrations/slack/send-message \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello from Enterprise Communication System! 🚀",
    "title": "Test Message",
    "channel": "#general"
  }'
```

### Option C: From Python Code
```python
import requests

# Get token
response = requests.post('http://localhost:8001/api/auth/login', json={
    'email': 'admin@company.com',
    'password': 'Admin123!'
})
token = response.json()['access_token']

# Send message
headers = {
    'Authorization': f'Bearer {token}',
    'Content-Type': 'application/json'
}

data = {
    'message': 'Hello from Python! 🐍',
    'title': 'Automated Message',
    'channel': '#general'  # Optional for most platforms
}

response = requests.post(
    'http://localhost:8001/api/integrations/slack/send-message',
    headers=headers,
    json=data
)

print(response.json())
```

## Common Use Cases 💡

### 1. Daily Leaderboard Updates
Send the top 5 performers to your team channel every day.

### 2. Achievement Announcements
Notify the team when someone unlocks a major achievement.

### 3. Important Announcements
Broadcast company-wide announcements to multiple platforms.

### 4. Event Reminders
Send reminders about team events or meetings.

### 5. Recognition Posts
Share employee recognitions publicly to boost morale.

## Platform-Specific Quick Tips

### Slack
- Use `#channel-name` for public channels
- Use `@username` for DMs (requires additional setup)
- Supports rich formatting with blocks

### Microsoft Teams
- One webhook per channel
- Supports MessageCard format for rich cards
- Great for formatted announcements

### Discord
- Use webhook for simplest setup
- Bot token gives more control (send to any channel)
- Supports embeds for rich content

### Telegram
- Chat ID for groups starts with `-`
- Chat ID for channels starts with `-100`
- Supports HTML and Markdown formatting

### Twilio
- Requires phone numbers in E.164 format (`+1234567890`)
- Trial account needs verified numbers
- Can send to multiple recipients at once

## Troubleshooting 🔧

### "Connection test failed"
- ✅ Double-check credentials are correct
- ✅ Ensure token hasn't expired
- ✅ Verify bot has necessary permissions
- ✅ Check webhook URL is complete and valid

### "Message not sent"
- ✅ Confirm integration is enabled (green checkmark)
- ✅ Verify channel/chat ID is correct
- ✅ Ensure bot is added to the channel/group
- ✅ Check API rate limits for the platform

### "Invalid token"
- ✅ Regenerate token from platform
- ✅ Update in integration settings
- ✅ Save and test again

## Next Steps 🎯

1. ✅ Set up your first integration
2. ✅ Send a test message
3. ✅ Read full guide: [COMMUNICATION_INTEGRATIONS_GUIDE.md](./COMMUNICATION_INTEGRATIONS_GUIDE.md)
4. ✅ Explore other integrations
5. ✅ Integrate with your app workflows

## Need More Help? 📚

- **Full Documentation:** [COMMUNICATION_INTEGRATIONS_GUIDE.md](./COMMUNICATION_INTEGRATIONS_GUIDE.md)
- **Implementation Details:** [INTEGRATION_IMPLEMENTATION_SUMMARY.md](./INTEGRATION_IMPLEMENTATION_SUMMARY.md)
- **Test Script:** Run `python3 /app/test_communication_integrations.py`
- **Main README:** [README.md](./README.md)

---

**Happy Integrating! 🎉**

If you have any questions, check the documentation or contact your system administrator.

*Quick Start Guide - Communication Integrations v1.0*
