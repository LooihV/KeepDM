from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from app.models.models import UserInDB, DataTemplate
from app.core.dependencies import get_current_active_user
from app.crud.data import (
    create_data_template,
    get_data_template_by_id,
    list_data_templates_by_user,
    update_data_template,
    delete_data_template,
    generate_xlsx_from_template,
)
from typing import List, Optional

router = APIRouter(prefix="/templates", tags=["templates"])


class TemplateCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    columns: dict[str, str]


class TemplateUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    columns: Optional[dict[str, str]] = None


class TemplateResponse(BaseModel):
    id: str = Field(alias="_id")
    user_id: str
    name: str
    columns: dict[str, str]
    created_at: str
    updated_at: str

    class Config:
        populate_by_name = True


@router.post("/", response_model=TemplateResponse, status_code=status.HTTP_201_CREATED)
async def create_template(
    template_data: TemplateCreate,
    current_user: UserInDB = Depends(get_current_active_user),
):
    template = create_data_template(
        user_id=current_user.id,
        name=template_data.name,
        columns=template_data.columns,
    )
    return TemplateResponse(
        _id=template.id,
        user_id=template.user_id,
        name=template.name,
        columns=template.columns,
        created_at=template.created_at.isoformat(),
        updated_at=template.updated_at.isoformat(),
    )


@router.get("/", response_model=List[TemplateResponse])
async def list_templates(current_user: UserInDB = Depends(get_current_active_user)):
    templates = list_data_templates_by_user(current_user.id)
    return [
        TemplateResponse(
            _id=t.id,
            user_id=t.user_id,
            name=t.name,
            columns=t.columns,
            created_at=t.created_at.isoformat(),
            updated_at=t.updated_at.isoformat(),
        )
        for t in templates
    ]


@router.get("/{template_id}", response_model=TemplateResponse)
async def get_template(
    template_id: str,
    current_user: UserInDB = Depends(get_current_active_user),
):
    template = get_data_template_by_id(template_id)
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found",
        )
    if template.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this template",
        )
    return TemplateResponse(
        _id=template.id,
        user_id=template.user_id,
        name=template.name,
        columns=template.columns,
        created_at=template.created_at.isoformat(),
        updated_at=template.updated_at.isoformat(),
    )


@router.put("/{template_id}", response_model=TemplateResponse)
async def update_template(
    template_id: str,
    template_data: TemplateUpdate,
    current_user: UserInDB = Depends(get_current_active_user),
):
    existing = get_data_template_by_id(template_id)
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found",
        )
    if existing.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this template",
        )

    updated = update_data_template(
        template_id=template_id,
        name=template_data.name,
        columns=template_data.columns,
    )
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update",
        )

    return TemplateResponse(
        _id=updated.id,
        user_id=updated.user_id,
        name=updated.name,
        columns=updated.columns,
        created_at=updated.created_at.isoformat(),
        updated_at=updated.updated_at.isoformat(),
    )


@router.delete("/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_template(
    template_id: str,
    current_user: UserInDB = Depends(get_current_active_user),
):
    existing = get_data_template_by_id(template_id)
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found",
        )
    if existing.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this template",
        )

    deleted = delete_data_template(template_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete template",
        )


@router.get("/{template_id}/download")
async def download_template_excel(
    template_id: str,
    current_user: UserInDB = Depends(get_current_active_user),
):
    template = get_data_template_by_id(template_id)
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found",
        )
    if template.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this template",
        )

    excel_file = generate_xlsx_from_template(template)
    filename = f"{template.name.replace(' ', '_')}_template.xlsx"

    return StreamingResponse(
        excel_file,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )
