# 🔐 Quick Login Guide

## ✅ Login Issue Fixed!

Demo users have been created successfully. You can now log in!

---

## 🚀 Quick Start - Login Now

### Primary Test Accounts

#### 👑 Admin Account (Recommended for testing)
```
Email: admin@company.com
Password: Admin123!
```
**Access**: Full system access, can manage all features

---

#### 📊 Manager Account
```
Email: manager@company.com
Password: Manager123!
```
**Access**: Team management, can create quick links and events

---

#### 👤 Employee Account
```
Email: test@company.com
Password: Test123!
```
**Access**: Standard user features, own events management

---

## 📝 How to Login

1. **Navigate** to the application URL
2. **Enter** one of the email addresses above
3. **Enter** the corresponding password
4. **Click** "Login" or "Sign In"

---

## 🎯 Testing Digital HQ Features

After logging in, test the enhanced Digital HQ:

### 1. Navigate to Digital HQ
- Click on **"Digital HQ"** from the dashboard

### 2. Test Calendar Widget
- **Create Event**: Click the "+" button
- **Edit Event**: Hover over an event, click the blue edit button
- **Delete Event**: Hover over an event, click the red delete button

### 3. Test Quick Links Widget
- **Create Link** (Admin/Manager only): Click the "+" button
- **Edit Link**: Hover and click edit
- **Delete Link**: Hover and click delete

---

## 🔑 All Available Test Accounts

| Email | Password | Role | Department |
|-------|----------|------|------------|
| admin@company.com | Admin123! | Admin | Administration |
| manager@company.com | Manager123! | Manager | Operations |
| test@company.com | Test123! | Employee | Engineering |
| sarah.johnson@company.com | Demo123! | Team Lead | Engineering |
| mike.chen@company.com | Demo123! | Employee | Engineering |
| emma.davis@company.com | Demo123! | Dept Head | Engineering |
| james.wilson@company.com | Demo123! | Employee | Design |
| lisa.brown@company.com | Demo123! | Manager | Operations |

---

## 🧪 Testing Different User Types

### Test as Admin (Full Access)
1. Login as `admin@company.com`
2. Can create, edit, delete ALL events and links
3. Access to admin panel and all features

### Test as Manager (Team Access)
1. Login as `manager@company.com`
2. Can create quick links and events
3. Can manage team-related features

### Test as Employee (Limited Access)
1. Login as `test@company.com`
2. Can create and manage own events
3. Can view quick links but not create them

---

## ⚠️ Troubleshooting

### If Login Still Fails

1. **Check Backend is Running**
   ```bash
   sudo supervisorctl status backend
   ```

2. **Check MongoDB is Running**
   ```bash
   sudo supervisorctl status mongodb
   ```

3. **Verify Users Exist**
   ```bash
   python3 /app/scripts/create_demo_users.py
   ```

4. **Check Backend Logs**
   ```bash
   tail -n 50 /var/log/supervisor/backend.out.log
   ```

### Common Issues

**"Incorrect email or password"**
- ✅ Double-check you're using the exact email and password
- ✅ Passwords are case-sensitive
- ✅ Make sure no extra spaces

**"Network Error"**
- ✅ Check that backend is running on port 8001
- ✅ Verify frontend can reach the backend

**"User not found"**
- ✅ Run the create demo users script again

---

## 🔄 Recreate Users (If Needed)

If you need to recreate the demo users:

```bash
python3 /app/scripts/create_demo_users.py
```

This script is **idempotent** - it won't create duplicate users.

---

## 📊 Verify Setup

Run this command to check how many users exist:

```bash
mongosh mongodb://localhost:27017/enterprise_comms --quiet --eval "print('Total users:', db.users.countDocuments({}))"
```

Expected output: `Total users: 8`

---

## 🎉 You're Ready!

Login with any of the accounts above and start testing the Digital HQ enhancements!

**Recommended first login**: Use `admin@company.com` / `Admin123!` for full access to all features.

---

## 📚 Next Steps

After logging in:
1. Go to `/digital-hq` route
2. Test creating calendar events
3. Test editing and deleting events
4. Test quick links (if admin/manager)
5. Explore other widgets

---

**Status**: ✅ All users created and ready to use
**Last Updated**: August 2025

