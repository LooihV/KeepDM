from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import List, Optional, Any
from app.models.models import UserInDB, DashboardConfig, VisualizationWidget
from app.core.dependencies import get_current_active_user
from app.crud.dashboard import (
    create_dashboard,
    get_dashboard_by_id,
    list_dashboards_by_user,
    update_dashboard,
    delete_dashboard,
    get_dashboard_data,
)
from app.crud.data import get_data_metadata_by_id, get_data_template_by_id

router = APIRouter(prefix="/dashboards", tags=["dashboards"])


class DashboardCreate(BaseModel):
    template_id: str
    data_id: str
    name: str = Field(..., min_length=1, max_length=100)
    widgets: List[dict[str, Any]]


class DashboardUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    widgets: Optional[List[dict[str, Any]]] = None


class DashboardResponse(BaseModel):
    id: str = Field(alias="_id")
    user_id: str
    template_id: str
    data_id: str
    name: str
    layout_type: str
    widgets: List[dict[str, Any]]
    created_at: str
    updated_at: str

    class Config:
        populate_by_name = True


@router.post("/", response_model=DashboardResponse, status_code=status.HTTP_201_CREATED)
async def create_new_dashboard(
    dashboard_data: DashboardCreate,
    current_user: UserInDB = Depends(get_current_active_user),
):
    metadata = get_data_metadata_by_id(dashboard_data.data_id)
    if not metadata:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Data not found",
        )

    if metadata.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to use this data",
        )

    template = get_data_template_by_id(dashboard_data.template_id)
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found",
        )

    if template.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to use this template",
        )

    dashboard = create_dashboard(
        user_id=current_user.id,
        template_id=dashboard_data.template_id,
        data_id=dashboard_data.data_id,
        name=dashboard_data.name,
        widgets=dashboard_data.widgets,
    )

    return DashboardResponse(
        _id=dashboard.id,
        user_id=dashboard.user_id,
        template_id=dashboard.template_id,
        data_id=dashboard.data_id,
        name=dashboard.name,
        layout_type=dashboard.layout_type,
        widgets=[w.dict() if hasattr(w, "dict") else w for w in dashboard.widgets],
        created_at=dashboard.created_at.isoformat(),
        updated_at=dashboard.updated_at.isoformat(),
    )


@router.get("/", response_model=List[DashboardResponse])
async def list_dashboards(current_user: UserInDB = Depends(get_current_active_user)):
    dashboards = list_dashboards_by_user(current_user.id)
    return [
        DashboardResponse(
            _id=d.id,
            user_id=d.user_id,
            template_id=d.template_id,
            data_id=d.data_id,
            name=d.name,
            layout_type=d.layout_type,
            widgets=[w.dict() if hasattr(w, "dict") else w for w in d.widgets],
            created_at=d.created_at.isoformat(),
            updated_at=d.updated_at.isoformat(),
        )
        for d in dashboards
    ]


@router.get("/{dashboard_id}", response_model=DashboardResponse)
async def get_dashboard(
    dashboard_id: str,
    current_user: UserInDB = Depends(get_current_active_user),
):
    dashboard = get_dashboard_by_id(dashboard_id)
    if not dashboard:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dashboard not found",
        )

    if dashboard.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this dashboard",
        )

    return DashboardResponse(
        _id=dashboard.id,
        user_id=dashboard.user_id,
        template_id=dashboard.template_id,
        data_id=dashboard.data_id,
        name=dashboard.name,
        layout_type=dashboard.layout_type,
        widgets=[w.dict() if hasattr(w, "dict") else w for w in dashboard.widgets],
        created_at=dashboard.created_at.isoformat(),
        updated_at=dashboard.updated_at.isoformat(),
    )


@router.put("/{dashboard_id}", response_model=DashboardResponse)
async def update_existing_dashboard(
    dashboard_id: str,
    dashboard_data: DashboardUpdate,
    current_user: UserInDB = Depends(get_current_active_user),
):
    existing = get_dashboard_by_id(dashboard_id)
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dashboard not found",
        )

    if existing.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this dashboard",
        )

    updated = update_dashboard(
        dashboard_id=dashboard_id,
        name=dashboard_data.name,
        widgets=dashboard_data.widgets,
    )

    if not updated:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update",
        )

    return DashboardResponse(
        _id=updated.id,
        user_id=updated.user_id,
        template_id=updated.template_id,
        data_id=updated.data_id,
        name=updated.name,
        layout_type=updated.layout_type,
        widgets=[w.dict() if hasattr(w, "dict") else w for w in updated.widgets],
        created_at=updated.created_at.isoformat(),
        updated_at=updated.updated_at.isoformat(),
    )


@router.delete("/{dashboard_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_existing_dashboard(
    dashboard_id: str,
    current_user: UserInDB = Depends(get_current_active_user),
):
    existing = get_dashboard_by_id(dashboard_id)
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dashboard not found",
        )

    if existing.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this dashboard",
        )

    deleted = delete_dashboard(dashboard_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete dashboard",
        )


@router.get("/{dashboard_id}/data")
async def get_dashboard_visualization_data(
    dashboard_id: str,
    current_user: UserInDB = Depends(get_current_active_user),
):
    dashboard = get_dashboard_by_id(dashboard_id)
    if not dashboard:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dashboard not found",
        )

    if dashboard.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this dashboard",
        )

    try:
        data = get_dashboard_data(dashboard_id)
        return data
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing dashboard data: {str(e)}",
        )
