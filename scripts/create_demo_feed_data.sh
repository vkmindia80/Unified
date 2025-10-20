#!/bin/bash
# Script to create demo announcements and recognitions

API_URL="http://localhost:8001"

# First, let's get a token by logging in
echo "Logging in as admin..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@company.com",
    "password": "Admin123!"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "Failed to login. Trying demo user..."
    LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
      -H "Content-Type: application/json" \
      -d '{
        "email": "john.doe@company.com",
        "password": "Demo123!"
      }')
    TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
fi

if [ -z "$TOKEN" ]; then
    echo "Error: Failed to get authentication token"
    exit 1
fi

echo "Token obtained successfully!"
echo "Creating demo announcements..."

# Create announcements
curl -s -X POST "$API_URL/api/announcements" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Welcome to the New Company Feed!",
    "content": "We are excited to introduce our new company-wide announcement system. Stay tuned for important updates, company news, and team celebrations!",
    "priority": "high",
    "target_audience": "all",
    "requires_acknowledgement": true
  }' | python3 -m json.tool

curl -s -X POST "$API_URL/api/announcements" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Team Meeting - Friday 2 PM",
    "content": "All hands meeting this Friday at 2 PM in the main conference room. We will discuss Q1 goals and new initiatives. Please confirm your attendance.",
    "priority": "normal",
    "target_audience": "all",
    "requires_acknowledgement": true
  }' | python3 -m json.tool

curl -s -X POST "$API_URL/api/announcements" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "🎉 Company Milestone: 10,000 Customers!",
    "content": "Amazing news team! We have just reached 10,000 customers. This is a huge milestone and could not have been achieved without each and every one of you. Thank you for your hard work and dedication!",
    "priority": "high",
    "target_audience": "all",
    "requires_acknowledgement": false
  }' | python3 -m json.tool

curl -s -X POST "$API_URL/api/announcements" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Server Maintenance - Saturday Night",
    "content": "Please note that our servers will undergo scheduled maintenance this Saturday from 10 PM to 2 AM. Services may be temporarily unavailable during this time.",
    "priority": "urgent",
    "target_audience": "all",
    "requires_acknowledgement": true
  }' | python3 -m json.tool

echo ""
echo "Demo announcements created successfully!"
echo ""
echo "Note: To create recognitions, you need user IDs."
echo "You can get user IDs by calling: curl -H 'Authorization: Bearer $TOKEN' $API_URL/api/users"
