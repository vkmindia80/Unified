#!/usr/bin/env python3
"""
Script to create demo users in the database
"""
import sys
sys.path.append('/app/backend')

from pymongo import MongoClient
from passlib.context import CryptContext
from datetime import datetime
import uuid

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# MongoDB connection
client = MongoClient("mongodb://localhost:27017/enterprise_comms")
db = client.get_database()
users_collection = db["users"]

# Demo users data
demo_users = [
    {
        "email": "admin@company.com",
        "password": "Admin123!",
        "username": "admin",
        "full_name": "Admin User",
        "role": "admin",
        "department": "Administration",
        "team": "Management",
        "points": 1000
    },
    {
        "email": "manager@company.com",
        "password": "Manager123!",
        "username": "manager",
        "full_name": "Manager User",
        "role": "manager",
        "department": "Operations",
        "team": "Operations Team",
        "points": 750
    },
    {
        "email": "test@company.com",
        "password": "Test123!",
        "username": "testuser",
        "full_name": "Test Employee",
        "role": "employee",
        "department": "Engineering",
        "team": "Development Team",
        "points": 500
    },
    {
        "email": "sarah.johnson@company.com",
        "password": "Demo123!",
        "username": "sarah.johnson",
        "full_name": "Sarah Johnson",
        "role": "team_lead",
        "department": "Engineering",
        "team": "Frontend Team",
        "points": 650
    },
    {
        "email": "mike.chen@company.com",
        "password": "Demo123!",
        "username": "mike.chen",
        "full_name": "Mike Chen",
        "role": "employee",
        "department": "Engineering",
        "team": "Backend Team",
        "points": 450
    },
    {
        "email": "emma.davis@company.com",
        "password": "Demo123!",
        "username": "emma.davis",
        "full_name": "Emma Davis",
        "role": "department_head",
        "department": "Engineering",
        "team": "Leadership",
        "points": 800
    },
    {
        "email": "james.wilson@company.com",
        "password": "Demo123!",
        "username": "james.wilson",
        "full_name": "James Wilson",
        "role": "employee",
        "department": "Design",
        "team": "Design Team",
        "points": 400
    },
    {
        "email": "lisa.brown@company.com",
        "password": "Demo123!",
        "username": "lisa.brown",
        "full_name": "Lisa Brown",
        "role": "manager",
        "department": "Operations",
        "team": "Operations Team",
        "points": 700
    }
]

def create_users():
    """Create demo users in the database"""
    print("Creating demo users...")
    
    for user_data in demo_users:
        # Check if user already exists
        existing = users_collection.find_one({"email": user_data["email"]})
        if existing:
            print(f"✓ User {user_data['email']} already exists")
            continue
        
        # Hash password
        hashed_password = pwd_context.hash(user_data["password"])
        
        # Create user document
        user_doc = {
            "id": str(uuid.uuid4()),
            "email": user_data["email"],
            "username": user_data["username"],
            "password": hashed_password,
            "full_name": user_data["full_name"],
            "role": user_data["role"],
            "department": user_data["department"],
            "team": user_data["team"],
            "points": user_data["points"],
            "level": user_data["points"] // 100 + 1,
            "status": "offline",
            "created_at": datetime.utcnow().isoformat(),
            "last_login": None,
            "profile_picture": None,
            "bio": f"Demo {user_data['role']} account",
            "is_active": True
        }
        
        # Insert user
        users_collection.insert_one(user_doc)
        print(f"✓ Created user: {user_data['email']} (password: {user_data['password']})")
    
    print(f"\n✅ Demo users created successfully!")
    print(f"Total users in database: {users_collection.count_documents({})}")
    
    print("\n" + "="*60)
    print("LOGIN CREDENTIALS")
    print("="*60)
    print("\n🔑 Admin Account:")
    print("   Email: admin@company.com")
    print("   Password: Admin123!")
    print("\n🔑 Manager Account:")
    print("   Email: manager@company.com")
    print("   Password: Manager123!")
    print("\n🔑 Employee Account:")
    print("   Email: test@company.com")
    print("   Password: Test123!")
    print("\n" + "="*60)

if __name__ == "__main__":
    try:
        create_users()
    except Exception as e:
        print(f"❌ Error creating users: {e}")
        sys.exit(1)
