from fastapi import FastAPI, HTTPException, Depends, status, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pymongo import MongoClient
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime, timedelta
from passlib.context import CryptContext
from jose import JWTError, jwt
import os
from dotenv import load_dotenv
import uuid
import socketio
import aiofiles

load_dotenv()

# Configuration
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017/enterprise_comms")
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))
FILE_UPLOAD_DIR = os.getenv("FILE_UPLOAD_DIR", "/app/backend/uploads")

# Create upload directory
os.makedirs(FILE_UPLOAD_DIR, exist_ok=True)

# FastAPI app
app = FastAPI(title="Enterprise Communication & Gamification API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Socket.IO setup
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
socket_app = socketio.ASGIApp(sio, app)

# MongoDB setup
client = MongoClient(MONGO_URL)
db = client.get_database()

# Collections
users_collection = db["users"]
chats_collection = db["chats"]
messages_collection = db["messages"]
points_collection = db["points"]
achievements_collection = db["achievements"]
user_achievements_collection = db["user_achievements"]
challenges_collection = db["challenges"]
rewards_collection = db["rewards"]

# Create indexes
users_collection.create_index("email", unique=True)
users_collection.create_index("username", unique=True)
messages_collection.create_index("chat_id")
messages_collection.create_index("created_at")

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# Pydantic Models
class UserRole(str):
    ADMIN = "admin"
    MANAGER = "manager"
    EMPLOYEE = "employee"
    TEAM_LEAD = "team_lead"
    DEPARTMENT_HEAD = "department_head"

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    full_name: str
    role: str = "employee"
    department: Optional[str] = None
    team: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    full_name: str
    role: str
    department: Optional[str]
    team: Optional[str]
    avatar: Optional[str]
    status: str
    points: int
    level: int

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class ChatCreate(BaseModel):
    name: Optional[str]
    type: str  # "direct" or "group"
    participants: List[str]

class MessageCreate(BaseModel):
    chat_id: str
    content: str
    type: str = "text"  # "text", "file", "image"

class PointTransaction(BaseModel):
    user_id: str
    points: int
    reason: str
    activity_type: str

# Helper functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = users_collection.find_one({"id": user_id})
    if user is None:
        raise credentials_exception
    return user

def calculate_level(points: int) -> int:
    """Calculate user level based on points (100 points per level)"""
    return points // 100 + 1

def award_points(user_id: str, points: int, reason: str, activity_type: str):
    """Award points to user and update level"""
    user = users_collection.find_one({"id": user_id})
    if user:
        new_points = user.get("points", 0) + points
        new_level = calculate_level(new_points)
        
        users_collection.update_one(
            {"id": user_id},
            {"$set": {"points": new_points, "level": new_level}}
        )
        
        # Record transaction
        points_collection.insert_one({
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "points": points,
            "reason": reason,
            "activity_type": activity_type,
            "created_at": datetime.utcnow().isoformat()
        })
        
        return new_points, new_level
    return 0, 1

# API Routes
@app.get("/")
async def root():
    return {"message": "Enterprise Communication & Gamification API", "status": "running"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "database": "connected"}

# Authentication Routes
@app.post("/api/auth/register", response_model=Token)
async def register(user: UserCreate):
    # Check if user exists
    if users_collection.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    if users_collection.find_one({"username": user.username}):
        raise HTTPException(status_code=400, detail="Username already taken")
    
    # Create user
    user_id = str(uuid.uuid4())
    hashed_password = get_password_hash(user.password)
    
    user_doc = {
        "id": user_id,
        "username": user.username,
        "email": user.email,
        "password": hashed_password,
        "full_name": user.full_name,
        "role": user.role,
        "department": user.department,
        "team": user.team,
        "avatar": None,
        "status": "offline",
        "points": 0,
        "level": 1,
        "created_at": datetime.utcnow().isoformat()
    }
    
    users_collection.insert_one(user_doc)
    
    # Award signup points
    award_points(user_id, 50, "Account created", "signup")
    
    # Create token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user_id}, expires_delta=access_token_expires
    )
    
    user_response = UserResponse(
        id=user_id,
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        department=user.department,
        team=user.team,
        avatar=None,
        status="online",
        points=50,
        level=1
    )
    
    return Token(access_token=access_token, token_type="bearer", user=user_response)

@app.post("/api/auth/login", response_model=Token)
async def login(user: UserLogin):
    db_user = users_collection.find_one({"email": user.email})
    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Update status to online
    users_collection.update_one(
        {"id": db_user["id"]},
        {"$set": {"status": "online"}}
    )
    
    # Create token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": db_user["id"]}, expires_delta=access_token_expires
    )
    
    user_response = UserResponse(
        id=db_user["id"],
        username=db_user["username"],
        email=db_user["email"],
        full_name=db_user["full_name"],
        role=db_user["role"],
        department=db_user.get("department"),
        team=db_user.get("team"),
        avatar=db_user.get("avatar"),
        status="online",
        points=db_user.get("points", 0),
        level=db_user.get("level", 1)
    )
    
    return Token(access_token=access_token, token_type="bearer", user=user_response)

