from typing import Optional, List
from app.models.models import DataMetadata, DataDocument, DataTemplate
from app.models.mongo import get_database
from datetime import datetime, timezone
from bson import ObjectId
import pandas as pd


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


def generate_xlsx_from_template(template: DataTemplate, file_path: str) -> None:
    """Generate an Excel file from a data template"""
    df = pd.DataFrame(columns=template.columns.keys())
    df.to_excel(file_path, index=False)
