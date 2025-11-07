from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from app.models.models import UserInDB
from app.core.dependencies import get_current_active_user
from app.crud.data import (
    get_data_template_by_id,
    process_excel_upload,
)

router = APIRouter(prefix="/data", tags=["data"])


@router.post("/upload/{template_id}", status_code=status.HTTP_201_CREATED)
async def upload_data(
    template_id: str,
    file: UploadFile = File(...),
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
            detail="Not authorized to use this template",
        )

    if not file.filename.endswith((".xlsx", ".xls")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only Excel files (.xlsx, .xls) are supported",
        )

    try:
        content = await file.read()
        metadata, docs_created = process_excel_upload(
            file_content=content,
            template=template,
            user_id=current_user.id,
            filename=file.filename,
        )

        return {
            "message": "Data uploaded successfully",
            "data_id": metadata.id,
            "rows_processed": docs_created,
            "metadata": {
                "name": metadata.name,
                "columns": metadata.columns,
                "num_rows": metadata.num_rows,
                "source_type": metadata.source_type,
            },
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Validation error: {str(e)}",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing file: {str(e)}",
        )


@router.get("/")
async def list_data(current_user: UserInDB = Depends(get_current_active_user)):
    return {"message": "Data list endpoint - not implemented yet"}
