from typing import Optional
from app.models.models import UserCreate, UserInDB
from app.models.mongo import get_users_collection
from app.auth.security import get_password_hash
from datetime import datetime, timezone
from bson import ObjectId


def get_user_by_username(username: str) -> Optional[UserInDB]:
    users = get_users_collection()
    user_data = users.find_one({"username": username})
    if user_data:
        user_data["_id"] = str(user_data["_id"])
        return UserInDB(**user_data)
    return None


def get_user_by_email(email: str) -> Optional[UserInDB]:
    users = get_users_collection()
    user_data = users.find_one({"email": email})
    if user_data:
        user_data["_id"] = str(user_data["_id"])
        return UserInDB(**user_data)
    return None


def create_user(user: UserCreate) -> UserInDB:
    users = get_users_collection()
    user_dict = {
        "username": user.username,
        "email": user.email,
        "hashed_password": get_password_hash(user.password),
        "is_active": True,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }
    result = users.insert_one(user_dict)
    user_dict["_id"] = str(result.inserted_id)
    return UserInDB(**user_dict)


def authenticate_user(username: str, password: str):
    from app.auth.security import verify_password

    user = get_user_by_username(username)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user
