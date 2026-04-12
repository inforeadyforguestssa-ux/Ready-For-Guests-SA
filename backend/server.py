from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, HTTPException, Request, UploadFile, File, Depends, BackgroundTasks
from fastapi.responses import JSONResponse, Response
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import os
import logging
import secrets
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
import urllib.parse
from hashlib import md5
import requests

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Config
JWT_ALGORITHM = "HS256"
def get_jwt_secret() -> str:
    return os.environ["JWT_SECRET"]

# Object Storage Config
STORAGE_URL = "https://integrations.emergentagent.com/objstore/api/v1/storage"
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY")
APP_NAME = os.environ.get("APP_NAME", "ready-for-guests-connect")
storage_key = None

def init_storage():
    global storage_key
    if storage_key:
        return storage_key
    try:
        resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_KEY}, timeout=30)
        resp.raise_for_status()
        storage_key = resp.json()["storage_key"]
        logger.info("Storage initialized successfully")
        return storage_key
    except Exception as e:
        logger.error(f"Storage init failed: {e}")
        return None

def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    if not key:
        raise HTTPException(status_code=500, detail="Storage not available")
    resp = requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type},
        data=data, timeout=120
    )
    resp.raise_for_status()
    return resp.json()

def get_object(path: str) -> tuple:
    key = init_storage()
    if not key:
        raise HTTPException(status_code=500, detail="Storage not available")
    resp = requests.get(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key}, timeout=60
    )
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")

# Password hashing
def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

# JWT Token Management
def create_access_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "sub": user_id, 
        "email": email, 
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=60), 
        "type": "access"
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

def create_refresh_token(user_id: str) -> str:
    payload = {"sub": user_id, "exp": datetime.now(timezone.utc) + timedelta(days=7), "type": "refresh"}
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

# Create the main app
app = FastAPI(title="Ready for Guests Connect API")
api_router = APIRouter(prefix="/api")

# ============= MODELS =============
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str
    phone: str
    role: str = "client"  # client, team, admin

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    phone: str
    role: str
    created_at: str

class ServiceCreate(BaseModel):
    name: str
    category: str
    description: str
    price_min: float
    price_max: float
    price_unit: str = "per service"
    duration_hours: Optional[float] = None
    is_active: bool = True

class BookingCreate(BaseModel):
    service_id: str
    property_address: str
    property_area: str
    scheduled_date: str
    scheduled_time: str
    notes: Optional[str] = None
    bedrooms: Optional[int] = None
    special_requests: Optional[str] = None

class TeamCreate(BaseModel):
    name: str
    members: List[str]
    service_areas: List[str]
    specializations: List[str]

class NotificationCreate(BaseModel):
    user_id: str
    title: str
    message: str
    type: str = "info"  # info, success, warning, alert

class GalleryImageCreate(BaseModel):
    title: str
    category: str
    description: Optional[str] = None

# ============= AUTH HELPERS =============
async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return {
            "id": str(user["_id"]),
            "email": user["email"],
            "name": user["name"],
            "phone": user.get("phone", ""),
            "role": user["role"],
            "created_at": user.get("created_at", "")
        }
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def require_role(request: Request, allowed_roles: List[str]):
    user = await get_current_user(request)
    if user["role"] not in allowed_roles:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    return user

# ============= AUTH ENDPOINTS =============
@api_router.post("/auth/register")
async def register(user_data: UserRegister):
    email = user_data.email.lower()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_doc = {
        "email": email,
        "password_hash": hash_password(user_data.password),
        "name": user_data.name,
        "phone": user_data.phone,
        "role": user_data.role if user_data.role in ["client", "team"] else "client",
        "is_approved": True if user_data.role != "team" else False,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "is_active": True
    }
    
    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)
    
    access_token = create_access_token(user_id, email, user_doc["role"])
    refresh_token = create_refresh_token(user_id)
    
    response = JSONResponse(content={
        "id": user_id,
        "email": email,
        "name": user["name"],
        "phone": user.get("phone", ""),
        "role": user["role"],
        "created_at": user.get("created_at", ""),
        "access_token": access_token
    })
    
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=True, samesite="none", max_age=604800, path="/")
    return response

