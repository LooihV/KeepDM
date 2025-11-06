from fastapi import APIRouter, Depends, HTTPException, status
from app.models.models import UserInDB
from app.core.dependencies import get_current_active_user

router = APIRouter(prefix="/data", tags=["data"])


# TODO: Implement data upload endpoints (CSV, Excel)
# TODO: Implement data retrieval endpoints
# TODO: Implement data update/delete endpoints
# TODO: Implement data metadata endpoints


@router.get("/")
async def list_data(current_user: UserInDB = Depends(get_current_active_user)):
    """List all data uploaded by the current user"""
    # TODO: Implement listing logic
    return {"message": "Data list endpoint - not implemented yet"}


# Placeholder for future endpoints:
# - POST /upload (upload CSV/Excel)
# - GET /{data_id} (get data metadata)
# - GET /{data_id}/preview (preview data rows)
# - PUT /{data_id} (update data)
# - DELETE /{data_id} (delete data)