@app.get("/api/auth/me", response_model=UserResponse)
async def get_me(current_user = Depends(get_current_user)):
    return UserResponse(
        id=current_user["id"],
        username=current_user["username"],
        email=current_user["email"],
        full_name=current_user["full_name"],
        role=current_user["role"],
        department=current_user.get("department"),
        team=current_user.get("team"),
        avatar=current_user.get("avatar"),
        status=current_user.get("status", "online"),
        points=current_user.get("points", 0),
        level=current_user.get("level", 1)
    )

# User Routes
@app.get("/api/users")
async def get_users(current_user = Depends(get_current_user)):
    users = list(users_collection.find({}, {"password": 0}))
    for user in users:
        user["_id"] = str(user["_id"])
    return users

@app.get("/api/users/{user_id}")
async def get_user(user_id: str, current_user = Depends(get_current_user)):
    user = users_collection.find_one({"id": user_id}, {"password": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user["_id"] = str(user["_id"])
    return user

# Chat Routes
@app.post("/api/chats")
async def create_chat(chat: ChatCreate, current_user = Depends(get_current_user)):
    chat_id = str(uuid.uuid4())
    
    # Ensure current user is in participants
    if current_user["id"] not in chat.participants:
        chat.participants.append(current_user["id"])
    
    chat_doc = {
        "id": chat_id,
        "name": chat.name,
        "type": chat.type,
        "participants": chat.participants,
        "created_by": current_user["id"],
        "created_at": datetime.utcnow().isoformat(),
        "last_message": None,
        "last_message_at": None
    }
    
    chats_collection.insert_one(chat_doc)
    chat_doc["_id"] = str(chat_doc["_id"])
    
    return chat_doc

@app.get("/api/chats")
async def get_chats(current_user = Depends(get_current_user)):
    chats = list(chats_collection.find({"participants": current_user["id"]}))
    for chat in chats:
        chat["_id"] = str(chat["_id"])
        
        # Get participant details
        participants_data = []
        for p_id in chat["participants"]:
            user = users_collection.find_one({"id": p_id}, {"password": 0})
            if user:
                user["_id"] = str(user["_id"])
                participants_data.append(user)
        chat["participants_data"] = participants_data
    
    return chats

@app.get("/api/chats/{chat_id}/messages")
async def get_messages(chat_id: str, current_user = Depends(get_current_user)):
    # Verify user is participant
    chat = chats_collection.find_one({"id": chat_id, "participants": current_user["id"]})
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    messages = list(messages_collection.find({"chat_id": chat_id}).sort("created_at", 1))
    for msg in messages:
        msg["_id"] = str(msg["_id"])
        # Get sender details
        sender = users_collection.find_one({"id": msg["sender_id"]}, {"password": 0})
        if sender:
            sender["_id"] = str(sender["_id"])
            msg["sender"] = sender
    
    return messages

# Gamification Routes
@app.get("/api/leaderboard")
async def get_leaderboard(period: str = "all", current_user = Depends(get_current_user)):
    """Get leaderboard - all time, monthly, weekly"""
    users = list(users_collection.find({}, {"password": 0}).sort("points", -1).limit(100))
    
    leaderboard = []
    for idx, user in enumerate(users, 1):
        user["_id"] = str(user["_id"])
        user["rank"] = idx
        leaderboard.append(user)
    
    return leaderboard

@app.get("/api/achievements")
async def get_achievements(current_user = Depends(get_current_user)):
    """Get all available achievements"""
    achievements = list(achievements_collection.find({}))
    for achievement in achievements:
        achievement["_id"] = str(achievement["_id"])
        
        # Check if user has this achievement
        user_achievement = user_achievements_collection.find_one({
            "user_id": current_user["id"],
            "achievement_id": achievement["id"]
        })
        achievement["unlocked"] = bool(user_achievement)
        if user_achievement:
            achievement["unlocked_at"] = user_achievement.get("unlocked_at")
    
    return achievements

@app.get("/api/my-achievements")
async def get_my_achievements(current_user = Depends(get_current_user)):
    """Get user's unlocked achievements"""
    user_achievements = list(user_achievements_collection.find({"user_id": current_user["id"]}))
    
    result = []
    for ua in user_achievements:
        achievement = achievements_collection.find_one({"id": ua["achievement_id"]})
        if achievement:
            achievement["_id"] = str(achievement["_id"])
            achievement["unlocked_at"] = ua.get("unlocked_at")
            result.append(achievement)
    
    return result

@app.get("/api/challenges")
async def get_challenges(current_user = Depends(get_current_user)):
    """Get active challenges"""
    challenges = list(challenges_collection.find({"active": True}))
    for challenge in challenges:
        challenge["_id"] = str(challenge["_id"])
    return challenges

@app.get("/api/rewards")
async def get_rewards(current_user = Depends(get_current_user)):
    """Get available rewards for redemption"""
    rewards = list(rewards_collection.find({"active": True}))
    for reward in rewards:
        reward["_id"] = str(reward["_id"])
    return rewards

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:socket_app", host="0.0.0.0", port=8001, reload=True)