@api_router.post("/auth/login")
async def login(user_data: UserLogin):
    email = user_data.email.lower()
    user = await db.users.find_one({"email": email})
    
    if not user or not verify_password(user_data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    user_id = str(user["_id"])
    access_token = create_access_token(user_id, email, user["role"])
    refresh_token = create_refresh_token(user_id)
    
    response = JSONResponse(content={
        "id": user_id,
        "email": email,
        "name": user["name"],
        "phone": user.get("phone", ""),
        "role": user["role"],
        "created_at": user.get("created_at", ""),
        "access_token": access_token
    })
    
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=True, samesite="none", max_age=604800, path="/")
    return response

@api_router.post("/auth/logout")
async def logout():
    response = JSONResponse(content={"message": "Logged out successfully"})
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return response

@api_router.get("/auth/me")
async def get_me(request: Request):
    user = await get_current_user(request)
    return user

@api_router.post("/auth/refresh")
async def refresh_token(request: Request):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="No refresh token")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        
        user_id = str(user["_id"])
        access_token = create_access_token(user_id, user["email"], user["role"])
        
        response = JSONResponse(content={"message": "Token refreshed"})
        
        return response
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

# ============= SERVICES ENDPOINTS =============
@api_router.get("/services")
async def get_services():
    services = await db.services.find({"is_active": True}, {"_id": 0}).to_list(100)
    return services

@api_router.get("/services/{service_id}")
async def get_service(service_id: str):
    service = await db.services.find_one({"id": service_id}, {"_id": 0})
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    return service

