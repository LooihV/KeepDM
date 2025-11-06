from datetime import datetime, timezone
from pydantic import BaseModel, Field, EmailStr
from typing import Optional, Any
from enum import Enum


# Enums
class SourceType(str, Enum):
    CSV = "csv"
    EXCEL = "excel"


# User models
class UserInDB(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    username: str
    email: EmailStr
    hashed_password: str
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Config:
        populate_by_name = True


class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=8)


class UserResponse(BaseModel):
    id: str = Field(alias="_id")
    username: str
    email: EmailStr
    is_active: bool
    created_at: datetime

    class Config:
        populate_by_name = True


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


# Data models
class DataMetadata(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    user_id: str
    name: str = Field(..., min_length=1, max_length=100)
    columns: list[str]
    dtypes: dict[str, str]
    num_rows: int = Field(..., ge=0)
    source_type: SourceType
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Config:
        populate_by_name = True
        use_enum_values = True


class DataTemplate(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    user_id: str
    name: str = Field(..., min_length=1, max_length=100)
    columns: dict[str, str]
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Config:
        populate_by_name = True


class DataDocument(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    user_id: str
    data_id: str
    template_id: str
    row_data: dict[str, Any]
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Config:
        populate_by_name = True


class DashboardConfig(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    user_id: str
    template_id: str
    data_id: str
    name: str = Field(..., min_length=1, max_length=100)
    config_json: dict[str, Any]
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Config:
        populate_by_name = True
