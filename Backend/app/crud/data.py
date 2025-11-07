from typing import Optional, List, Dict, Any
from io import BytesIO
from app.models.models import DataMetadata, DataDocument, DataTemplate, SourceType
from app.models.mongo import get_database
from datetime import datetime, timezone
from bson import ObjectId
import pandas as pd
from openpyxl.comments import Comment


# Template CRUD operations
def create_data_template(
    user_id: str,
    name: str,
    columns: dict[str, str],
) -> DataTemplate:
    """Create a new data template"""
    db = get_database()
    data_templates = db.data_templates

    now = datetime.now(timezone.utc)
    template_dict = {
        "user_id": user_id,
        "name": name,
        "columns": columns,
        "created_at": now,
        "updated_at": now,
    }
    result = data_templates.insert_one(template_dict)
    template_dict["_id"] = str(result.inserted_id)
    return DataTemplate(**template_dict)


def get_data_template_by_id(template_id: str) -> Optional[DataTemplate]:
    """Retrieve a data template by its ID"""
    db = get_database()
    data_templates = db.data_templates

    doc = data_templates.find_one({"_id": ObjectId(template_id)})
    if doc:
        doc["_id"] = str(doc["_id"])
        return DataTemplate(**doc)
    return None


def list_data_templates_by_user(user_id: str) -> List[DataTemplate]:
    """List all data templates for a given user"""
    db = get_database()
    data_templates = db.data_templates

    docs = data_templates.find({"user_id": user_id})
    templates = []
    for doc in docs:
        doc["_id"] = str(doc["_id"])
        templates.append(DataTemplate(**doc))
    return templates


def update_data_template(
    template_id: str,
    name: Optional[str] = None,
    columns: Optional[dict[str, str]] = None,
) -> Optional[DataTemplate]:
    """Update an existing data template"""
    db = get_database()
    data_templates = db.data_templates

    update_fields = {}
    if name is not None:
        update_fields["name"] = name
    if columns is not None:
        update_fields["columns"] = columns
    if not update_fields:
        return None  # Nothing to update

    update_fields["updated_at"] = datetime.now(timezone.utc)
    result = data_templates.update_one(
        {"_id": ObjectId(template_id)},
        {"$set": update_fields},
    )
    if result.modified_count == 1:
        return get_data_template_by_id(template_id)
    return None


def delete_data_template(template_id: str) -> bool:
    """Delete a data template by its ID"""
    db = get_database()
    data_templates = db.data_templates

    result = data_templates.delete_one({"_id": ObjectId(template_id)})
    return result.deleted_count == 1


def generate_xlsx_from_template(template: DataTemplate) -> BytesIO:
    """Generate Excel file from template in memory"""
    df = pd.DataFrame(columns=list(template.columns.keys()))

    output = BytesIO()
    with pd.ExcelWriter(output, engine="openpyxl") as writer:
        df.to_excel(writer, index=False, sheet_name="Data")

        worksheet = writer.sheets["Data"]
        for idx, (col_name, col_type) in enumerate(template.columns.items(), 1):
            cell = worksheet.cell(row=1, column=idx)
            cell.comment = Comment(f"Type: {col_type}", "KeepDM")

    output.seek(0)
    return output


def validate_dataframe_structure(
    df: pd.DataFrame, template: DataTemplate
) -> tuple[bool, Optional[str]]:
    """Validate DataFrame columns match template"""
    template_columns = set(template.columns.keys())
    df_columns = set(df.columns)

    if template_columns != df_columns:
        missing = template_columns - df_columns
        extra = df_columns - template_columns
        error_parts = []
        if missing:
            error_parts.append(f"Missing columns: {', '.join(missing)}")
        if extra:
            error_parts.append(f"Extra columns: {', '.join(extra)}")
        return False, "; ".join(error_parts)

    return True, None


def create_data_metadata(
    user_id: str,
    name: str,
    columns: list[str],
    dtypes: dict[str, str],
    num_rows: int,
    source_type: SourceType,
) -> DataMetadata:
    """Create metadata for uploaded data"""
    db = get_database()
    data_metadata = db.data_metadata

    now = datetime.now(timezone.utc)
    metadata_dict = {
        "user_id": user_id,
        "name": name,
        "columns": columns,
        "dtypes": dtypes,
        "num_rows": num_rows,
        "source_type": source_type,
        "created_at": now,
        "updated_at": now,
    }
    result = data_metadata.insert_one(metadata_dict)
    metadata_dict["_id"] = str(result.inserted_id)
    return DataMetadata(**metadata_dict)


def create_data_documents(
    user_id: str,
    data_id: str,
    template_id: str,
    rows: List[Dict[str, Any]],
) -> int:
    """Create multiple data documents from rows"""
    db = get_database()
    data_documents = db.data_documents

    now = datetime.now(timezone.utc)
    documents = []
    for row_data in rows:
        doc = {
            "user_id": user_id,
            "data_id": data_id,
            "template_id": template_id,
            "row_data": row_data,
            "created_at": now,
            "updated_at": now,
        }
        documents.append(doc)

    if documents:
        result = data_documents.insert_many(documents)
        return len(result.inserted_ids)
    return 0


def process_excel_upload(
    file_content: bytes,
    template: DataTemplate,
    user_id: str,
    filename: str,
) -> tuple[DataMetadata, int]:
    """Process Excel file upload and store data"""
    df = pd.read_excel(BytesIO(file_content))

    is_valid, error_msg = validate_dataframe_structure(df, template)
    if not is_valid:
        raise ValueError(error_msg)

    df = df.fillna("")
    rows = df.to_dict("records")

    metadata = create_data_metadata(
        user_id=user_id,
        name=filename,
        columns=list(df.columns),
        dtypes={col: str(dtype) for col, dtype in df.dtypes.items()},
        num_rows=len(df),
        source_type=SourceType.EXCEL,
    )

    docs_created = create_data_documents(
        user_id=user_id,
        data_id=metadata.id,
        template_id=template.id,
        rows=rows,
    )

    return metadata, docs_created
