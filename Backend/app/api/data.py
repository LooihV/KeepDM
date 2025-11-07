from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from app.models.models import UserInDB
from app.core.dependencies import get_current_active_user
from app.crud.data import (
    get_data_template_by_id,
    get_data_metadata_by_id,
    process_excel_upload,
    analyze_data,
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


@router.get("/{data_id}/analysis")
async def get_data_analysis(
    data_id: str,
    current_user: UserInDB = Depends(get_current_active_user),
):
    metadata = get_data_metadata_by_id(data_id)
    if not metadata:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Data not found",
        )

    if metadata.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this data",
        )

    try:
        template = get_data_template_by_id(
            next(
                doc.template_id
                for doc in [metadata]
                if hasattr(metadata, "template_id")
            )
            if hasattr(metadata, "template_id")
            else None
        )

        from app.crud.data import get_data_documents_by_data_id

        documents = get_data_documents_by_data_id(data_id)
        if not documents:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No data documents found",
            )

        template_id = documents[0].template_id
        analysis = analyze_data(data_id, template_id)

        return analysis
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error analyzing data: {str(e)}",
        )


@router.get("/{data_id}/preview")
async def preview_data(
    data_id: str,
    limit: int = 50,
    current_user: UserInDB = Depends(get_current_active_user),
):
    metadata = get_data_metadata_by_id(data_id)
    if not metadata:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Data not found",
        )

    if metadata.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this data",
        )

    from app.crud.data import get_data_documents_preview

    preview_data = get_data_documents_preview(data_id, limit)

    return {
        "data_id": data_id,
        "name": metadata.name,
        "num_rows": metadata.num_rows,
        "columns": metadata.columns,
        "preview_rows": len(preview_data),
        "data": preview_data,
    }


@router.get("/")
async def list_data(current_user: UserInDB = Depends(get_current_active_user)):
    from app.crud.data import list_data_metadata_by_user

    metadata_list = list_data_metadata_by_user(current_user.id)

    return [
        {
            "data_id": m.id,
            "name": m.name,
            "num_rows": m.num_rows,
            "num_columns": len(m.columns),
            "columns": m.columns,
            "source_type": m.source_type,
            "created_at": m.created_at.isoformat(),
        }
        for m in metadata_list
    ]
