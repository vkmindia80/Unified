#!/bin/bash

# Test Admin Panel Functionality

echo "========================================"
echo "Admin Panel Comprehensive Test"
echo "========================================"
echo ""

# Login as admin
echo "1. Testing Admin Login..."
TOKEN=$(curl -s -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@company.com","password":"Admin123!"}' | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

if [ -n "$TOKEN" ]; then
  echo "✅ Admin login successful"
else
  echo "❌ Admin login failed"
  exit 1
fi
echo ""

# Test Analytics
echo "2. Testing Analytics Endpoint..."
ANALYTICS=$(curl -s -X GET http://localhost:8001/api/admin/analytics -H "Authorization: Bearer $TOKEN")
if echo "$ANALYTICS" | grep -q "total_users"; then
  echo "✅ Analytics endpoint working"
else
  echo "❌ Analytics endpoint failed"
fi
echo ""

# Test Detailed Stats
echo "3. Testing Detailed Stats Endpoint..."
STATS=$(curl -s -X GET http://localhost:8001/api/admin/stats/detailed -H "Authorization: Bearer $TOKEN")
if echo "$STATS" | grep -q "users_by_role"; then
  echo "✅ Detailed stats endpoint working"
else
  echo "❌ Detailed stats endpoint failed"
fi
echo ""

# Test Get Users
echo "4. Testing Get Users..."
USERS=$(curl -s -X GET http://localhost:8001/api/admin/users -H "Authorization: Bearer $TOKEN")
if echo "$USERS" | grep -q "email"; then
  echo "✅ Get users endpoint working"
else
  echo "❌ Get users endpoint failed"
fi
echo ""

# Test Get Achievements
echo "5. Testing Get Achievements..."
ACHIEVEMENTS=$(curl -s -X GET http://localhost:8001/api/admin/achievements -H "Authorization: Bearer $TOKEN")
if echo "$ACHIEVEMENTS" | grep -q "unlock_count"; then
  echo "✅ Get achievements endpoint working"
else
  echo "❌ Get achievements endpoint failed"
fi
echo ""

# Test Create Achievement
echo "6. Testing Create Achievement..."
CREATE_ACH=$(curl -s -X POST http://localhost:8001/api/admin/achievements \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Achievement",
    "description": "This is a test",
    "icon": "🧪",
    "points": 50,
    "type": "milestone"
  }')
if echo "$CREATE_ACH" | grep -q "Test Achievement"; then
  echo "✅ Create achievement working"
  TEST_ACH_ID=$(echo "$CREATE_ACH" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
else
  echo "❌ Create achievement failed"
fi
echo ""

# Test Update Achievement
if [ -n "$TEST_ACH_ID" ]; then
  echo "7. Testing Update Achievement..."
  UPDATE_ACH=$(curl -s -X PUT http://localhost:8001/api/admin/achievements/$TEST_ACH_ID \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"points": 75}')
  if echo "$UPDATE_ACH" | grep -q "75"; then
    echo "✅ Update achievement working"
  else
    echo "❌ Update achievement failed"
  fi
  echo ""
fi

# Test Get Challenges
echo "8. Testing Get Challenges..."
CHALLENGES=$(curl -s -X GET http://localhost:8001/api/admin/challenges -H "Authorization: Bearer $TOKEN")
if echo "$CHALLENGES" | grep -q "target"; then
  echo "✅ Get challenges endpoint working"
else
  echo "❌ Get challenges endpoint failed"
fi
echo ""

# Test Create Challenge
echo "9. Testing Create Challenge..."
CREATE_CHAL=$(curl -s -X POST http://localhost:8001/api/admin/challenges \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Challenge",
    "description": "This is a test challenge",
    "points": 200,
    "target": 20,
    "type": "messages",
    "active": true
  }')
if echo "$CREATE_CHAL" | grep -q "Test Challenge"; then
  echo "✅ Create challenge working"
  TEST_CHAL_ID=$(echo "$CREATE_CHAL" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
else
  echo "❌ Create challenge failed"
fi
echo ""

# Test Get Rewards
echo "10. Testing Get Rewards..."
REWARDS=$(curl -s -X GET http://localhost:8001/api/admin/rewards -H "Authorization: Bearer $TOKEN")
if echo "$REWARDS" | grep -q "redemption_count"; then
  echo "✅ Get rewards endpoint working"
else
  echo "❌ Get rewards endpoint failed"
fi
echo ""

# Test Create Reward
echo "11. Testing Create Reward..."
CREATE_REW=$(curl -s -X POST http://localhost:8001/api/admin/rewards \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Reward",
    "description": "This is a test reward",
    "cost": 150,
    "icon": "🎁",
    "category": "merchandise",
    "active": true,
    "stock": 50
  }')
if echo "$CREATE_REW" | grep -q "Test Reward"; then
  echo "✅ Create reward working"
  TEST_REW_ID=$(echo "$CREATE_REW" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
else
  echo "❌ Create reward failed"
fi
echo ""

# Test Points Adjustment
echo "12. Testing Points Adjustment..."
USER_ID=$(curl -s -X GET http://localhost:8001/api/admin/users -H "Authorization: Bearer $TOKEN" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
ADJUST=$(curl -s -X POST http://localhost:8001/api/admin/points/adjust \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"user_id\": \"$USER_ID\",
    \"points\": 50,
    \"reason\": \"Test adjustment\"
  }")
if echo "$ADJUST" | grep -q "success"; then
  echo "✅ Points adjustment working"
else
  echo "❌ Points adjustment failed"
fi
echo ""

# Clean up test data
echo "13. Cleaning up test data..."
if [ -n "$TEST_ACH_ID" ]; then
  curl -s -X DELETE http://localhost:8001/api/admin/achievements/$TEST_ACH_ID -H "Authorization: Bearer $TOKEN" > /dev/null
fi
if [ -n "$TEST_CHAL_ID" ]; then
  curl -s -X DELETE http://localhost:8001/api/admin/challenges/$TEST_CHAL_ID -H "Authorization: Bearer $TOKEN" > /dev/null
fi
if [ -n "$TEST_REW_ID" ]; then
  curl -s -X DELETE http://localhost:8001/api/admin/rewards/$TEST_REW_ID -H "Authorization: Bearer $TOKEN" > /dev/null
fi
echo "✅ Cleanup complete"
echo ""

echo "========================================"
echo "Admin Panel Test Complete!"
echo "========================================"
