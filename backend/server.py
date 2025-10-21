from fastapi import FastAPI, HTTPException, Depends, status, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
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
import mimetypes
import shutil
import requests

load_dotenv()

# Configuration
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017/enterprise_comms")
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))
FILE_UPLOAD_DIR = os.getenv("FILE_UPLOAD_DIR", "/app/backend/uploads")
GIPHY_API_KEY = os.getenv("GIPHY_API_KEY", "")  # Optional GIPHY API key

# File size limits (in bytes)
MAX_FILE_SIZE_IMAGE = 5 * 1024 * 1024  # 5MB
MAX_FILE_SIZE_DOCUMENT = 10 * 1024 * 1024  # 10MB
MAX_FILE_SIZE_VIDEO = 50 * 1024 * 1024  # 50MB

# Allowed file extensions
ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"}
ALLOWED_DOCUMENT_EXTENSIONS = {".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".txt", ".csv"}
ALLOWED_VIDEO_EXTENSIONS = {".mp4", ".mov", ".avi", ".mkv", ".webm"}

# Create upload directories
os.makedirs(FILE_UPLOAD_DIR, exist_ok=True)
os.makedirs(os.path.join(FILE_UPLOAD_DIR, "images"), exist_ok=True)
os.makedirs(os.path.join(FILE_UPLOAD_DIR, "documents"), exist_ok=True)
os.makedirs(os.path.join(FILE_UPLOAD_DIR, "videos"), exist_ok=True)

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
call_history_collection = db["call_history"]
typing_status_collection = db["typing_status"]
announcements_collection = db["announcements"]
recognitions_collection = db["recognitions"]
spaces_collection = db["spaces"]
polls_collection = db["polls"]
poll_responses_collection = db["poll_responses"]
approvals_collection = db["approvals"]
invitations_collection = db["invitations"]
reward_redemptions_collection = db["reward_redemptions"]
files_collection = db["files"]  # New collection for file metadata
integrations_collection = db["integrations"]  # New collection for integration settings

# Create indexes
users_collection.create_index("email", unique=True)
users_collection.create_index("username", unique=True)
messages_collection.create_index("chat_id")
messages_collection.create_index("created_at")
call_history_collection.create_index("participants")
call_history_collection.create_index("created_at")
announcements_collection.create_index("created_at")
announcements_collection.create_index("priority")
recognitions_collection.create_index("created_at")
recognitions_collection.create_index("recognized_user_id")
approvals_collection.create_index("type")
approvals_collection.create_index("status")
approvals_collection.create_index("requester_id")
approvals_collection.create_index("created_at")
invitations_collection.create_index("type")
invitations_collection.create_index("status")
invitations_collection.create_index("invitee_email")
invitations_collection.create_index("token", unique=True, sparse=True)

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

class AnnouncementCreate(BaseModel):
    title: str
    content: str
    priority: str = "normal"  # "urgent", "high", "normal", "low"
    target_audience: str = "all"  # "all", "department", "team", "role"
    target_value: Optional[str] = None  # department name, team name, or role
    expires_at: Optional[str] = None
    requires_acknowledgement: bool = True

class AnnouncementUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    priority: Optional[str] = None
    expires_at: Optional[str] = None

class RecognitionCreate(BaseModel):
    recognized_user_id: str
    category: str  # "teamwork", "innovation", "leadership", "excellence", "helpful"
    message: str
    is_public: bool = True

class SpaceCreate(BaseModel):
    name: str
    description: Optional[str] = None
    type: str = "public"  # "public", "private", "restricted"
    icon: Optional[str] = None

class SpaceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    type: Optional[str] = None
    icon: Optional[str] = None

class SubspaceCreate(BaseModel):
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None

class SubspaceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None

class ChatCreateWithSpace(BaseModel):
    name: Optional[str]
    type: str  # "direct" or "group"
    participants: List[str]
    space_id: Optional[str] = None
    subspace_id: Optional[str] = None

# Approval Models
class ApprovalCreate(BaseModel):
    type: str  # "space_join", "user_registration", "reward_redemption", "content_approval"
    reference_id: str  # ID of the item being approved (space_id, user_id, reward_id, content_id)
    reference_type: str  # "space", "user", "reward", "announcement", "recognition"
    details: Optional[dict] = None
    notes: Optional[str] = None

class ApprovalUpdate(BaseModel):
    status: str  # "approved", "rejected"
    notes: Optional[str] = None

# Invitation Models
class InvitationCreate(BaseModel):
    type: str  # "space", "organization", "event"
    invitee_email: Optional[str] = None
    invitee_user_id: Optional[str] = None
    reference_id: Optional[str] = None  # space_id, event_id, etc.
    message: Optional[str] = None
    expires_at: Optional[str] = None

class InvitationResponse(BaseModel):
    status: str  # "accepted", "rejected"

# Member Management Models
class MemberUpdate(BaseModel):
    role: str  # "admin", "member"

class RewardRedemptionCreate(BaseModel):
    reward_id: str
    quantity: int = 1
    notes: Optional[str] = None

# Poll Models
class PollOption(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    text: str

class PollQuestion(BaseModel):
    question: str
    type: str  # "single_choice", "multiple_choice", "rating", "open_ended"
    options: Optional[List[PollOption]] = None  # For choice-based questions
    rating_scale: Optional[int] = 5  # For rating questions (1-5, 1-10, etc.)
    required: bool = True

class PollCreate(BaseModel):
    title: str
    description: Optional[str] = None
    questions: List[PollQuestion]
    anonymous_voting: bool = False
    show_results_before_close: bool = True  # Admin can choose to hide results until poll closes
    expires_at: Optional[str] = None
    target_audience: str = "all"  # "all", "department", "team", "role"
    target_value: Optional[str] = None

class PollUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    expires_at: Optional[str] = None
    show_results_before_close: Optional[bool] = None

class PollVoteAnswer(BaseModel):
    question_index: int
    answer_type: str  # "single_choice", "multiple_choice", "rating", "text"
    selected_option_ids: Optional[List[str]] = None  # For choice-based answers
    rating_value: Optional[int] = None  # For rating answers
    text_answer: Optional[str] = None  # For open-ended answers

class PollVoteCreate(BaseModel):
    poll_id: str
    answers: List[PollVoteAnswer]
    is_anonymous: bool = False


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
    
    # For now, auto-approve all registrations
    # To enable approval workflow, set account_status to "pending"
    account_status = "active"  # or "pending" for approval workflow
    
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
        "account_status": account_status,  # "active", "pending", "suspended"
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
        
        # Get space and subspace details if they exist
        if chat.get("space_id"):
            space = spaces_collection.find_one({"id": chat["space_id"]}, {"_id": 0, "id": 1, "name": 1, "icon": 1})
            chat["space"] = space
        
        if chat.get("subspace_id"):
            subspace = db["subspaces"].find_one({"id": chat["subspace_id"]}, {"_id": 0, "id": 1, "name": 1, "icon": 1})
            chat["subspace"] = subspace
    
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

# ==================== FILE UPLOAD & SHARING ====================

def get_file_category(filename: str) -> str:
    """Determine file category based on extension"""
    ext = os.path.splitext(filename)[1].lower()
    if ext in ALLOWED_IMAGE_EXTENSIONS:
        return "image"
    elif ext in ALLOWED_DOCUMENT_EXTENSIONS:
        return "document"
    elif ext in ALLOWED_VIDEO_EXTENSIONS:
        return "video"
    return "other"

def get_max_file_size(category: str) -> int:
    """Get maximum file size based on category"""
    if category == "image":
        return MAX_FILE_SIZE_IMAGE
    elif category == "document":
        return MAX_FILE_SIZE_DOCUMENT
    elif category == "video":
        return MAX_FILE_SIZE_VIDEO
    return MAX_FILE_SIZE_DOCUMENT

def validate_file(filename: str, file_size: int) -> tuple:
    """Validate file type and size"""
    ext = os.path.splitext(filename)[1].lower()
    category = get_file_category(filename)
    
    if category == "other":
        return False, "File type not allowed"
    
    max_size = get_max_file_size(category)
    if file_size > max_size:
        max_mb = max_size / (1024 * 1024)
        return False, f"File size exceeds {max_mb}MB limit for {category}s"
    
    return True, category

@app.post("/api/upload/file")
async def upload_file(
    file: UploadFile = File(...),
    chat_id: Optional[str] = None,
    current_user = Depends(get_current_user)
):
    """Upload a file (image, document, or video)"""
    try:
        # Read file content to check size
        contents = await file.read()
        file_size = len(contents)
        
        # Validate file
        is_valid, result = validate_file(file.filename, file_size)
        if not is_valid:
            raise HTTPException(status_code=400, detail=result)
        
        category = result
        
        # Generate unique filename
        file_id = str(uuid.uuid4())
        file_ext = os.path.splitext(file.filename)[1]
        unique_filename = f"{file_id}{file_ext}"
        
        # Determine subdirectory based on category
        if category == "image":
            subdir = "images"
        elif category == "document":
            subdir = "documents"
        else:
            subdir = "videos"
        
        file_path = os.path.join(FILE_UPLOAD_DIR, subdir, unique_filename)
        
        # Save file
        async with aiofiles.open(file_path, 'wb') as f:
            await f.write(contents)
        
        # Store file metadata
        file_doc = {
            "id": file_id,
            "filename": file.filename,
            "unique_filename": unique_filename,
            "category": category,
            "size": file_size,
            "mime_type": file.content_type,
            "path": f"/{subdir}/{unique_filename}",
            "url": f"/api/files/{file_id}",
            "uploaded_by": current_user["id"],
            "chat_id": chat_id,
            "created_at": datetime.utcnow().isoformat()
        }
        
        files_collection.insert_one(file_doc)
        file_doc["_id"] = str(file_doc["_id"])
        
        # Award points for file upload
        award_points(current_user["id"], 10, "File uploaded", "file_upload")
        
        return {
            "success": True,
            "file": {
                "id": file_id,
                "filename": file.filename,
                "category": category,
                "size": file_size,
                "url": f"/api/files/{file_id}",
                "mime_type": file.content_type
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")

@app.post("/api/upload/files")
async def upload_multiple_files(
    files: List[UploadFile] = File(...),
    chat_id: Optional[str] = None,
    current_user = Depends(get_current_user)
):
    """Upload multiple files at once"""
    if len(files) > 10:
        raise HTTPException(status_code=400, detail="Maximum 10 files per upload")
    
    uploaded_files = []
    errors = []
    
    for file in files:
        try:
            # Read file content
            contents = await file.read()
            file_size = len(contents)
            
            # Validate file
            is_valid, result = validate_file(file.filename, file_size)
            if not is_valid:
                errors.append({"filename": file.filename, "error": result})
                continue
            
            category = result
            
            # Generate unique filename
            file_id = str(uuid.uuid4())
            file_ext = os.path.splitext(file.filename)[1]
            unique_filename = f"{file_id}{file_ext}"
            
            # Determine subdirectory
            if category == "image":
                subdir = "images"
            elif category == "document":
                subdir = "documents"
            else:
                subdir = "videos"
            
            file_path = os.path.join(FILE_UPLOAD_DIR, subdir, unique_filename)
            
            # Save file
            async with aiofiles.open(file_path, 'wb') as f:
                await f.write(contents)
            
            # Store metadata
            file_doc = {
                "id": file_id,
                "filename": file.filename,
                "unique_filename": unique_filename,
                "category": category,
                "size": file_size,
                "mime_type": file.content_type,
                "path": f"/{subdir}/{unique_filename}",
                "url": f"/api/files/{file_id}",
                "uploaded_by": current_user["id"],
                "chat_id": chat_id,
                "created_at": datetime.utcnow().isoformat()
            }
            
            files_collection.insert_one(file_doc)
            
            uploaded_files.append({
                "id": file_id,
                "filename": file.filename,
                "category": category,
                "size": file_size,
                "url": f"/api/files/{file_id}",
                "mime_type": file.content_type
            })
            
        except Exception as e:
            errors.append({"filename": file.filename, "error": str(e)})
    
    # Award points for successful uploads
    if uploaded_files:
        points = min(len(uploaded_files) * 10, 50)  # Max 50 points per batch
        award_points(current_user["id"], points, f"Uploaded {len(uploaded_files)} files", "file_upload")
    
    return {
        "success": True,
        "uploaded": len(uploaded_files),
        "failed": len(errors),
        "files": uploaded_files,
        "errors": errors
    }

@app.get("/api/files/{file_id}")
async def get_file(file_id: str):
    """Serve an uploaded file"""
    file_doc = files_collection.find_one({"id": file_id})
    if not file_doc:
        raise HTTPException(status_code=404, detail="File not found")
    
    file_path = os.path.join(FILE_UPLOAD_DIR, file_doc["path"].lstrip("/"))
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found on disk")
    
    return FileResponse(
        file_path,
        media_type=file_doc.get("mime_type", "application/octet-stream"),
        filename=file_doc["filename"]
    )

@app.delete("/api/files/{file_id}")
async def delete_file(file_id: str, current_user = Depends(get_current_user)):
    """Delete an uploaded file"""
    file_doc = files_collection.find_one({"id": file_id})
    if not file_doc:
        raise HTTPException(status_code=404, detail="File not found")
    
    # Check permissions
    if file_doc["uploaded_by"] != current_user["id"] and current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete this file")
    
    # Delete file from disk
    file_path = os.path.join(FILE_UPLOAD_DIR, file_doc["path"].lstrip("/"))
    if os.path.exists(file_path):
        os.remove(file_path)
    
    # Delete metadata
    files_collection.delete_one({"id": file_id})
    
    return {"success": True, "message": "File deleted"}

# ==================== GIPHY INTEGRATION ====================

def get_giphy_api_key():
    """Get GIPHY API key from database or environment"""
    # Try to get from database first
    integration = integrations_collection.find_one({"name": "giphy"})
    if integration and integration.get("api_key"):
        return integration["api_key"]
    # Fallback to environment variable
    return GIPHY_API_KEY

@app.get("/api/giphy/search")
async def search_giphy(q: str, limit: int = 20, offset: int = 0, current_user = Depends(get_current_user)):
    """Search GIFs on GIPHY"""
    api_key = get_giphy_api_key()
    if not api_key:
        raise HTTPException(status_code=503, detail="GIPHY API key not configured")
    
    try:
        url = "https://api.giphy.com/v1/gifs/search"
        params = {
            "api_key": api_key,
            "q": q,
            "limit": limit,
            "offset": offset,
            "rating": "g",  # Family-friendly content
            "lang": "en"
        }
        
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        
        # Format response
        gifs = []
        for item in data.get("data", []):
            gifs.append({
                "id": item["id"],
                "title": item.get("title", ""),
                "url": item["images"]["fixed_height"]["url"],
                "preview_url": item["images"]["fixed_height_small"]["url"],
                "width": item["images"]["fixed_height"]["width"],
                "height": item["images"]["fixed_height"]["height"]
            })
        
        return {
            "success": True,
            "gifs": gifs,
            "pagination": {
                "total_count": data.get("pagination", {}).get("total_count", 0),
                "count": data.get("pagination", {}).get("count", 0),
                "offset": offset
            }
        }
        
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"GIPHY API error: {str(e)}")

@app.get("/api/giphy/trending")
async def trending_giphy(limit: int = 20, offset: int = 0, current_user = Depends(get_current_user)):
    """Get trending GIFs from GIPHY"""
    api_key = get_giphy_api_key()
    if not api_key:
        raise HTTPException(status_code=503, detail="GIPHY API key not configured")
    
    try:
        url = "https://api.giphy.com/v1/gifs/trending"
        params = {
            "api_key": api_key,
            "limit": limit,
            "offset": offset,
            "rating": "g"
        }
        
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        
        # Format response
        gifs = []
        for item in data.get("data", []):
            gifs.append({
                "id": item["id"],
                "title": item.get("title", ""),
                "url": item["images"]["fixed_height"]["url"],
                "preview_url": item["images"]["fixed_height_small"]["url"],
                "width": item["images"]["fixed_height"]["width"],
                "height": item["images"]["fixed_height"]["height"]
            })
        
        return {
            "success": True,
            "gifs": gifs,
            "pagination": {
                "total_count": data.get("pagination", {}).get("total_count", 0),
                "count": data.get("pagination", {}).get("count", 0),
                "offset": offset
            }
        }
        
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"GIPHY API error: {str(e)}")

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

@app.post("/api/generate-demo-data")
async def generate_demo_data():
    """Generate comprehensive demo data for testing the system"""
    try:
        import random
        from datetime import timedelta
        
        stats = {
            "users": 0,
            "chats": 0,
            "messages": 0,
            "achievements": 0,
            "challenges": 0,
            "rewards": 0,
            "points_awarded": 0
        }
        
        # Clean up old demo data for fresh start
        # Only delete demo accounts, not all data
        demo_emails = [
            "test@company.com",
            "admin@company.com", 
            "manager@company.com",
            "sarah.johnson@company.com",
            "mike.chen@company.com",
            "emma.davis@company.com",
            "james.wilson@company.com",
            "lisa.brown@company.com"
        ]
        
        # Delete old demo users and their related data
        for email in demo_emails:
            user = users_collection.find_one({"email": email})
            if user:
                user_id = user["id"]
                messages_collection.delete_many({"sender_id": user_id})
                points_collection.delete_many({"user_id": user_id})
                user_achievements_collection.delete_many({"user_id": user_id})
                users_collection.delete_one({"email": email})
        
        # Sample data
        departments = ["Engineering", "Marketing", "Sales", "HR", "Operations", "Design", "Finance"]
        teams = ["Alpha", "Beta", "Gamma", "Delta", "Omega"]
        
        # Create demo users matching the login form autofill credentials
        demo_users = [
            {
                "username": "test_employee",
                "email": "test@company.com",
                "password": "Test123!",
                "full_name": "Test Employee",
                "role": "employee",
                "department": "Engineering",
                "team": "Alpha"
            },
            {
                "username": "admin_user",
                "email": "admin@company.com",
                "password": "Admin123!",
                "full_name": "Admin User",
                "role": "admin",
                "department": "Administration",
                "team": "Executive"
            },
            {
                "username": "manager_user",
                "email": "manager@company.com",
                "password": "Manager123!",
                "full_name": "Manager User",
                "role": "manager",
                "department": "Operations",
                "team": "Management"
            },
            {
                "username": "sarah_johnson",
                "email": "sarah.johnson@company.com",
                "password": "Demo123!",
                "full_name": "Sarah Johnson",
                "role": "team_lead",
                "department": "Engineering",
                "team": "Alpha"
            },
            {
                "username": "mike_chen",
                "email": "mike.chen@company.com",
                "password": "Demo123!",
                "full_name": "Mike Chen",
                "role": "employee",
                "department": "Marketing",
                "team": "Beta"
            },
            {
                "username": "emma_davis",
                "email": "emma.davis@company.com",
                "password": "Demo123!",
                "full_name": "Emma Davis",
                "role": "department_head",
                "department": "Sales",
                "team": "Gamma"
            },
            {
                "username": "james_wilson",
                "email": "james.wilson@company.com",
                "password": "Demo123!",
                "full_name": "James Wilson",
                "role": "employee",
                "department": "Design",
                "team": "Delta"
            },
            {
                "username": "lisa_brown",
                "email": "lisa.brown@company.com",
                "password": "Demo123!",
                "full_name": "Lisa Brown",
                "role": "manager",
                "department": "Operations",
                "team": "Omega"
            }
        ]
        
        created_user_ids = []
        
        # Create fresh demo users
        for user_data in demo_users:
            user_id = str(uuid.uuid4())
            hashed_password = get_password_hash(user_data["password"])
            
            user_doc = {
                "id": user_id,
                "username": user_data["username"],
                "email": user_data["email"],
                "password": hashed_password,
                "full_name": user_data["full_name"],
                "role": user_data["role"],
                "department": user_data["department"],
                "team": user_data["team"],
                "avatar": None,
                "status": "online" if random.random() > 0.3 else "offline",
                "points": random.randint(50, 500),
                "level": random.randint(1, 5),
                "created_at": datetime.utcnow().isoformat()
            }
            
            users_collection.insert_one(user_doc)
            created_user_ids.append(user_id)
            stats["users"] += 1
        
        # Get all user IDs for creating chats
        all_users = list(users_collection.find({}, {"id": 1}))
        all_user_ids = [u["id"] for u in all_users]
        
        # Create group chats
        group_chats_data = [
            {
                "name": "Engineering Team",
                "type": "group",
                "participants": random.sample(all_user_ids, min(5, len(all_user_ids)))
            },
            {
                "name": "Project Alpha",
                "type": "group",
                "participants": random.sample(all_user_ids, min(4, len(all_user_ids)))
            },
            {
                "name": "Marketing Campaign",
                "type": "group",
                "participants": random.sample(all_user_ids, min(3, len(all_user_ids)))
            }
        ]
        
        created_chat_ids = []
        
        for chat_data in group_chats_data:
            chat_id = str(uuid.uuid4())
            chat_doc = {
                "id": chat_id,
                "name": chat_data["name"],
                "type": chat_data["type"],
                "participants": chat_data["participants"],
                "created_by": chat_data["participants"][0] if chat_data["participants"] else all_user_ids[0],
                "created_at": datetime.utcnow().isoformat(),
                "last_message": None,
                "last_message_at": None
            }
            
            chats_collection.insert_one(chat_doc)
            created_chat_ids.append(chat_id)
            stats["chats"] += 1
        
        # Create messages in chats
        sample_messages = [
            "Hey team, how's everyone doing?",
            "Great work on the project!",
            "Can we schedule a meeting for tomorrow?",
            "I've uploaded the latest design files.",
            "Thanks for the feedback!",
            "Let's discuss this in our next standup.",
            "The new feature looks amazing!",
            "I'll review the PR today.",
            "Anyone free for a quick call?",
            "Just pushed the latest changes."
        ]
        
        for chat_id in created_chat_ids:
            chat = chats_collection.find_one({"id": chat_id})
            if chat and chat["participants"]:
                num_messages = random.randint(5, 15)
                for i in range(num_messages):
                    sender_id = random.choice(chat["participants"])
                    message_doc = {
                        "id": str(uuid.uuid4()),
                        "chat_id": chat_id,
                        "sender_id": sender_id,
                        "content": random.choice(sample_messages),
                        "type": "text",
                        "created_at": (datetime.utcnow() - timedelta(hours=random.randint(1, 48))).isoformat()
                    }
                    messages_collection.insert_one(message_doc)
                    stats["messages"] += 1
        
        # Create achievements
        achievements_data = [
            {
                "id": str(uuid.uuid4()),
                "name": "First Steps",
                "description": "Complete your first task",
                "icon": "🎯",
                "points": 10,
                "type": "milestone"
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Team Player",
                "description": "Send 50 messages in team chats",
                "icon": "🤝",
                "points": 50,
                "type": "social"
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Rising Star",
                "description": "Reach level 5",
                "icon": "⭐",
                "points": 100,
                "type": "milestone"
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Communicator",
                "description": "Send 100 messages",
                "icon": "💬",
                "points": 75,
                "type": "social"
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Early Bird",
                "description": "Login before 8 AM for 5 days",
                "icon": "🌅",
                "points": 25,
                "type": "activity"
            }
        ]
        
        for achievement in achievements_data:
            # Delete any existing achievement with same name
            achievements_collection.delete_one({"name": achievement["name"]})
            
            achievements_collection.insert_one(achievement)
            stats["achievements"] += 1
            
            # Award some achievements to random users
            if random.random() > 0.5:
                lucky_users = random.sample(all_user_ids, min(3, len(all_user_ids)))
                for user_id in lucky_users:
                    user_achievement = {
                        "id": str(uuid.uuid4()),
                        "user_id": user_id,
                        "achievement_id": achievement["id"],
                        "unlocked_at": datetime.utcnow().isoformat()
                    }
                    user_achievements_collection.insert_one(user_achievement)
                    
                    # Award points
                    award_points(user_id, achievement["points"], f"Achievement unlocked: {achievement['name']}", "achievement")
                    stats["points_awarded"] += achievement["points"]
        
        # Create challenges
        challenges_data = [
            {
                "id": str(uuid.uuid4()),
                "name": "Weekly Communication Sprint",
                "description": "Send 25 messages this week",
                "points": 100,
                "target": 25,
                "type": "messages",
                "active": True,
                "start_date": datetime.utcnow().isoformat(),
                "end_date": (datetime.utcnow() + timedelta(days=7)).isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Collaboration Champion",
                "description": "Participate in 5 group chats",
                "points": 150,
                "target": 5,
                "type": "participation",
                "active": True,
                "start_date": datetime.utcnow().isoformat(),
                "end_date": (datetime.utcnow() + timedelta(days=14)).isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Daily Engager",
                "description": "Login for 7 consecutive days",
                "points": 200,
                "target": 7,
                "type": "attendance",
                "active": True,
                "start_date": datetime.utcnow().isoformat(),
                "end_date": (datetime.utcnow() + timedelta(days=30)).isoformat()
            }
        ]
        
        for challenge in challenges_data:
            # Delete any existing challenge with same name
            challenges_collection.delete_one({"name": challenge["name"]})
            
            challenges_collection.insert_one(challenge)
            stats["challenges"] += 1
        
        # Create rewards
        rewards_data = [
            {
                "id": str(uuid.uuid4()),
                "name": "Premium Coffee",
                "description": "Get a free premium coffee from the cafeteria",
                "cost": 50,
                "icon": "☕",
                "category": "food",
                "active": True,
                "stock": 100
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Extra Day Off",
                "description": "Redeem for an additional vacation day",
                "cost": 500,
                "icon": "🏖️",
                "category": "time-off",
                "active": True,
                "stock": 10
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Parking Spot",
                "description": "Reserved parking spot for a month",
                "cost": 200,
                "icon": "🚗",
                "category": "perks",
                "active": True,
                "stock": 5
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Team Lunch",
                "description": "Lunch with your team at a restaurant of choice",
                "cost": 300,
                "icon": "🍽️",
                "category": "food",
                "active": True,
                "stock": 20
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Tech Gadget Voucher",
                "description": "$100 voucher for tech accessories",
                "cost": 400,
                "icon": "🎧",
                "category": "merchandise",
                "active": True,
                "stock": 15
            }
        ]
        
        for reward in rewards_data:
            # Delete any existing reward with same name
            rewards_collection.delete_one({"name": reward["name"]})
            
            rewards_collection.insert_one(reward)
            stats["rewards"] += 1
        
        return {
            "success": True,
            "message": "Demo data generated successfully!",
            "stats": stats
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating demo data: {str(e)}")

# Admin Routes
@app.get("/api/admin/users")
async def admin_get_users(current_user = Depends(get_current_user)):
    """Get all users with detailed stats"""
    users = list(users_collection.find({}, {"password": 0}).sort("created_at", -1))
    for user in users:
        user["_id"] = str(user["_id"])
        # Get message count
        message_count = messages_collection.count_documents({"sender_id": user["id"]})
        user["message_count"] = message_count
        # Get achievement count
        achievement_count = user_achievements_collection.count_documents({"user_id": user["id"]})
        user["achievement_count"] = achievement_count
    return users

@app.put("/api/admin/users/{user_id}")
async def admin_update_user(user_id: str, updates: dict, current_user = Depends(get_current_user)):
    """Update user details"""
    allowed_fields = ["full_name", "email", "role", "department", "team", "status", "points", "level"]
    update_data = {k: v for k, v in updates.items() if k in allowed_fields}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No valid fields to update")
    
    result = users_collection.update_one({"id": user_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    user = users_collection.find_one({"id": user_id}, {"password": 0})
    user["_id"] = str(user["_id"])
    return user

@app.delete("/api/admin/users/{user_id}")
async def admin_delete_user(user_id: str, current_user = Depends(get_current_user)):
    """Delete a user"""
    result = users_collection.delete_one({"id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"success": True, "message": "User deleted"}

@app.get("/api/admin/analytics")
async def admin_analytics(current_user = Depends(get_current_user)):
    """Get system analytics"""
    total_users = users_collection.count_documents({})
    total_messages = messages_collection.count_documents({})
    total_chats = chats_collection.count_documents({})
    total_points = sum([u.get("points", 0) for u in users_collection.find({}, {"points": 1})])
    
    # Online users
    online_users = users_collection.count_documents({"status": "online"})
    
    # Recent activity (messages in last 24 hours)
    from datetime import datetime, timedelta
    yesterday = (datetime.utcnow() - timedelta(days=1)).isoformat()
    recent_messages = messages_collection.count_documents({"created_at": {"$gte": yesterday}})
    
    # Top users by points
    top_users = list(users_collection.find({}, {"_id": 1, "id": 1, "full_name": 1, "points": 1, "email": 1}).sort("points", -1).limit(5))
    for user in top_users:
        user["_id"] = str(user["_id"])
    
    return {
        "total_users": total_users,
        "total_messages": total_messages,
        "total_chats": total_chats,
        "total_points": total_points,
        "online_users": online_users,
        "recent_messages_24h": recent_messages,
        "top_users": top_users
    }

# Admin Integration Settings Routes
@app.get("/api/admin/integrations")
async def get_integrations(current_user = Depends(get_current_user)):
    """Get all integration settings (admin only)"""
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Get all integrations from database
    integrations = list(integrations_collection.find({}))
    
    # If no integrations exist, initialize with defaults
    if not integrations:
        default_integrations = [
            {
                "id": str(uuid.uuid4()),
                "name": "giphy",
                "display_name": "GIPHY API",
                "description": "GIF search and trending functionality",
                "api_key": GIPHY_API_KEY or "",
                "enabled": bool(GIPHY_API_KEY),
                "updated_at": datetime.utcnow().isoformat()
            }
        ]
        
        for integration in default_integrations:
            integrations_collection.insert_one(integration)
        
        integrations = default_integrations
    
    # Format response (hide partial API keys for security)
    for integration in integrations:
        integration["_id"] = str(integration["_id"])
        # Mask API key (show only first 8 and last 4 characters)
        if integration.get("api_key"):
            key = integration["api_key"]
            if len(key) > 12:
                integration["api_key_masked"] = f"{key[:8]}...{key[-4:]}"
            else:
                integration["api_key_masked"] = "***"
    
    return integrations

@app.put("/api/admin/integrations/{integration_name}")
async def update_integration(
    integration_name: str,
    update_data: dict,
    current_user = Depends(get_current_user)
):
    """Update integration settings (admin only)"""
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Find integration
    integration = integrations_collection.find_one({"name": integration_name})
    
    if not integration:
        # Create new integration
        integration_id = str(uuid.uuid4())
        integration_doc = {
            "id": integration_id,
            "name": integration_name,
            "display_name": update_data.get("display_name", integration_name.upper()),
            "description": update_data.get("description", ""),
            "api_key": update_data.get("api_key", ""),
            "enabled": update_data.get("enabled", True),
            "updated_at": datetime.utcnow().isoformat(),
            "updated_by": current_user["id"]
        }
        integrations_collection.insert_one(integration_doc)
        integration_doc["_id"] = str(integration_doc["_id"])
        return integration_doc
    
    # Update existing integration
    update_fields = {}
    if "api_key" in update_data:
        update_fields["api_key"] = update_data["api_key"]
    if "enabled" in update_data:
        update_fields["enabled"] = update_data["enabled"]
    if "description" in update_data:
        update_fields["description"] = update_data["description"]
    
    update_fields["updated_at"] = datetime.utcnow().isoformat()
    update_fields["updated_by"] = current_user["id"]
    
    integrations_collection.update_one(
        {"name": integration_name},
        {"$set": update_fields}
    )
    
    updated = integrations_collection.find_one({"name": integration_name})
    updated["_id"] = str(updated["_id"])
    
    return updated

# Call History Routes
@app.get("/api/calls/history")
async def get_call_history(current_user = Depends(get_current_user)):
    """Get user's call history"""
    calls = list(call_history_collection.find(
        {"participants": current_user["id"]}
    ).sort("created_at", -1).limit(50))
    
    for call in calls:
        call["_id"] = str(call["_id"])
        # Get participant details
        participants_data = []
        for p_id in call.get("participants", []):
            user = users_collection.find_one({"id": p_id}, {"_id": 1, "id": 1, "full_name": 1, "avatar": 1, "email": 1})
            if user:
                user["_id"] = str(user["_id"])
                participants_data.append(user)
        call["participants_data"] = participants_data
    
    return calls

@app.post("/api/calls/history")
async def create_call_history(call_data: dict, current_user = Depends(get_current_user)):
    """Create a call history record"""
    call_id = str(uuid.uuid4())
    call_doc = {
        "id": call_id,
        "type": call_data.get("type", "video"),  # video or voice
        "participants": call_data.get("participants", []),
        "duration": call_data.get("duration", 0),
        "initiated_by": current_user["id"],
        "status": call_data.get("status", "completed"),  # completed, missed, rejected
        "created_at": datetime.utcnow().isoformat()
    }
    
    call_history_collection.insert_one(call_doc)
    call_doc["_id"] = str(call_doc["_id"])
    
    # Award points for video call
    if call_data.get("status") == "completed":
        award_points(current_user["id"], 20, "Video call attended", "call")
    
    return call_doc

# Message read receipts
@app.post("/api/messages/{message_id}/read")
async def mark_message_read(message_id: str, current_user = Depends(get_current_user)):
    """Mark message as read"""
    message = messages_collection.find_one({"id": message_id})
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    
    # Update read_by array
    messages_collection.update_one(
        {"id": message_id},
        {"$addToSet": {"read_by": {"user_id": current_user["id"], "read_at": datetime.utcnow().isoformat()}}}
    )
    
    return {"success": True}

@app.get("/api/users/{user_id}/status")
async def get_user_status(user_id: str, current_user = Depends(get_current_user)):
    """Get user's online status"""
    user = users_collection.find_one({"id": user_id}, {"status": 1, "last_seen": 1})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"status": user.get("status", "offline"), "last_seen": user.get("last_seen")}

@app.post("/api/users/status")
async def update_user_status(status_data: dict, current_user = Depends(get_current_user)):
    """Update user's online status"""
    status = status_data.get("status", "online")  # online, away, offline
    users_collection.update_one(
        {"id": current_user["id"]},
        {"$set": {"status": status, "last_seen": datetime.utcnow().isoformat()}}
    )
    return {"success": True, "status": status}


# ==================== SMART FEED SYSTEM ====================

@app.post("/api/announcements")
async def create_announcement(announcement: AnnouncementCreate, current_user = Depends(get_current_user)):
    """Create a new announcement (admin/manager only)"""
    # Check permissions
    if current_user["role"] not in ["admin", "manager", "department_head", "team_lead"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    announcement_id = str(uuid.uuid4())
    announcement_doc = {
        "id": announcement_id,
        "title": announcement.title,
        "content": announcement.content,
        "priority": announcement.priority,
        "target_audience": announcement.target_audience,
        "target_value": announcement.target_value,
        "requires_acknowledgement": announcement.requires_acknowledgement,
        "expires_at": announcement.expires_at,
        "created_by": current_user["id"],
        "created_at": datetime.utcnow().isoformat(),
        "acknowledged_by": [],
        "view_count": 0
    }
    
    announcements_collection.insert_one(announcement_doc)
    announcement_doc["_id"] = str(announcement_doc["_id"])
    
    # Get creator details
    creator = users_collection.find_one({"id": current_user["id"]}, {"_id": 1, "id": 1, "full_name": 1, "avatar": 1, "role": 1})
    if creator:
        creator["_id"] = str(creator["_id"])
        announcement_doc["created_by_user"] = creator
    
    # Broadcast new announcement via Socket.IO
    await sio.emit("new_announcement", announcement_doc)
    
    # Award points for creating announcement
    award_points(current_user["id"], 10, "Created announcement", "announcement")
    
    return announcement_doc

@app.get("/api/announcements")
async def get_announcements(
    current_user = Depends(get_current_user),
    priority: Optional[str] = None,
    show_expired: bool = False
):
    """Get announcements visible to current user"""
    query = {}
    
    # Filter by target audience
    or_conditions = [
        {"target_audience": "all"},
        {"target_audience": "department", "target_value": current_user.get("department")},
        {"target_audience": "team", "target_value": current_user.get("team")},
        {"target_audience": "role", "target_value": current_user.get("role")}
    ]
    query["$or"] = or_conditions
    
    # Filter by priority if specified
    if priority:
        query["priority"] = priority
    
    # Filter expired announcements
    if not show_expired:
        current_time = datetime.utcnow().isoformat()
        query["$or"] = [
            {"expires_at": None},
            {"expires_at": {"$gte": current_time}}
        ]
    
    announcements = list(announcements_collection.find(query).sort("created_at", -1).limit(100))
    
    for announcement in announcements:
        announcement["_id"] = str(announcement["_id"])
        
        # Get creator details
        creator = users_collection.find_one({"id": announcement["created_by"]}, {"_id": 1, "id": 1, "full_name": 1, "avatar": 1, "role": 1})
        if creator:
            creator["_id"] = str(creator["_id"])
            announcement["created_by_user"] = creator
        
        # Check if current user has acknowledged
        announcement["acknowledged"] = current_user["id"] in announcement.get("acknowledged_by", [])
        announcement["acknowledgement_count"] = len(announcement.get("acknowledged_by", []))
    
    return announcements

@app.get("/api/announcements/{announcement_id}")
async def get_announcement(announcement_id: str, current_user = Depends(get_current_user)):
    """Get a specific announcement"""
    announcement = announcements_collection.find_one({"id": announcement_id})
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")
    
    announcement["_id"] = str(announcement["_id"])
    
    # Increment view count
    announcements_collection.update_one(
        {"id": announcement_id},
        {"$inc": {"view_count": 1}}
    )
    
    # Get creator details
    creator = users_collection.find_one({"id": announcement["created_by"]}, {"_id": 1, "id": 1, "full_name": 1, "avatar": 1, "role": 1})
    if creator:
        creator["_id"] = str(creator["_id"])
        announcement["created_by_user"] = creator
    
    # Check if current user has acknowledged
    announcement["acknowledged"] = current_user["id"] in announcement.get("acknowledged_by", [])
    announcement["acknowledgement_count"] = len(announcement.get("acknowledged_by", []))
    
    return announcement

@app.put("/api/announcements/{announcement_id}")
async def update_announcement(
    announcement_id: str,
    update_data: AnnouncementUpdate,
    current_user = Depends(get_current_user)
):
    """Update an announcement (creator or admin only)"""
    announcement = announcements_collection.find_one({"id": announcement_id})
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")
    
    # Check permissions
    if announcement["created_by"] != current_user["id"] and current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to update this announcement")
    
    update_fields = {k: v for k, v in update_data.dict().items() if v is not None}
    
    if update_fields:
        announcements_collection.update_one(
            {"id": announcement_id},
            {"$set": update_fields}
        )
    
    updated = announcements_collection.find_one({"id": announcement_id})
    updated["_id"] = str(updated["_id"])
    
    return updated

@app.delete("/api/announcements/{announcement_id}")
async def delete_announcement(announcement_id: str, current_user = Depends(get_current_user)):
    """Delete an announcement (creator or admin only)"""
    announcement = announcements_collection.find_one({"id": announcement_id})
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")
    
    # Check permissions
    if announcement["created_by"] != current_user["id"] and current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete this announcement")
    
    announcements_collection.delete_one({"id": announcement_id})
    return {"success": True, "message": "Announcement deleted"}

@app.post("/api/announcements/{announcement_id}/acknowledge")
async def acknowledge_announcement(announcement_id: str, current_user = Depends(get_current_user)):
    """Acknowledge an announcement"""
    announcement = announcements_collection.find_one({"id": announcement_id})
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")
    
    # Check if already acknowledged
    if current_user["id"] in announcement.get("acknowledged_by", []):
        return {"success": True, "message": "Already acknowledged"}
    
    # Add user to acknowledged_by list
    announcements_collection.update_one(
        {"id": announcement_id},
        {"$addToSet": {"acknowledged_by": current_user["id"]}}
    )
    
    # Award points for acknowledging
    award_points(current_user["id"], 2, "Acknowledged announcement", "acknowledgement")
    
    # Broadcast acknowledgement via Socket.IO
    await sio.emit("announcement_acknowledged", {
        "announcement_id": announcement_id,
        "user_id": current_user["id"],
        "acknowledgement_count": len(announcement.get("acknowledged_by", [])) + 1
    })
    
    return {"success": True, "message": "Announcement acknowledged", "points_awarded": 2}

@app.get("/api/announcements/{announcement_id}/acknowledgements")
async def get_announcement_acknowledgements(announcement_id: str, current_user = Depends(get_current_user)):
    """Get list of users who acknowledged an announcement"""
    announcement = announcements_collection.find_one({"id": announcement_id})
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")
    
    acknowledged_users = []
    for user_id in announcement.get("acknowledged_by", []):
        user = users_collection.find_one({"id": user_id}, {"_id": 1, "id": 1, "full_name": 1, "avatar": 1, "department": 1, "role": 1})
        if user:
            user["_id"] = str(user["_id"])
            acknowledged_users.append(user)
    
    return {
        "total_count": len(acknowledged_users),
        "users": acknowledged_users
    }

# ==================== RECOGNITION POSTS ====================

@app.post("/api/recognitions")
async def create_recognition(recognition: RecognitionCreate, current_user = Depends(get_current_user)):
    """Create a recognition post"""
    # Verify recognized user exists
    recognized_user = users_collection.find_one({"id": recognition.recognized_user_id})
    if not recognized_user:
        raise HTTPException(status_code=404, detail="Recognized user not found")
    
    recognition_id = str(uuid.uuid4())
    recognition_doc = {
        "id": recognition_id,
        "recognized_user_id": recognition.recognized_user_id,
        "recognizer_id": current_user["id"],
        "category": recognition.category,
        "message": recognition.message,
        "is_public": recognition.is_public,
        "likes": [],
        "comments": [],
        "created_at": datetime.utcnow().isoformat()
    }
    
    recognitions_collection.insert_one(recognition_doc)
    recognition_doc["_id"] = str(recognition_doc["_id"])
    
    # Get user details
    recognizer = users_collection.find_one({"id": current_user["id"]}, {"_id": 1, "id": 1, "full_name": 1, "avatar": 1, "role": 1})
    recognized = users_collection.find_one({"id": recognition.recognized_user_id}, {"_id": 1, "id": 1, "full_name": 1, "avatar": 1, "role": 1})
    
    if recognizer:
        recognizer["_id"] = str(recognizer["_id"])
        recognition_doc["recognizer"] = recognizer
    
    if recognized:
        recognized["_id"] = str(recognized["_id"])
        recognition_doc["recognized_user"] = recognized
    
    # Award points
    award_points(recognition.recognized_user_id, 15, f"Recognized for {recognition.category}", "recognition_received")
    award_points(current_user["id"], 5, f"Recognized {recognized_user['full_name']}", "recognition_given")
    
    # Broadcast new recognition via Socket.IO
    await sio.emit("new_recognition", recognition_doc)
    
    return recognition_doc

@app.get("/api/recognitions")
async def get_recognitions(
    current_user = Depends(get_current_user),
    category: Optional[str] = None,
    user_id: Optional[str] = None
):
    """Get recognition posts"""
    query = {"is_public": True}
    
    if category:
        query["category"] = category
    
    if user_id:
        query["$or"] = [
            {"recognized_user_id": user_id},
            {"recognizer_id": user_id}
        ]
    
    recognitions = list(recognitions_collection.find(query).sort("created_at", -1).limit(100))
    
    for recognition in recognitions:
        recognition["_id"] = str(recognition["_id"])
        
        # Get user details
        recognizer = users_collection.find_one({"id": recognition["recognizer_id"]}, {"_id": 1, "id": 1, "full_name": 1, "avatar": 1, "role": 1})
        recognized = users_collection.find_one({"id": recognition["recognized_user_id"]}, {"_id": 1, "id": 1, "full_name": 1, "avatar": 1, "role": 1})
        
        if recognizer:
            recognizer["_id"] = str(recognizer["_id"])
            recognition["recognizer"] = recognizer
        
        if recognized:
            recognized["_id"] = str(recognized["_id"])
            recognition["recognized_user"] = recognized
        
        recognition["like_count"] = len(recognition.get("likes", []))
        recognition["comment_count"] = len(recognition.get("comments", []))
        recognition["liked_by_me"] = current_user["id"] in recognition.get("likes", [])
    
    return recognitions

@app.post("/api/recognitions/{recognition_id}/like")
async def like_recognition(recognition_id: str, current_user = Depends(get_current_user)):
    """Like a recognition post"""
    recognition = recognitions_collection.find_one({"id": recognition_id})
    if not recognition:
        raise HTTPException(status_code=404, detail="Recognition not found")
    
    # Toggle like
    if current_user["id"] in recognition.get("likes", []):
        # Unlike
        recognitions_collection.update_one(
            {"id": recognition_id},
            {"$pull": {"likes": current_user["id"]}}
        )
        liked = False
    else:
        # Like
        recognitions_collection.update_one(
            {"id": recognition_id},
            {"$addToSet": {"likes": current_user["id"]}}
        )
        liked = True
        
        # Award 1 point for liking
        award_points(current_user["id"], 1, "Liked a recognition", "like")
    
    updated = recognitions_collection.find_one({"id": recognition_id})
    like_count = len(updated.get("likes", []))
    
    # Broadcast like update via Socket.IO
    await sio.emit("recognition_liked", {
        "recognition_id": recognition_id,
        "user_id": current_user["id"],
        "liked": liked,
        "like_count": like_count
    })
    
    return {"success": True, "liked": liked, "like_count": like_count}

@app.post("/api/recognitions/{recognition_id}/comment")
async def comment_on_recognition(recognition_id: str, comment_data: dict, current_user = Depends(get_current_user)):
    """Comment on a recognition post"""
    recognition = recognitions_collection.find_one({"id": recognition_id})
    if not recognition:
        raise HTTPException(status_code=404, detail="Recognition not found")
    
    comment = {
        "id": str(uuid.uuid4()),
        "user_id": current_user["id"],
        "comment": comment_data.get("comment", ""),
        "created_at": datetime.utcnow().isoformat()
    }
    
    recognitions_collection.update_one(
        {"id": recognition_id},
        {"$push": {"comments": comment}}
    )
    
    # Get commenter details
    user = users_collection.find_one({"id": current_user["id"]}, {"_id": 1, "id": 1, "full_name": 1, "avatar": 1})
    if user:
        user["_id"] = str(user["_id"])
        comment["user"] = user
    
    # Award points for commenting
    award_points(current_user["id"], 2, "Commented on recognition", "comment")
    
    # Broadcast comment via Socket.IO
    await sio.emit("recognition_commented", {
        "recognition_id": recognition_id,
        "comment": comment
    })
    
    return {"success": True, "comment": comment}


# ==================== SPACES & SUBSPACES ====================

@app.post("/api/spaces")
async def create_space(space: SpaceCreate, current_user = Depends(get_current_user)):
    """Create a new space (admin/manager only)"""
    # Check permissions
    if current_user["role"] not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Only admins and managers can create spaces")
    
    space_id = str(uuid.uuid4())
    space_doc = {
        "id": space_id,
        "name": space.name,
        "description": space.description,
        "type": space.type,
        "icon": space.icon or "📁",
        "created_by": current_user["id"],
        "created_at": datetime.utcnow().isoformat(),
        "members": [current_user["id"]],
        "admins": [current_user["id"]],
        "subspaces": []
    }
    
    spaces_collection.insert_one(space_doc)
    space_doc["_id"] = str(space_doc["_id"])
    
    # Get creator details
    creator = users_collection.find_one({"id": current_user["id"]}, {"_id": 1, "id": 1, "full_name": 1, "avatar": 1})
    if creator:
        creator["_id"] = str(creator["_id"])
        space_doc["created_by_user"] = creator
    
    # Award points for creating space
    award_points(current_user["id"], 10, "Created space", "space_created")
    
    return space_doc

@app.get("/api/spaces")
async def get_spaces(current_user = Depends(get_current_user)):
    """Get all spaces visible to current user"""
    # Get spaces where user is a member OR space is public
    query = {
        "$or": [
            {"members": current_user["id"]},
            {"type": "public"},
            {"type": "restricted"}
        ]
    }
    
    spaces = list(spaces_collection.find(query).sort("name", 1))
    
    for space in spaces:
        space["_id"] = str(space["_id"])
        
        # Get creator details
        creator = users_collection.find_one({"id": space["created_by"]}, {"_id": 1, "id": 1, "full_name": 1, "avatar": 1})
        if creator:
            creator["_id"] = str(creator["_id"])
            space["created_by_user"] = creator
        
        # Check if user is member
        space["is_member"] = current_user["id"] in space.get("members", [])
        space["is_admin"] = current_user["id"] in space.get("admins", [])
        space["member_count"] = len(space.get("members", []))
        
        # Get subspaces count
        space["subspace_count"] = len(space.get("subspaces", []))
    
    return spaces

@app.get("/api/spaces/{space_id}")
async def get_space(space_id: str, current_user = Depends(get_current_user)):
    """Get a specific space"""
    space = spaces_collection.find_one({"id": space_id})
    if not space:
        raise HTTPException(status_code=404, detail="Space not found")
    
    # Check access
    if space["type"] == "private" and current_user["id"] not in space.get("members", []):
        raise HTTPException(status_code=403, detail="Access denied")
    
    space["_id"] = str(space["_id"])
    
    # Get creator details
    creator = users_collection.find_one({"id": space["created_by"]}, {"_id": 1, "id": 1, "full_name": 1, "avatar": 1})
    if creator:
        creator["_id"] = str(creator["_id"])
        space["created_by_user"] = creator
    
    space["is_member"] = current_user["id"] in space.get("members", [])
    space["is_admin"] = current_user["id"] in space.get("admins", [])
    space["member_count"] = len(space.get("members", []))
    
    return space

@app.put("/api/spaces/{space_id}")
async def update_space(space_id: str, update_data: SpaceUpdate, current_user = Depends(get_current_user)):
    """Update a space (admin only)"""
    space = spaces_collection.find_one({"id": space_id})
    if not space:
        raise HTTPException(status_code=404, detail="Space not found")
    
    # Check permissions
    if current_user["id"] not in space.get("admins", []) and current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to update this space")
    
    update_fields = {k: v for k, v in update_data.dict().items() if v is not None}
    
    if update_fields:
        spaces_collection.update_one(
            {"id": space_id},
            {"$set": update_fields}
        )
    
    updated = spaces_collection.find_one({"id": space_id})
    updated["_id"] = str(updated["_id"])
    
    return updated

@app.delete("/api/spaces/{space_id}")
async def delete_space(space_id: str, current_user = Depends(get_current_user)):
    """Delete a space (admin only)"""
    space = spaces_collection.find_one({"id": space_id})
    if not space:
        raise HTTPException(status_code=404, detail="Space not found")
    
    # Check permissions
    if current_user["id"] not in space.get("admins", []) and current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete this space")
    
    # Check if it's the default General space
    if space.get("name") == "General" and space.get("is_default"):
        raise HTTPException(status_code=400, detail="Cannot delete the default General space")
    
    spaces_collection.delete_one({"id": space_id})
    return {"success": True, "message": "Space deleted"}

@app.post("/api/spaces/{space_id}/join")
async def join_space(space_id: str, current_user = Depends(get_current_user)):
    """Join a space (creates approval request for private/restricted spaces)"""
    space = spaces_collection.find_one({"id": space_id})
    if not space:
        raise HTTPException(status_code=404, detail="Space not found")
    
    # Check if already a member
    if current_user["id"] in space.get("members", []):
        return {"success": True, "message": "Already a member", "status": "member"}
    
    # Check if there's already a pending approval request
    existing_approval = approvals_collection.find_one({
        "type": "space_join",
        "reference_id": space_id,
        "requester_id": current_user["id"],
        "status": "pending"
    })
    
    if existing_approval:
        return {"success": True, "message": "Join request already pending", "status": "pending"}
    
    # Check space type
    if space["type"] == "private":
        # Private spaces require invitation only
        raise HTTPException(status_code=403, detail="Cannot join private space without invitation")
    
    if space["type"] == "restricted":
        # Restricted spaces require approval
        approval = ApprovalCreate(
            type="space_join",
            reference_id=space_id,
            reference_type="space",
            details={
                "space_name": space["name"],
                "space_type": space["type"]
            }
        )
        
        approval_result = await create_approval(approval, current_user)
        
        return {
            "success": True,
            "message": "Join request submitted for approval",
            "status": "pending",
            "approval_id": approval_result["id"]
        }
    
    # Public spaces - join immediately
    spaces_collection.update_one(
        {"id": space_id},
        {"$addToSet": {"members": current_user["id"]}}
    )
    
    return {"success": True, "message": "Joined space", "status": "member"}

@app.post("/api/spaces/{space_id}/leave")
async def leave_space(space_id: str, current_user = Depends(get_current_user)):
    """Leave a space"""
    space = spaces_collection.find_one({"id": space_id})
    if not space:
        raise HTTPException(status_code=404, detail="Space not found")
    
    # Check if it's the default General space
    if space.get("name") == "General" and space.get("is_default"):
        raise HTTPException(status_code=400, detail="Cannot leave the default General space")
    
    # Remove user from members
    spaces_collection.update_one(
        {"id": space_id},
        {"$pull": {"members": current_user["id"], "admins": current_user["id"]}}
    )
    
    return {"success": True, "message": "Left space"}

# ==================== SUBSPACES ====================

@app.post("/api/spaces/{space_id}/subspaces")
async def create_subspace(space_id: str, subspace: SubspaceCreate, current_user = Depends(get_current_user)):
    """Create a subspace within a space"""
    space = spaces_collection.find_one({"id": space_id})
    if not space:
        raise HTTPException(status_code=404, detail="Space not found")
    
    # Check permissions (must be space admin)
    if current_user["id"] not in space.get("admins", []) and current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Only space admins can create subspaces")
    
    subspace_id = str(uuid.uuid4())
    subspace_doc = {
        "id": subspace_id,
        "space_id": space_id,
        "name": subspace.name,
        "description": subspace.description,
        "icon": subspace.icon or "📂",
        "created_by": current_user["id"],
        "created_at": datetime.utcnow().isoformat(),
        "channels": []
    }
    
    # Add subspace ID to space's subspaces array
    spaces_collection.update_one(
        {"id": space_id},
        {"$addToSet": {"subspaces": subspace_id}}
    )
    
    # Store subspace in a separate collection or embedded (for MVP, we'll use a new collection)
    db["subspaces"].insert_one(subspace_doc)
    subspace_doc["_id"] = str(subspace_doc["_id"])
    
    return subspace_doc

@app.get("/api/spaces/{space_id}/subspaces")
async def get_subspaces(space_id: str, current_user = Depends(get_current_user)):
    """Get all subspaces in a space"""
    space = spaces_collection.find_one({"id": space_id})
    if not space:
        raise HTTPException(status_code=404, detail="Space not found")
    
    # Check access
    if space["type"] == "private" and current_user["id"] not in space.get("members", []):
        raise HTTPException(status_code=403, detail="Access denied")
    
    subspaces = list(db["subspaces"].find({"space_id": space_id}).sort("name", 1))
    
    for subspace in subspaces:
        subspace["_id"] = str(subspace["_id"])
        # Count channels in subspace
        subspace["channel_count"] = chats_collection.count_documents({"subspace_id": subspace["id"]})
    
    return subspaces

@app.put("/api/subspaces/{subspace_id}")
async def update_subspace(subspace_id: str, update_data: SubspaceUpdate, current_user = Depends(get_current_user)):
    """Update a subspace"""
    subspace = db["subspaces"].find_one({"id": subspace_id})
    if not subspace:
        raise HTTPException(status_code=404, detail="Subspace not found")
    
    # Get parent space
    space = spaces_collection.find_one({"id": subspace["space_id"]})
    if not space:
        raise HTTPException(status_code=404, detail="Parent space not found")
    
    # Check permissions
    if current_user["id"] not in space.get("admins", []) and current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    update_fields = {k: v for k, v in update_data.dict().items() if v is not None}
    
    if update_fields:
        db["subspaces"].update_one(
            {"id": subspace_id},
            {"$set": update_fields}
        )
    
    updated = db["subspaces"].find_one({"id": subspace_id})
    updated["_id"] = str(updated["_id"])
    
    return updated

@app.delete("/api/subspaces/{subspace_id}")
async def delete_subspace(subspace_id: str, current_user = Depends(get_current_user)):
    """Delete a subspace"""
    subspace = db["subspaces"].find_one({"id": subspace_id})
    if not subspace:
        raise HTTPException(status_code=404, detail="Subspace not found")
    
    # Get parent space
    space = spaces_collection.find_one({"id": subspace["space_id"]})
    if not space:
        raise HTTPException(status_code=404, detail="Parent space not found")
    
    # Check permissions
    if current_user["id"] not in space.get("admins", []) and current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Remove subspace ID from space
    spaces_collection.update_one(
        {"id": subspace["space_id"]},
        {"$pull": {"subspaces": subspace_id}}
    )
    
    db["subspaces"].delete_one({"id": subspace_id})
    
    return {"success": True, "message": "Subspace deleted"}

# ==================== CHAT WITH SPACES ====================

@app.post("/api/chats/with-space")
async def create_chat_with_space(chat: ChatCreateWithSpace, current_user = Depends(get_current_user)):
    """Create a chat within a space/subspace"""
    chat_id = str(uuid.uuid4())
    
    # Ensure current user is in participants
    if current_user["id"] not in chat.participants:
        chat.participants.append(current_user["id"])
    
    chat_doc = {
        "id": chat_id,
        "name": chat.name,
        "type": chat.type,
        "participants": chat.participants,
        "space_id": chat.space_id,
        "subspace_id": chat.subspace_id,
        "created_by": current_user["id"],
        "created_at": datetime.utcnow().isoformat(),
        "last_message": None,
        "last_message_at": None
    }
    
    chats_collection.insert_one(chat_doc)
    chat_doc["_id"] = str(chat_doc["_id"])
    
    return chat_doc

@app.get("/api/spaces/{space_id}/chats")
async def get_space_chats(space_id: str, current_user = Depends(get_current_user)):
    """Get all chats in a space"""
    chats = list(chats_collection.find({
        "space_id": space_id,
        "participants": current_user["id"]
    }).sort("last_message_at", -1))
    
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

# ==================== MIGRATION ENDPOINT ====================

@app.post("/api/migrate-chats-to-spaces")
async def migrate_chats_to_spaces(current_user = Depends(get_current_user)):
    """Migrate existing chats to default 'General' space (admin only)"""
    # Check if user is admin
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Only admins can run migration")
    
    # Check if General space exists
    general_space = spaces_collection.find_one({"name": "General", "is_default": True})
    
    if not general_space:
        # Create default General space
        space_id = str(uuid.uuid4())
        general_space = {
            "id": space_id,
            "name": "General",
            "description": "Default space for all users",
            "type": "public",
            "icon": "🏢",
            "is_default": True,
            "created_by": current_user["id"],
            "created_at": datetime.utcnow().isoformat(),
            "members": [],
            "admins": [current_user["id"]],
            "subspaces": []
        }
        spaces_collection.insert_one(general_space)
        general_space_id = space_id
    else:
        general_space_id = general_space["id"]
    
    # Update all chats without space_id
    result = chats_collection.update_many(
        {"space_id": {"$exists": False}},
        {"$set": {"space_id": general_space_id, "subspace_id": None}}
    )
    
    return {
        "success": True,
        "message": "Migration completed",
        "chats_migrated": result.modified_count,
        "general_space_id": general_space_id
    }



# ==================== APPROVAL SYSTEM ====================

@app.post("/api/approvals")
async def create_approval(approval: ApprovalCreate, current_user = Depends(get_current_user)):
    """Create an approval request"""
    approval_id = str(uuid.uuid4())
    approval_doc = {
        "id": approval_id,
        "type": approval.type,
        "reference_id": approval.reference_id,
        "reference_type": approval.reference_type,
        "requester_id": current_user["id"],
        "status": "pending",
        "details": approval.details or {},
        "notes": approval.notes,
        "approver_id": None,
        "approver_notes": None,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    }
    
    approvals_collection.insert_one(approval_doc)
    approval_doc["_id"] = str(approval_doc["_id"])
    
    # Get requester details
    requester = users_collection.find_one({"id": current_user["id"]}, {"_id": 1, "id": 1, "full_name": 1, "avatar": 1, "email": 1})
    if requester:
        requester["_id"] = str(requester["_id"])
        approval_doc["requester"] = requester
    
    # Broadcast new approval to admins/managers
    await sio.emit("new_approval", approval_doc)
    
    return approval_doc

@app.get("/api/approvals")
async def get_approvals(
    current_user = Depends(get_current_user),
    type: Optional[str] = None,
    status: Optional[str] = None,
    my_requests: bool = False
):
    """Get approval requests (filtered)"""
    query = {}
    
    if my_requests:
        # Get approvals requested by current user
        query["requester_id"] = current_user["id"]
    else:
        # Only admins/managers can see all approvals
        if current_user["role"] not in ["admin", "manager", "department_head", "team_lead"]:
            query["requester_id"] = current_user["id"]
    
    if type:
        query["type"] = type
    
    if status:
        query["status"] = status
    
    approvals = list(approvals_collection.find(query).sort("created_at", -1))
    
    for approval in approvals:
        approval["_id"] = str(approval["_id"])
        
        # Get requester details
        requester = users_collection.find_one({"id": approval["requester_id"]}, {"_id": 1, "id": 1, "full_name": 1, "avatar": 1, "email": 1})
        if requester:
            requester["_id"] = str(requester["_id"])
            approval["requester"] = requester
        
        # Get approver details if approved/rejected
        if approval.get("approver_id"):
            approver = users_collection.find_one({"id": approval["approver_id"]}, {"_id": 1, "id": 1, "full_name": 1, "avatar": 1})
            if approver:
                approver["_id"] = str(approver["_id"])
                approval["approver"] = approver
        
        # Add reference details based on type
        if approval["reference_type"] == "space":
            space = spaces_collection.find_one({"id": approval["reference_id"]}, {"_id": 1, "id": 1, "name": 1, "icon": 1, "type": 1})
            if space:
                space["_id"] = str(space["_id"])
                approval["reference"] = space
        elif approval["reference_type"] == "user":
            user = users_collection.find_one({"id": approval["reference_id"]}, {"_id": 1, "id": 1, "username": 1, "full_name": 1, "email": 1})
            if user:
                user["_id"] = str(user["_id"])
                approval["reference"] = user
        elif approval["reference_type"] == "reward":
            reward = rewards_collection.find_one({"id": approval["reference_id"]}, {"_id": 1, "id": 1, "name": 1, "cost": 1})
            if reward:
                reward["_id"] = str(reward["_id"])
                approval["reference"] = reward
    
    return approvals

@app.get("/api/approvals/pending")
async def get_pending_approvals(current_user = Depends(get_current_user)):
    """Get count of pending approvals (for badge)"""
    # Only admins/managers/leads can see pending count
    if current_user["role"] not in ["admin", "manager", "department_head", "team_lead"]:
        return {"count": 0}
    
    count = approvals_collection.count_documents({"status": "pending"})
    return {"count": count}

@app.put("/api/approvals/{approval_id}/approve")
async def approve_request(approval_id: str, update: ApprovalUpdate, current_user = Depends(get_current_user)):
    """Approve an approval request"""
    # Check permissions
    if current_user["role"] not in ["admin", "manager", "department_head", "team_lead"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    approval = approvals_collection.find_one({"id": approval_id})
    if not approval:
        raise HTTPException(status_code=404, detail="Approval request not found")
    
    if approval["status"] != "pending":
        raise HTTPException(status_code=400, detail="Approval request already processed")
    
    # Update approval status
    approvals_collection.update_one(
        {"id": approval_id},
        {"$set": {
            "status": "approved",
            "approver_id": current_user["id"],
            "approver_notes": update.notes,
            "updated_at": datetime.utcnow().isoformat()
        }}
    )
    
    # Execute approval action based on type
    if approval["type"] == "space_join":
        # Add user to space members
        spaces_collection.update_one(
            {"id": approval["reference_id"]},
            {"$addToSet": {"members": approval["requester_id"]}}
        )
    elif approval["type"] == "user_registration":
        # Activate user account
        users_collection.update_one(
            {"id": approval["reference_id"]},
            {"$set": {"status": "active"}}
        )
    elif approval["type"] == "reward_redemption":
        # Process reward redemption
        redemption_id = approval["reference_id"]
        reward_redemptions_collection.update_one(
            {"id": redemption_id},
            {"$set": {"status": "approved", "approved_by": current_user["id"], "approved_at": datetime.utcnow().isoformat()}}
        )
        # Deduct points if not already done
        redemption = reward_redemptions_collection.find_one({"id": redemption_id})
        if redemption and not redemption.get("points_deducted"):
            user = users_collection.find_one({"id": redemption["user_id"]})
            if user:
                new_points = user.get("points", 0) - redemption["cost"]
                users_collection.update_one(
                    {"id": redemption["user_id"]},
                    {"$set": {"points": max(0, new_points)}}
                )
                reward_redemptions_collection.update_one(
                    {"id": redemption_id},
                    {"$set": {"points_deducted": True}}
                )
    elif approval["type"] == "content_approval":
        # Publish content (announcement or recognition)
        if approval["reference_type"] == "announcement":
            announcements_collection.update_one(
                {"id": approval["reference_id"]},
                {"$set": {"published": True, "published_at": datetime.utcnow().isoformat()}}
            )
        elif approval["reference_type"] == "recognition":
            recognitions_collection.update_one(
                {"id": approval["reference_id"]},
                {"$set": {"published": True, "published_at": datetime.utcnow().isoformat()}}
            )
    
    # Award points to approver
    award_points(current_user["id"], 3, "Approved request", "approval")
    
    # Get updated approval
    updated_approval = approvals_collection.find_one({"id": approval_id})
    updated_approval["_id"] = str(updated_approval["_id"])
    
    # Broadcast approval notification
    await sio.emit("approval_processed", {
        "approval_id": approval_id,
        "status": "approved",
        "requester_id": approval["requester_id"]
    }, room=f"user_{approval['requester_id']}")
    
    return updated_approval

@app.put("/api/approvals/{approval_id}/reject")
async def reject_request(approval_id: str, update: ApprovalUpdate, current_user = Depends(get_current_user)):
    """Reject an approval request"""
    # Check permissions
    if current_user["role"] not in ["admin", "manager", "department_head", "team_lead"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    approval = approvals_collection.find_one({"id": approval_id})
    if not approval:
        raise HTTPException(status_code=404, detail="Approval request not found")
    
    if approval["status"] != "pending":
        raise HTTPException(status_code=400, detail="Approval request already processed")
    
    # Update approval status
    approvals_collection.update_one(
        {"id": approval_id},
        {"$set": {
            "status": "rejected",
            "approver_id": current_user["id"],
            "approver_notes": update.notes,
            "updated_at": datetime.utcnow().isoformat()
        }}
    )
    
    # Get updated approval
    updated_approval = approvals_collection.find_one({"id": approval_id})
    updated_approval["_id"] = str(updated_approval["_id"])
    
    # Broadcast rejection notification
    await sio.emit("approval_processed", {
        "approval_id": approval_id,
        "status": "rejected",
        "requester_id": approval["requester_id"]
    }, room=f"user_{approval['requester_id']}")
    
    return updated_approval

@app.delete("/api/approvals/{approval_id}")
async def delete_approval(approval_id: str, current_user = Depends(get_current_user)):
    """Delete/cancel an approval request"""
    approval = approvals_collection.find_one({"id": approval_id})
    if not approval:
        raise HTTPException(status_code=404, detail="Approval request not found")
    
    # Only requester or admin can delete
    if approval["requester_id"] != current_user["id"] and current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    approvals_collection.delete_one({"id": approval_id})
    return {"success": True, "message": "Approval request deleted"}


# ==================== INVITATION SYSTEM ====================

@app.post("/api/invitations")
async def create_invitation(invitation: InvitationCreate, current_user = Depends(get_current_user)):
    """Create an invitation"""
    invitation_id = str(uuid.uuid4())
    
    # Generate unique token for organization invitations
    token = None
    if invitation.type == "organization":
        token = str(uuid.uuid4())
    
    invitation_doc = {
        "id": invitation_id,
        "type": invitation.type,
        "inviter_id": current_user["id"],
        "invitee_email": invitation.invitee_email,
        "invitee_user_id": invitation.invitee_user_id,
        "reference_id": invitation.reference_id,
        "message": invitation.message,
        "status": "pending",
        "token": token,
        "expires_at": invitation.expires_at or (datetime.utcnow() + timedelta(days=7)).isoformat(),
        "created_at": datetime.utcnow().isoformat()
    }
    
    invitations_collection.insert_one(invitation_doc)
    invitation_doc["_id"] = str(invitation_doc["_id"])
    
    # Get inviter details
    inviter = users_collection.find_one({"id": current_user["id"]}, {"_id": 1, "id": 1, "full_name": 1, "avatar": 1, "email": 1})
    if inviter:
        inviter["_id"] = str(inviter["_id"])
        invitation_doc["inviter"] = inviter
    
    # Get reference details based on type
    if invitation.type == "space" and invitation.reference_id:
        space = spaces_collection.find_one({"id": invitation.reference_id}, {"_id": 1, "id": 1, "name": 1, "icon": 1})
        if space:
            space["_id"] = str(space["_id"])
            invitation_doc["reference"] = space
    
    # If inviting an existing user, notify them
    if invitation.invitee_user_id:
        await sio.emit("new_invitation", invitation_doc, room=f"user_{invitation.invitee_user_id}")
    
    # Award points for sending invitation
    award_points(current_user["id"], 2, "Sent invitation", "invitation")
    
    return invitation_doc

@app.get("/api/invitations")
async def get_invitations(
    current_user = Depends(get_current_user),
    type: Optional[str] = None,
    status: Optional[str] = None,
    sent: bool = False
):
    """Get invitations (sent by me or received by me)"""
    query = {}
    
    if sent:
        # Invitations sent by current user
        query["inviter_id"] = current_user["id"]
    else:
        # Invitations received by current user
        query["$or"] = [
            {"invitee_user_id": current_user["id"]},
            {"invitee_email": current_user["email"]}
        ]
    
    if type:
        query["type"] = type
    
    if status:
        query["status"] = status
    
    invitations = list(invitations_collection.find(query).sort("created_at", -1))
    
    for invitation in invitations:
        invitation["_id"] = str(invitation["_id"])
        
        # Get inviter details
        inviter = users_collection.find_one({"id": invitation["inviter_id"]}, {"_id": 1, "id": 1, "full_name": 1, "avatar": 1})
        if inviter:
            inviter["_id"] = str(inviter["_id"])
            invitation["inviter"] = inviter
        
        # Get invitee details if user
        if invitation.get("invitee_user_id"):
            invitee = users_collection.find_one({"id": invitation["invitee_user_id"]}, {"_id": 1, "id": 1, "full_name": 1, "avatar": 1})
            if invitee:
                invitee["_id"] = str(invitee["_id"])
                invitation["invitee"] = invitee
        
        # Get reference details
        if invitation["type"] == "space" and invitation.get("reference_id"):
            space = spaces_collection.find_one({"id": invitation["reference_id"]}, {"_id": 1, "id": 1, "name": 1, "icon": 1})
            if space:
                space["_id"] = str(space["_id"])
                invitation["reference"] = space
    
    return invitations

@app.get("/api/invitations/pending")
async def get_pending_invitations(current_user = Depends(get_current_user)):
    """Get count of pending invitations (for badge)"""
    count = invitations_collection.count_documents({
        "$or": [
            {"invitee_user_id": current_user["id"]},
            {"invitee_email": current_user["email"]}
        ],
        "status": "pending"
    })
    return {"count": count}

@app.post("/api/invitations/{invitation_id}/accept")
async def accept_invitation(invitation_id: str, current_user = Depends(get_current_user)):
    """Accept an invitation"""
    invitation = invitations_collection.find_one({"id": invitation_id})
    if not invitation:
        raise HTTPException(status_code=404, detail="Invitation not found")
    
    # Verify current user is the invitee
    if invitation.get("invitee_user_id") != current_user["id"] and invitation.get("invitee_email") != current_user["email"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if invitation["status"] != "pending":
        raise HTTPException(status_code=400, detail="Invitation already processed")
    
    # Check if expired
    if datetime.fromisoformat(invitation["expires_at"]) < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Invitation expired")
    
    # Update invitation status
    invitations_collection.update_one(
        {"id": invitation_id},
        {"$set": {
            "status": "accepted",
            "accepted_at": datetime.utcnow().isoformat()
        }}
    )
    
    # Execute invitation action based on type
    if invitation["type"] == "space":
        # Add user to space
        spaces_collection.update_one(
            {"id": invitation["reference_id"]},
            {"$addToSet": {"members": current_user["id"]}}
        )
    
    # Award points
    award_points(current_user["id"], 5, "Accepted invitation", "invitation")
    
    # Notify inviter
    await sio.emit("invitation_accepted", {
        "invitation_id": invitation_id,
        "invitee_id": current_user["id"],
        "invitee_name": current_user["full_name"]
    }, room=f"user_{invitation['inviter_id']}")
    
    return {"success": True, "message": "Invitation accepted"}

@app.post("/api/invitations/{invitation_id}/reject")
async def reject_invitation(invitation_id: str, current_user = Depends(get_current_user)):
    """Reject an invitation"""
    invitation = invitations_collection.find_one({"id": invitation_id})
    if not invitation:
        raise HTTPException(status_code=404, detail="Invitation not found")
    
    # Verify current user is the invitee
    if invitation.get("invitee_user_id") != current_user["id"] and invitation.get("invitee_email") != current_user["email"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if invitation["status"] != "pending":
        raise HTTPException(status_code=400, detail="Invitation already processed")
    
    # Update invitation status
    invitations_collection.update_one(
        {"id": invitation_id},
        {"$set": {
            "status": "rejected",
            "rejected_at": datetime.utcnow().isoformat()
        }}
    )
    
    # Notify inviter
    await sio.emit("invitation_rejected", {
        "invitation_id": invitation_id,
        "invitee_id": current_user["id"]
    }, room=f"user_{invitation['inviter_id']}")
    
    return {"success": True, "message": "Invitation rejected"}

@app.delete("/api/invitations/{invitation_id}")
async def delete_invitation(invitation_id: str, current_user = Depends(get_current_user)):
    """Cancel/delete an invitation"""
    invitation = invitations_collection.find_one({"id": invitation_id})
    if not invitation:
        raise HTTPException(status_code=404, detail="Invitation not found")
    
    # Only inviter or admin can delete
    if invitation["inviter_id"] != current_user["id"] and current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    invitations_collection.delete_one({"id": invitation_id})
    return {"success": True, "message": "Invitation cancelled"}


# ==================== MEMBER MANAGEMENT ====================

@app.get("/api/spaces/{space_id}/members")
async def get_space_members(space_id: str, current_user = Depends(get_current_user)):
    """Get all members of a space with their roles"""
    space = spaces_collection.find_one({"id": space_id})
    if not space:
        raise HTTPException(status_code=404, detail="Space not found")
    
    # Check if user has access to see members
    if space["type"] == "private" and current_user["id"] not in space.get("members", []):
        raise HTTPException(status_code=403, detail="Access denied")
    
    members = []
    for user_id in space.get("members", []):
        user = users_collection.find_one({"id": user_id}, {"_id": 1, "id": 1, "username": 1, "full_name": 1, "email": 1, "avatar": 1, "role": 1, "department": 1, "team": 1})
        if user:
            user["_id"] = str(user["_id"])
            user["space_role"] = "admin" if user_id in space.get("admins", []) else "member"
            members.append(user)
    
    return {
        "space_id": space_id,
        "space_name": space["name"],
        "total_members": len(members),
        "members": members
    }

@app.post("/api/spaces/{space_id}/members/{user_id}")
async def add_space_member(space_id: str, user_id: str, current_user = Depends(get_current_user)):
    """Add a member to a space (admin only)"""
    space = spaces_collection.find_one({"id": space_id})
    if not space:
        raise HTTPException(status_code=404, detail="Space not found")
    
    # Check permissions
    if current_user["id"] not in space.get("admins", []) and current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Only space admins can add members")
    
    # Verify user exists
    user = users_collection.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Add to members
    spaces_collection.update_one(
        {"id": space_id},
        {"$addToSet": {"members": user_id}}
    )
    
    # Award points
    award_points(current_user["id"], 2, "Added space member", "member_management")
    
    return {"success": True, "message": f"User {user['full_name']} added to space"}

@app.delete("/api/spaces/{space_id}/members/{user_id}")
async def remove_space_member(space_id: str, user_id: str, current_user = Depends(get_current_user)):
    """Remove a member from a space (admin only)"""
    space = spaces_collection.find_one({"id": space_id})
    if not space:
        raise HTTPException(status_code=404, detail="Space not found")
    
    # Check permissions
    if current_user["id"] not in space.get("admins", []) and current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Only space admins can remove members")
    
    # Cannot remove the space creator
    if user_id == space["created_by"]:
        raise HTTPException(status_code=400, detail="Cannot remove space creator")
    
    # Remove from members and admins
    spaces_collection.update_one(
        {"id": space_id},
        {"$pull": {"members": user_id, "admins": user_id}}
    )
    
    return {"success": True, "message": "Member removed from space"}

@app.put("/api/spaces/{space_id}/members/{user_id}/role")
async def update_member_role(space_id: str, user_id: str, update: MemberUpdate, current_user = Depends(get_current_user)):
    """Update a member's role in a space (promote/demote admin)"""
    space = spaces_collection.find_one({"id": space_id})
    if not space:
        raise HTTPException(status_code=404, detail="Space not found")
    
    # Check permissions
    if current_user["id"] not in space.get("admins", []) and current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Only space admins can change roles")
    
    # Verify user is a member
    if user_id not in space.get("members", []):
        raise HTTPException(status_code=400, detail="User is not a member of this space")
    
    # Cannot change creator's role
    if user_id == space["created_by"]:
        raise HTTPException(status_code=400, detail="Cannot change space creator's role")
    
    if update.role == "admin":
        # Promote to admin
        spaces_collection.update_one(
            {"id": space_id},
            {"$addToSet": {"admins": user_id}}
        )
        message = "Member promoted to admin"
    else:
        # Demote to regular member
        spaces_collection.update_one(
            {"id": space_id},
            {"$pull": {"admins": user_id}}
        )
        message = "Admin demoted to member"
    
    # Award points
    award_points(current_user["id"], 3, "Updated member role", "member_management")
    
    return {"success": True, "message": message}

@app.get("/api/teams/{team_name}/members")
async def get_team_members(team_name: str, current_user = Depends(get_current_user)):
    """Get all members of a team"""
    members = list(users_collection.find({"team": team_name}, {"password": 0}))
    for member in members:
        member["_id"] = str(member["_id"])
    
    return {
        "team": team_name,
        "total_members": len(members),
        "members": members
    }

@app.get("/api/departments/{department_name}/members")
async def get_department_members(department_name: str, current_user = Depends(get_current_user)):
    """Get all members of a department"""
    members = list(users_collection.find({"department": department_name}, {"password": 0}))
    for member in members:
        member["_id"] = str(member["_id"])
    
    return {
        "department": department_name,
        "total_members": len(members),
        "members": members
    }


# ==================== REWARD REDEMPTION WITH APPROVAL ====================

@app.post("/api/rewards/{reward_id}/redeem")
async def redeem_reward(reward_id: str, redemption: RewardRedemptionCreate, current_user = Depends(get_current_user)):
    """Redeem a reward (creates approval request for manager)"""
    reward = rewards_collection.find_one({"id": reward_id})
    if not reward:
        raise HTTPException(status_code=404, detail="Reward not found")
    
    if not reward.get("active", True):
        raise HTTPException(status_code=400, detail="Reward is not active")
    
    # Check if user has enough points
    total_cost = reward["cost"] * redemption.quantity
    if current_user["points"] < total_cost:
        raise HTTPException(status_code=400, detail="Insufficient points")
    
    # Check stock
    if reward.get("stock", 0) < redemption.quantity:
        raise HTTPException(status_code=400, detail="Insufficient stock")
    
    # Create redemption record
    redemption_id = str(uuid.uuid4())
    redemption_doc = {
        "id": redemption_id,
        "user_id": current_user["id"],
        "reward_id": reward_id,
        "quantity": redemption.quantity,
        "cost": total_cost,
        "status": "pending",
        "notes": redemption.notes,
        "points_deducted": False,
        "created_at": datetime.utcnow().isoformat()
    }
    
    reward_redemptions_collection.insert_one(redemption_doc)
    
    # Create approval request
    approval = ApprovalCreate(
        type="reward_redemption",
        reference_id=redemption_id,
        reference_type="reward",
        details={
            "reward_name": reward["name"],
            "reward_cost": reward["cost"],
            "quantity": redemption.quantity,
            "total_cost": total_cost
        },
        notes=redemption.notes
    )
    
    approval_result = await create_approval(approval, current_user)
    
    return {
        "success": True,
        "message": "Reward redemption submitted for approval",
        "redemption_id": redemption_id,
        "approval_id": approval_result["id"],
        "requires_approval": True
    }

@app.get("/api/my-redemptions")
async def get_my_redemptions(current_user = Depends(get_current_user)):
    """Get current user's reward redemptions"""
    redemptions = list(reward_redemptions_collection.find({"user_id": current_user["id"]}).sort("created_at", -1))
    
    for redemption in redemptions:
        redemption["_id"] = str(redemption["_id"])
        
        # Get reward details
        reward = rewards_collection.find_one({"id": redemption["reward_id"]}, {"_id": 1, "id": 1, "name": 1, "icon": 1, "cost": 1})
        if reward:
            reward["_id"] = str(reward["_id"])
            redemption["reward"] = reward
    
    return redemptions


# ==================== UPDATE USER REGISTRATION FOR APPROVAL ====================

# Update the registration endpoint to support optional approval
# This doesn't replace the existing endpoint, just adds approval logic



# Socket.IO Events
@sio.event
async def connect(sid, environ):
    print(f"Client connected: {sid}")

@sio.event
async def disconnect(sid):
    print(f"Client disconnected: {sid}")
    # Update user status to offline
    # Note: We'd need to track sid to user_id mapping for this

@sio.event
async def authenticate(sid, data):
    """Authenticate socket connection"""
    try:
        token = data.get("token")
        if not token:
            await sio.emit("error", {"message": "No token provided"}, room=sid)
            return
        
        # Verify JWT token
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        
        if not user_id:
            await sio.emit("error", {"message": "Invalid token"}, room=sid)
            return
        
        # Store user_id with sid
        await sio.save_session(sid, {"user_id": user_id})
        
        # Update user status to online
        users_collection.update_one(
            {"id": user_id},
            {"$set": {"status": "online", "last_seen": datetime.utcnow().isoformat()}}
        )
        
        # Join user's personal room
        await sio.enter_room(sid, f"user_{user_id}")
        
        # Notify other users that this user is online
        await sio.emit("user_status", {"user_id": user_id, "status": "online"})
        
        await sio.emit("authenticated", {"user_id": user_id}, room=sid)
        print(f"User {user_id} authenticated on socket {sid}")
        
    except JWTError:
        await sio.emit("error", {"message": "Invalid token"}, room=sid)
    except Exception as e:
        print(f"Authentication error: {e}")
        await sio.emit("error", {"message": str(e)}, room=sid)

@sio.event
async def join_chat(sid, data):
    """Join a chat room"""
    session = await sio.get_session(sid)
    user_id = session.get("user_id")
    
    if not user_id:
        await sio.emit("error", {"message": "Not authenticated"}, room=sid)
        return
    
    chat_id = data.get("chat_id")
    if not chat_id:
        return
    
    # Verify user is participant
    chat = chats_collection.find_one({"id": chat_id, "participants": user_id})
    if not chat:
        await sio.emit("error", {"message": "Not a participant"}, room=sid)
        return
    
    await sio.enter_room(sid, f"chat_{chat_id}")
    print(f"User {user_id} joined chat {chat_id}")

@sio.event
async def leave_chat(sid, data):
    """Leave a chat room"""
    chat_id = data.get("chat_id")
    if chat_id:
        await sio.leave_room(sid, f"chat_{chat_id}")

@sio.event
async def send_message(sid, data):
    """Handle new message"""
    session = await sio.get_session(sid)
    user_id = session.get("user_id")
    
    if not user_id:
        await sio.emit("error", {"message": "Not authenticated"}, room=sid)
        return
    
    chat_id = data.get("chat_id")
    content = data.get("content", "")
    message_type = data.get("type", "text")
    files = data.get("files", [])  # Array of file objects with id, filename, url, etc.
    
    if not chat_id:
        return
    
    # Require either content or files
    if not content and not files:
        return
    
    # Verify user is participant
    chat = chats_collection.find_one({"id": chat_id, "participants": user_id})
    if not chat:
        return
    
    # Create message
    message_id = str(uuid.uuid4())
    message_doc = {
        "id": message_id,
        "chat_id": chat_id,
        "sender_id": user_id,
        "content": content,
        "type": message_type,
        "files": files if files else [],  # Store file metadata
        "created_at": datetime.utcnow().isoformat(),
        "read_by": []
    }
    
    messages_collection.insert_one(message_doc)
    
    # Update chat last message
    last_msg_text = content if content else f"📎 {len(files)} file(s)"
    chats_collection.update_one(
        {"id": chat_id},
        {"$set": {"last_message": last_msg_text, "last_message_at": datetime.utcnow().isoformat()}}
    )
    
    # Get sender details
    sender = users_collection.find_one({"id": user_id}, {"password": 0})
    if sender:
        sender["_id"] = str(sender["_id"])
        message_doc["sender"] = sender
    
    message_doc["_id"] = str(message_doc.get("_id", ""))
    
    # Award points (more for file attachments)
    points = 5 if not files else 10
    award_points(user_id, points, "Message sent", "message")
    
    # Broadcast to chat room
    await sio.emit("new_message", message_doc, room=f"chat_{chat_id}")

@sio.event
async def typing(sid, data):
    """Handle typing indicator"""
    session = await sio.get_session(sid)
    user_id = session.get("user_id")
    
    if not user_id:
        return
    
    chat_id = data.get("chat_id")
    is_typing = data.get("is_typing", False)
    
    if not chat_id:
        return
    
    # Get user details
    user = users_collection.find_one({"id": user_id}, {"full_name": 1})
    if not user:
        return
    
    # Broadcast typing status to chat room (except sender)
    await sio.emit("user_typing", {
        "chat_id": chat_id,
        "user_id": user_id,
        "user_name": user.get("full_name", "Unknown"),
        "is_typing": is_typing
    }, room=f"chat_{chat_id}", skip_sid=sid)

@sio.event
async def webrtc_signal(sid, data):
    """Handle WebRTC signaling"""
    session = await sio.get_session(sid)
    user_id = session.get("user_id")
    
    if not user_id:
        return
    
    target_user_id = data.get("target_user_id")
    signal = data.get("signal")
    call_type = data.get("call_type", "video")
    
    if not target_user_id or not signal:
        return
    
    # Forward signal to target user
    await sio.emit("webrtc_signal", {
        "from_user_id": user_id,
        "signal": signal,
        "call_type": call_type
    }, room=f"user_{target_user_id}")

@sio.event
async def call_user(sid, data):
    """Initiate a call to another user"""
    session = await sio.get_session(sid)
    user_id = session.get("user_id")
    
    if not user_id:
        return
    
    target_user_id = data.get("target_user_id")
    call_type = data.get("call_type", "video")
    
    if not target_user_id:
        return
    
    # Get caller details
    caller = users_collection.find_one({"id": user_id}, {"_id": 1, "id": 1, "full_name": 1, "avatar": 1})
    if not caller:
        return
    
    caller["_id"] = str(caller["_id"])
    
    # Notify target user of incoming call
    await sio.emit("incoming_call", {
        "from_user": caller,
        "call_type": call_type
    }, room=f"user_{target_user_id}")

@sio.event
async def call_response(sid, data):
    """Handle call response (accept/reject)"""
    session = await sio.get_session(sid)
    user_id = session.get("user_id")
    
    if not user_id:
        return
    
    target_user_id = data.get("target_user_id")
    accepted = data.get("accepted", False)
    
    if not target_user_id:
        return
    
    # Notify caller of response
    await sio.emit("call_response", {
        "from_user_id": user_id,
        "accepted": accepted
    }, room=f"user_{target_user_id}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:socket_app", host="0.0.0.0", port=8001, reload=True)
