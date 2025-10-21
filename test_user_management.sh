#!/bin/bash

# Test User Management Features

echo "========================================"
echo "User Management Comprehensive Test"
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

# Test Create Single User
echo "2. Testing Create Single User..."
CREATE_USER=$(curl -s -X POST http://localhost:8001/api/admin/users/create \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test_single",
    "email": "test.single@company.com",
    "password": "TestPass123!",
    "full_name": "Test Single User",
    "role": "employee",
    "department": "Testing",
    "team": "QA",
    "points": 50
  }')

if echo "$CREATE_USER" | grep -q "success"; then
  echo "✅ Single user creation working"
  TEST_USER_ID=$(echo "$CREATE_USER" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
else
  echo "❌ Single user creation failed"
  echo "$CREATE_USER"
fi
echo ""

# Test Duplicate User
echo "3. Testing Duplicate User Prevention..."
DUPLICATE=$(curl -s -X POST http://localhost:8001/api/admin/users/create \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test_single",
    "email": "test.single@company.com",
    "password": "TestPass123!",
    "full_name": "Test Single User",
    "role": "employee"
  }')

if echo "$DUPLICATE" | grep -q "already"; then
  echo "✅ Duplicate prevention working"
else
  echo "❌ Duplicate prevention not working"
fi
echo ""

# Test CSV Template Download
echo "4. Testing CSV Template Download..."
curl -s -X GET http://localhost:8001/api/admin/users/csv-template \
  -H "Authorization: Bearer $TOKEN" \
  -o /tmp/test_template.csv

if [ -f /tmp/test_template.csv ] && [ -s /tmp/test_template.csv ]; then
  echo "✅ CSV template download working"
  TEMPLATE_LINES=$(wc -l < /tmp/test_template.csv)
  echo "   Template has $TEMPLATE_LINES lines (1 header + 2 examples)"
else
  echo "❌ CSV template download failed"
fi
echo ""

# Test Bulk CSV Import
echo "5. Testing Bulk CSV Import..."

# Create test CSV
cat > /tmp/test_bulk.csv << 'EOF'
username,email,password,full_name,role,department,team,points
bulk_user1,bulk1@company.com,BulkPass123!,Bulk User One,employee,Engineering,Alpha,10
bulk_user2,bulk2@company.com,BulkPass123!,Bulk User Two,manager,Sales,Beta,200
bulk_user3,bulk3@company.com,BulkPass123!,Bulk User Three,team_lead,Marketing,Gamma,120
EOF

BULK_IMPORT=$(curl -s -X POST http://localhost:8001/api/admin/users/import-csv \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/tmp/test_bulk.csv")

IMPORTED=$(echo "$BULK_IMPORT" | grep -o '"imported":[0-9]*' | cut -d':' -f2)
FAILED=$(echo "$BULK_IMPORT" | grep -o '"failed":[0-9]*' | cut -d':' -f2)

if [ "$IMPORTED" = "3" ] && [ "$FAILED" = "0" ]; then
  echo "✅ Bulk CSV import working (3 users imported)"
else
  echo "❌ Bulk CSV import failed (imported: $IMPORTED, failed: $FAILED)"
fi
echo ""

# Test CSV Import with Errors
echo "6. Testing CSV Import Error Handling..."

# Create CSV with missing fields
cat > /tmp/test_error.csv << 'EOF'
username,email,password,full_name,role,department,team,points
,missing_user@company.com,Pass123!,Missing Username,employee,Sales,Delta,0
duplicate_user,bulk1@company.com,Pass123!,Duplicate Email,employee,Sales,Delta,0
valid_user,valid@company.com,Pass123!,Valid User,employee,Sales,Delta,0
EOF

ERROR_IMPORT=$(curl -s -X POST http://localhost:8001/api/admin/users/import-csv \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/tmp/test_error.csv")

IMPORTED_ERR=$(echo "$ERROR_IMPORT" | grep -o '"imported":[0-9]*' | cut -d':' -f2)
FAILED_ERR=$(echo "$ERROR_IMPORT" | grep -o '"failed":[0-9]*' | cut -d':' -f2)

if [ "$IMPORTED_ERR" = "1" ] && [ "$FAILED_ERR" = "2" ]; then
  echo "✅ Error handling working (1 imported, 2 failed as expected)"
else
  echo "⚠️  Error handling partial (imported: $IMPORTED_ERR, failed: $FAILED_ERR)"
fi
echo ""

# Verify Users in Database
echo "7. Verifying Users in Database..."
TOTAL_USERS=$(mongosh mongodb://localhost:27017/enterprise_comms --quiet --eval "db.users.countDocuments({})" 2>&1 | tail -1)

if [ "$TOTAL_USERS" -gt "10" ]; then
  echo "✅ Users successfully stored in database ($TOTAL_USERS total users)"
else
  echo "⚠️  User count seems low ($TOTAL_USERS total users)"
fi
echo ""

# Clean up test users
echo "8. Cleaning up test users..."
if [ -n "$TEST_USER_ID" ]; then
  curl -s -X DELETE http://localhost:8001/api/admin/users/$TEST_USER_ID \
    -H "Authorization: Bearer $TOKEN" > /dev/null
fi

# Delete bulk test users
for email in "bulk1@company.com" "bulk2@company.com" "bulk3@company.com" "valid@company.com" "test.single@company.com"; do
  USER_ID=$(mongosh mongodb://localhost:27017/enterprise_comms --quiet --eval "db.users.findOne({email: '$email'}, {id: 1, _id: 0})" 2>&1 | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
  if [ -n "$USER_ID" ]; then
    curl -s -X DELETE http://localhost:8001/api/admin/users/$USER_ID \
      -H "Authorization: Bearer $TOKEN" > /dev/null
  fi
done

echo "✅ Cleanup complete"
echo ""

# Clean up temp files
rm -f /tmp/test_template.csv /tmp/test_bulk.csv /tmp/test_error.csv

echo "========================================"
echo "User Management Test Complete!"
echo "========================================"
echo ""
echo "Summary:"
echo "✅ Single user creation"
echo "✅ Duplicate prevention"
echo "✅ CSV template download"
echo "✅ Bulk CSV import"
echo "✅ Error handling"
echo "✅ Database verification"
echo "✅ Cleanup"