@api_router.post("/services")
async def create_service(request: Request, service: ServiceCreate):
    await require_role(request, ["admin"])
    
    service_doc = {
        "id": str(uuid.uuid4()),
        "name": service.name,
        "category": service.category,
        "description": service.description,
        "price_min": service.price_min,
        "price_max": service.price_max,
        "price_unit": service.price_unit,
        "duration_hours": service.duration_hours,
        "is_active": service.is_active,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.services.insert_one(service_doc)
    del service_doc["_id"]
    return service_doc

@api_router.put("/services/{service_id}")
async def update_service(request: Request, service_id: str, service: ServiceCreate):
    await require_role(request, ["admin"])
    
    result = await db.services.update_one(
        {"id": service_id},
        {"$set": {
            "name": service.name,
            "category": service.category,
            "description": service.description,
            "price_min": service.price_min,
            "price_max": service.price_max,
            "price_unit": service.price_unit,
            "duration_hours": service.duration_hours,
            "is_active": service.is_active,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Service not found")
    return {"message": "Service updated"}

@api_router.delete("/services/{service_id}")
async def delete_service(request: Request, service_id: str):
    await require_role(request, ["admin"])
    result = await db.services.update_one({"id": service_id}, {"$set": {"is_active": False}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Service not found")
    return {"message": "Service deleted"}

# ============= BOOKINGS ENDPOINTS =============
@api_router.post("/bookings")
async def create_booking(request: Request, booking: BookingCreate):
    user = await get_current_user(request)
    
    service = await db.services.find_one({"id": booking.service_id}, {"_id": 0})
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    booking_doc = {
        "id": str(uuid.uuid4()),
        "client_id": user["id"],
        "client_name": user["name"],
        "client_email": user["email"],
        "client_phone": user["phone"],
        "service_id": booking.service_id,
        "service_name": service["name"],
        "service_category": service["category"],
        "property_address": booking.property_address,
        "property_area": booking.property_area,
        "scheduled_date": booking.scheduled_date,
        "scheduled_time": booking.scheduled_time,
        "bedrooms": booking.bedrooms,
        "notes": booking.notes,
        "special_requests": booking.special_requests,
        "price_estimate": f"R{service['price_min']} - R{service['price_max']}",
        "status": "pending",  # pending, confirmed, assigned, in_progress, completed, cancelled
        "team_id": None,
        "team_name": None,
        "payment_status": "unpaid",  # unpaid, paid, refunded
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.bookings.insert_one(booking_doc)
    del booking_doc["_id"]
    
    # Create notification for admin
    await create_notification_internal(
        user_id="admin",
        title="New Booking",
        message=f"New booking from {user['name']} for {service['name']}",
        notif_type="info"
    )
    
    return booking_doc

@api_router.get("/bookings")
async def get_bookings(request: Request, status: Optional[str] = None):
    user = await get_current_user(request)
    
    query = {}
    if user["role"] == "client":
        query["client_id"] = user["id"]
    elif user["role"] == "team":
        query["team_id"] = user["id"]
    
    if status:
        query["status"] = status
    
    bookings = await db.bookings.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    return bookings

@api_router.get("/bookings/{booking_id}")
async def get_booking(request: Request, booking_id: str):
    user = await get_current_user(request)
    
    booking = await db.bookings.find_one({"id": booking_id}, {"_id": 0})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    # Check access
    if user["role"] == "client" and booking["client_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    if user["role"] == "team" and booking.get("team_id") != user["id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return booking

@api_router.put("/bookings/{booking_id}/status")
async def update_booking_status(request: Request, booking_id: str, status: str):
    user = await get_current_user(request)
    
    valid_statuses = ["pending", "confirmed", "assigned", "in_progress", "completed", "cancelled"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    booking = await db.bookings.find_one({"id": booking_id}, {"_id": 0})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    # Role-based status updates
    if user["role"] == "team":
        if status not in ["in_progress", "completed"]:
            raise HTTPException(status_code=403, detail="Teams can only mark as in_progress or completed")
        if booking.get("team_id") != user["id"]:
            raise HTTPException(status_code=403, detail="Not assigned to this booking")
    elif user["role"] == "client":
        if status != "cancelled":
            raise HTTPException(status_code=403, detail="Clients can only cancel bookings")
    
    await db.bookings.update_one(
        {"id": booking_id},
        {"$set": {"status": status, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    # Notify relevant parties
    if status == "completed":
        await create_notification_internal(
            user_id=booking["client_id"],
            title="Job Completed",
            message=f"Your {booking['service_name']} booking has been completed!",
            notif_type="success"
        )
    
    return {"message": f"Booking status updated to {status}"}

@api_router.put("/bookings/{booking_id}/assign")
async def assign_booking(request: Request, booking_id: str, team_id: str):
    await require_role(request, ["admin"])
    
    team = await db.teams.find_one({"id": team_id}, {"_id": 0})
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    booking = await db.bookings.find_one({"id": booking_id}, {"_id": 0})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    await db.bookings.update_one(
        {"id": booking_id},
        {"$set": {
            "team_id": team_id,
            "team_name": team["name"],
            "status": "assigned",
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    # Notify team
    await create_notification_internal(
        user_id=team_id,
        title="New Job Assigned",
        message=f"You have been assigned to {booking['service_name']} at {booking['property_area']}",
        notif_type="info"
    )
    
    # Notify client
    await create_notification_internal(
        user_id=booking["client_id"],
        title="Team Assigned",
        message=f"Team {team['name']} has been assigned to your booking",
        notif_type="success"
    )
    
    return {"message": "Team assigned successfully"}

# ============= TEAMS ENDPOINTS =============
@api_router.get("/teams")
async def get_teams(request: Request):
    await require_role(request, ["admin"])
    teams = await db.teams.find({}, {"_id": 0}).to_list(100)
    return teams

@api_router.post("/teams")
async def create_team(request: Request, team: TeamCreate):
    await require_role(request, ["admin"])
    
    team_doc = {
        "id": str(uuid.uuid4()),
        "name": team.name,
        "members": team.members,
        "service_areas": team.service_areas,
        "specializations": team.specializations,
        "is_active": True,
        "rating": 5.0,
        "jobs_completed": 0,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.teams.insert_one(team_doc)
    del team_doc["_id"]
    return team_doc

@api_router.get("/teams/{team_id}")
async def get_team(request: Request, team_id: str):
    user = await get_current_user(request)
    
    team = await db.teams.find_one({"id": team_id}, {"_id": 0})
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    return team

@api_router.put("/teams/{team_id}")
async def update_team(request: Request, team_id: str, team: TeamCreate):
    await require_role(request, ["admin"])
    
    result = await db.teams.update_one(
        {"id": team_id},
        {"$set": {
            "name": team.name,
            "members": team.members,
            "service_areas": team.service_areas,
            "specializations": team.specializations,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Team not found")
    return {"message": "Team updated"}

@api_router.delete("/teams/{team_id}")
async def delete_team(request: Request, team_id: str):
    await require_role(request, ["admin"])
    result = await db.teams.update_one({"id": team_id}, {"$set": {"is_active": False}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Team not found")
    return {"message": "Team deleted"}

# ============= NOTIFICATIONS ENDPOINTS =============
async def create_notification_internal(user_id: str, title: str, message: str, notif_type: str = "info"):
    notif_doc = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "title": title,
        "message": message,
        "type": notif_type,
        "is_read": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.notifications.insert_one(notif_doc)
    return notif_doc

@api_router.get("/notifications")
async def get_notifications(request: Request):
    user = await get_current_user(request)
    
    query = {"user_id": {"$in": [user["id"], "admin" if user["role"] == "admin" else user["id"]]}}
    notifications = await db.notifications.find(query, {"_id": 0}).sort("created_at", -1).to_list(50)
    return notifications

@api_router.put("/notifications/{notif_id}/read")
async def mark_notification_read(request: Request, notif_id: str):
    await get_current_user(request)
    await db.notifications.update_one({"id": notif_id}, {"$set": {"is_read": True}})
    return {"message": "Notification marked as read"}

@api_router.put("/notifications/read-all")
async def mark_all_notifications_read(request: Request):
    user = await get_current_user(request)
    await db.notifications.update_many(
        {"user_id": {"$in": [user["id"], "admin" if user["role"] == "admin" else user["id"]]}},
        {"$set": {"is_read": True}}
    )
    return {"message": "All notifications marked as read"}

# ============= GALLERY ENDPOINTS =============
@api_router.get("/gallery")
async def get_gallery():
    images = await db.gallery.find({"is_deleted": False}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return images

@api_router.post("/gallery/upload")
async def upload_gallery_image(
    request: Request,
    file: UploadFile = File(...),
    title: str = "",
    category: str = "general",
    description: str = ""
):
    await require_role(request, ["admin"])
    
    ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    path = f"{APP_NAME}/gallery/{uuid.uuid4()}.{ext}"
    data = await file.read()
    
    result = put_object(path, data, file.content_type or "image/jpeg")
    
    image_doc = {
        "id": str(uuid.uuid4()),
        "storage_path": result["path"],
        "original_filename": file.filename,
        "title": title or file.filename,
        "category": category,
        "description": description,
        "content_type": file.content_type,
        "size": result.get("size", len(data)),
        "is_deleted": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.gallery.insert_one(image_doc)
    del image_doc["_id"]
    return image_doc

@api_router.get("/gallery/{image_id}/download")
async def download_gallery_image(image_id: str):
    record = await db.gallery.find_one({"id": image_id, "is_deleted": False}, {"_id": 0})
    if not record:
        raise HTTPException(status_code=404, detail="Image not found")
    
    data, content_type = get_object(record["storage_path"])
    return Response(content=data, media_type=record.get("content_type", content_type))

@api_router.delete("/gallery/{image_id}")
async def delete_gallery_image(request: Request, image_id: str):
    await require_role(request, ["admin"])
    result = await db.gallery.update_one({"id": image_id}, {"$set": {"is_deleted": True}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Image not found")
    return {"message": "Image deleted"}

# ============= JOB PHOTOS ENDPOINTS =============
@api_router.post("/bookings/{booking_id}/photos")
async def upload_job_photo(
    request: Request,
    booking_id: str,
    file: UploadFile = File(...),
    photo_type: str = "completion"  # before, after, completion
):
    user = await get_current_user(request)
    
    booking = await db.bookings.find_one({"id": booking_id}, {"_id": 0})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    if user["role"] == "team" and booking.get("team_id") != user["id"]:
        raise HTTPException(status_code=403, detail="Not assigned to this booking")
    
    ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    path = f"{APP_NAME}/jobs/{booking_id}/{photo_type}_{uuid.uuid4()}.{ext}"
    data = await file.read()
    
    result = put_object(path, data, file.content_type or "image/jpeg")
    
    photo_doc = {
        "id": str(uuid.uuid4()),
        "booking_id": booking_id,
        "storage_path": result["path"],
        "photo_type": photo_type,
        "uploaded_by": user["id"],
        "uploaded_by_name": user["name"],
        "content_type": file.content_type,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.job_photos.insert_one(photo_doc)
    del photo_doc["_id"]
    return photo_doc

@api_router.get("/bookings/{booking_id}/photos")
async def get_job_photos(request: Request, booking_id: str):
    user = await get_current_user(request)
    
    booking = await db.bookings.find_one({"id": booking_id}, {"_id": 0})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    photos = await db.job_photos.find({"booking_id": booking_id}, {"_id": 0}).to_list(50)
    return photos

@api_router.get("/job-photos/{photo_id}/download")
async def download_job_photo(request: Request, photo_id: str):
    await get_current_user(request)
    
    record = await db.job_photos.find_one({"id": photo_id}, {"_id": 0})
    if not record:
        raise HTTPException(status_code=404, detail="Photo not found")
    
    data, content_type = get_object(record["storage_path"])
    return Response(content=data, media_type=record.get("content_type", content_type))

# ============= ADMIN DASHBOARD ENDPOINTS =============
@api_router.get("/admin/stats")
async def get_admin_stats(request: Request):
    await require_role(request, ["admin"])
    
    total_bookings = await db.bookings.count_documents({})
    pending_bookings = await db.bookings.count_documents({"status": "pending"})
    completed_bookings = await db.bookings.count_documents({"status": "completed"})
    total_clients = await db.users.count_documents({"role": "client"})
    total_teams = await db.teams.count_documents({"is_active": True})
    
    return {
        "total_bookings": total_bookings,
        "pending_bookings": pending_bookings,
        "completed_bookings": completed_bookings,
        "total_clients": total_clients,
        "total_teams": total_teams
    }

@api_router.get("/admin/users")
async def get_all_users(request: Request):
    await require_role(request, ["admin"])
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(500)
    return users

# ============= PAYFAST INTEGRATION =============
PAYFAST_SIGNATURE_FIELD_ORDER = [
    "merchant_id", "merchant_key", "return_url", "cancel_url", "notify_url",
    "name_first", "name_last", "email_address", "cell_number",
    "m_payment_id", "amount", "item_name", "item_description",
    "custom_str1", "custom_str2", "custom_str3", "custom_str4", "custom_str5"
]

def generate_payfast_signature(data: dict, passphrase: str) -> str:
    filtered_data = {}
    for key, value in data.items():
        if value and str(value).strip():
            filtered_data[key] = str(value).strip()
    
    ordered_keys = []
    for priority_key in PAYFAST_SIGNATURE_FIELD_ORDER:
        if priority_key in filtered_data:
            ordered_keys.append(priority_key)
    
    for remaining_key in sorted(filtered_data.keys()):
        if remaining_key not in ordered_keys:
            ordered_keys.append(remaining_key)
    
    signature_string = ""
    for key in ordered_keys:
        if key != "signature":
            value = filtered_data[key]
            encoded_value = urllib.parse.quote_plus(str(value))
            signature_string += f"{key}={encoded_value}&"
    
    signature_string = signature_string.rstrip("&")
    if passphrase:
        signature_string += f"&passphrase={urllib.parse.quote_plus(passphrase)}"
    
    return md5(signature_string.encode()).hexdigest()

@api_router.post("/payments/initiate/{booking_id}")
async def initiate_payment(request: Request, booking_id: str):
    user = await get_current_user(request)
    
    booking = await db.bookings.find_one({"id": booking_id}, {"_id": 0})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    if booking["client_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Extract amount (use minimum from price range)
    price_str = booking.get("price_estimate", "R0 - R0")
    amount = float(price_str.replace("R", "").split(" - ")[0].strip())
    
    frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:3000")
    backend_url = os.environ.get("FRONTEND_URL", "http://localhost:8001")
    
    payment_data = {
        "merchant_id": os.environ.get("PAYFAST_MERCHANT_ID"),
        "merchant_key": os.environ.get("PAYFAST_MERCHANT_KEY"),
        "return_url": f"{frontend_url}/payment/success?booking_id={booking_id}",
        "cancel_url": f"{frontend_url}/payment/cancel?booking_id={booking_id}",
        "notify_url": f"{backend_url}/api/payments/webhook",
        "name_first": user["name"].split()[0] if user["name"] else "Customer",
        "name_last": user["name"].split()[-1] if len(user["name"].split()) > 1 else "",
        "email_address": user["email"],
        "cell_number": user.get("phone", ""),
        "m_payment_id": booking_id,
        "amount": f"{amount:.2f}",
        "item_name": f"Ready for Guests - {booking['service_name']}",
        "item_description": f"{booking['service_name']} at {booking['property_area']}",
        "custom_str1": booking_id
    }
    
    passphrase = os.environ.get("PAYFAST_PASSPHRASE", "")
    if passphrase:
        signature = generate_payfast_signature(payment_data, passphrase)
        payment_data["signature"] = signature
    
    payfast_url = os.environ.get("PAYFAST_BASE_URL", "https://sandbox.payfast.co.za")
    
    return {
        "payment_url": f"{payfast_url}/eng/process",
        "payment_data": payment_data
    }

@api_router.post("/payments/webhook")
async def payfast_webhook(request: Request):
    form_data = await request.form()
    form_dict = dict(form_data)
    
    payment_id = form_dict.get("m_payment_id")
    payment_status = form_dict.get("payment_status")
    
    logger.info(f"PayFast webhook received for booking {payment_id}: {payment_status}")
    
    if payment_status == "COMPLETE":
        await db.bookings.update_one(
            {"id": payment_id},
            {"$set": {
                "payment_status": "paid",
                "status": "confirmed",
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        
        booking = await db.bookings.find_one({"id": payment_id}, {"_id": 0})
        if booking:
            await create_notification_internal(
                user_id=booking["client_id"],
                title="Payment Received",
                message=f"Payment confirmed for your {booking['service_name']} booking!",
                notif_type="success"
            )
    
    return {"status": "ok"}

# ============= SEED DATA =============
async def seed_services():
    count = await db.services.count_documents({})
    if count > 0:
        return
    
    services = [
        # Standard Cleaning
        {"id": str(uuid.uuid4()), "name": "Quickie Clean", "category": "Standard Cleaning", "description": "Ideal for quick touch-ups between guests or busy days.", "price_min": 250, "price_max": 250, "price_unit": "per hour", "duration_hours": 1, "is_active": True},
        {"id": str(uuid.uuid4()), "name": "Daily Cleaning", "category": "Standard Cleaning", "description": "Regular daily cleaning service for your property.", "price_min": 250, "price_max": 650, "price_unit": "per service", "duration_hours": 2, "is_active": True},
        {"id": str(uuid.uuid4()), "name": "Weekly Cleaning", "category": "Standard Cleaning", "description": "Weekly maintenance cleaning to keep your property fresh.", "price_min": 300, "price_max": 500, "price_unit": "per service", "duration_hours": 3, "is_active": True},
        {"id": str(uuid.uuid4()), "name": "Monthly Cleaning", "category": "Standard Cleaning", "description": "Comprehensive monthly cleaning service.", "price_min": 450, "price_max": 750, "price_unit": "per service", "duration_hours": 4, "is_active": True},
        {"id": str(uuid.uuid4()), "name": "Pre-Holiday Cleaning", "category": "Standard Cleaning", "description": "Prepare your property for incoming guests.", "price_min": 400, "price_max": 750, "price_unit": "per service", "duration_hours": 3, "is_active": True},
        {"id": str(uuid.uuid4()), "name": "Post-Holiday Cleaning", "category": "Standard Cleaning", "description": "Thorough cleaning after guests checkout.", "price_min": 500, "price_max": 900, "price_unit": "per service", "duration_hours": 4, "is_active": True},
        {"id": str(uuid.uuid4()), "name": "Refreshing Clean", "category": "Standard Cleaning", "description": "Light refresh cleaning between stays.", "price_min": 200, "price_max": 300, "price_unit": "per service", "duration_hours": 1.5, "is_active": True},
        
        # Deep Cleaning
        {"id": str(uuid.uuid4()), "name": "Deep Clean (1-2 Bedroom)", "category": "Deep Cleaning", "description": "Intensive deep cleaning for smaller properties.", "price_min": 800, "price_max": 1200, "price_unit": "per service", "duration_hours": 5, "is_active": True},
        {"id": str(uuid.uuid4()), "name": "Deep Clean (3-4 Bedroom)", "category": "Deep Cleaning", "description": "Intensive deep cleaning for larger properties.", "price_min": 1200, "price_max": 1800, "price_unit": "per service", "duration_hours": 7, "is_active": True},
        {"id": str(uuid.uuid4()), "name": "Spring Clean", "category": "Deep Cleaning", "description": "Seasonal deep clean covering every corner.", "price_min": 1200, "price_max": 2500, "price_unit": "per service", "duration_hours": 8, "is_active": True},
        
        # Glow Up Spa
        {"id": str(uuid.uuid4()), "name": "Glow Up Spa (1-2 Bedroom)", "category": "Premium Service", "description": "Full transformation including appliances, cupboards, windows and detailed finishing.", "price_min": 1200, "price_max": 1800, "price_unit": "per service", "duration_hours": 6, "is_active": True},
        {"id": str(uuid.uuid4()), "name": "Glow Up Spa (3-4 Bedroom)", "category": "Premium Service", "description": "Premium full transformation for larger properties.", "price_min": 1800, "price_max": 2800, "price_unit": "per service", "duration_hours": 9, "is_active": True},
        
        # Specialised Cleaning
        {"id": str(uuid.uuid4()), "name": "Upholstery Cleaning", "category": "Specialised Cleaning", "description": "Professional cleaning for sofas and fabric furniture.", "price_min": 250, "price_max": 500, "price_unit": "per service", "is_active": True},
        {"id": str(uuid.uuid4()), "name": "Carpet Cleaning", "category": "Specialised Cleaning", "description": "Deep carpet cleaning service.", "price_min": 20, "price_max": 35, "price_unit": "per m²", "is_active": True},
        {"id": str(uuid.uuid4()), "name": "Mattress Cleaning", "category": "Specialised Cleaning", "description": "Hygienic mattress cleaning and sanitising.", "price_min": 150, "price_max": 300, "price_unit": "per mattress", "is_active": True},
        {"id": str(uuid.uuid4()), "name": "Upholstery Steam Sanitising", "category": "Specialised Cleaning", "description": "Steam sanitisation for upholstered furniture.", "price_min": 300, "price_max": 600, "price_unit": "per service", "is_active": True},
        {"id": str(uuid.uuid4()), "name": "Carpet Steam Sanitising", "category": "Specialised Cleaning", "description": "Deep steam sanitisation for carpets.", "price_min": 25, "price_max": 40, "price_unit": "per m²", "is_active": True},
        {"id": str(uuid.uuid4()), "name": "Floor Steam Sanitising", "category": "Specialised Cleaning", "description": "Floor sanitisation using steam technology.", "price_min": 10, "price_max": 20, "price_unit": "per m²", "is_active": True},
        {"id": str(uuid.uuid4()), "name": "Mattress Steam Sanitising", "category": "Specialised Cleaning", "description": "Complete mattress steam treatment.", "price_min": 200, "price_max": 400, "price_unit": "per mattress", "is_active": True},
        {"id": str(uuid.uuid4()), "name": "Curtain Cleaning", "category": "Specialised Cleaning", "description": "Remove and rehang curtains with cleaning.", "price_min": 300, "price_max": 600, "price_unit": "per room", "is_active": True},
        
        # Add-On Services
        {"id": str(uuid.uuid4()), "name": "Window Cleaning", "category": "Add-On Services", "description": "Interior and exterior window cleaning.", "price_min": 150, "price_max": 600, "price_unit": "per service", "is_active": True},
        {"id": str(uuid.uuid4()), "name": "Appliance Cleaning", "category": "Add-On Services", "description": "Deep cleaning of kitchen appliances.", "price_min": 50, "price_max": 250, "price_unit": "per appliance", "is_active": True},
        {"id": str(uuid.uuid4()), "name": "Laundry Service", "category": "Add-On Services", "description": "Wash, dry and fold service.", "price_min": 80, "price_max": 120, "price_unit": "per load", "is_active": True},
        {"id": str(uuid.uuid4()), "name": "Keyholder Service", "category": "Add-On Services", "description": "Trusted keyholding and property access management.", "price_min": 150, "price_max": 250, "price_unit": "per month", "is_active": True},
        {"id": str(uuid.uuid4()), "name": "Grocery Stocking", "category": "Add-On Services", "description": "Pre-arrival grocery shopping and stocking.", "price_min": 100, "price_max": 150, "price_unit": "per service", "is_active": True},
        
        # Fresh Air Property Care
        {"id": str(uuid.uuid4()), "name": "Dehumidifying Service", "category": "Fresh Air Property Care", "description": "Professional dehumidifying and air freshening for your property.", "price_min": 300, "price_max": 600, "price_unit": "per service", "duration_hours": 4, "is_active": True},
        
        # Guest Ready Setup
        {"id": str(uuid.uuid4()), "name": "Guest Ready Setup", "category": "Guest Ready Setup", "description": "Complete property setup with fresh linens, welcome amenities and final touches.", "price_min": 250, "price_max": 500, "price_unit": "per service", "duration_hours": 2, "is_active": True}
    ]
    
    for service in services:
        service["created_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.services.insert_many(services)
    logger.info(f"Seeded {len(services)} services")

async def seed_admin():
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@example.com").lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        hashed = hash_password(admin_password)
        await db.users.insert_one({
            "email": admin_email,
            "password_hash": hashed,
            "name": "Admin",
            "phone": "072 195 3829",
            "role": "admin",
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        logger.info(f"Admin user created: {admin_email}")
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one(
            {"email": admin_email},
            {"$set": {"password_hash": hash_password(admin_password)}}
        )
        logger.info(f"Admin password updated: {admin_email}")

async def seed_default_team():
    count = await db.teams.count_documents({})
    if count > 0:
        return
    
    team_doc = {
        "id": str(uuid.uuid4()),
        "name": "Hibiscus Housekeepers",
        "members": ["Sandra"],
        "service_areas": ["Margate", "Ramsgate", "Shelly Beach", "St Michael's On Sea", "Oslo Beach", "Uvongo", "Umtentweni", "Port Shepstone", "Port Edward"],
        "specializations": ["Professional Cleaning", "Fresh Air Property Care", "Guest Ready Setup"],
        "equipment": ["Steamer", "Vacuum Cleaner"],
        "is_active": True,
        "rating": 5.0,
        "jobs_completed": 0,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.teams.insert_one(team_doc)
    logger.info("Default team created")

async def seed_gallery():
    count = await db.gallery.count_documents({})
    if count > 0:
        return
    
    # Use the user-provided images
    gallery_images = [
        {"id": str(uuid.uuid4()), "storage_path": "", "url": "https://customer-assets.emergentagent.com/job_guest-ready-connect/artifacts/2yvsojec_WhatsApp%20Image%202026-04-05%20at%208.07.32%20PM%20%281%29.jpeg", "title": "Modern Living Room", "category": "living_room", "description": "Elegantly styled modern living space", "is_deleted": False, "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": str(uuid.uuid4()), "storage_path": "", "url": "https://customer-assets.emergentagent.com/job_guest-ready-connect/artifacts/29uuojn5_WhatsApp%20Image%202026-04-05%20at%208.07.32%20PM%20%282%29.jpeg", "title": "Pristine Bathroom", "category": "bathroom", "description": "Clean and stylish bathroom design", "is_deleted": False, "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": str(uuid.uuid4()), "storage_path": "", "url": "https://customer-assets.emergentagent.com/job_guest-ready-connect/artifacts/rlbqt0mt_WhatsApp%20Image%202026-04-05%20at%208.07.32%20PM%20%283%29.jpeg", "title": "Cozy Bedroom", "category": "bedroom", "description": "Comfortable and inviting bedroom setup", "is_deleted": False, "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": str(uuid.uuid4()), "storage_path": "", "url": "https://customer-assets.emergentagent.com/job_guest-ready-connect/artifacts/x663o2v3_WhatsApp%20Image%202026-04-05%20at%208.07.32%20PM.jpeg", "title": "Elegant Dining Room", "category": "dining_room", "description": "Sophisticated dining area ready for guests", "is_deleted": False, "created_at": datetime.now(timezone.utc).isoformat()}
    ]
    
    await db.gallery.insert_many(gallery_images)
    logger.info(f"Seeded {len(gallery_images)} gallery images")

# ============= HEALTH & ROOT =============
@api_router.get("/")
async def root():
    return {"message": "Ready for Guests Connect API", "version": "1.0.0"}

@api_router.get("/health")
async def health():
    return {"status": "healthy"}

# Include router
app.include_router(api_router)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=[os.environ.get('FRONTEND_URL', 'http://localhost:3000')],allow_methods=["*"],
    allow_headers=["*"],
)

# Startup
@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.services.create_index("id")
    await db.bookings.create_index("id")
    await db.bookings.create_index("client_id")
    await db.teams.create_index("id")
    await db.notifications.create_index("user_id")
    await db.gallery.create_index("id")
    
    try:
        init_storage()
    except Exception as e:
        logger.warning(f"Storage init failed: {e}")
    
    await seed_admin()
    await seed_services()
    await seed_default_team()
    await seed_gallery()
    logger.info("Server started successfully")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
