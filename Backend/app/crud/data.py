from typing import Optional, List, Dict, Any
from io import BytesIO
from app.models.models import (
    DataMetadata,
    DataDocument,
    DataTemplate,
    SourceType,
    ColumnType,
    ChartType,
    AggregationType,
)
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


# Data analysis functions
def get_data_metadata_by_id(data_id: str) -> Optional[DataMetadata]:
    """Get data metadata by ID"""
    db = get_database()
    data_metadata = db.data_metadata

    doc = data_metadata.find_one({"_id": ObjectId(data_id)})
    if doc:
        doc["_id"] = str(doc["_id"])
        return DataMetadata(**doc)
    return None


def get_data_documents_by_data_id(data_id: str) -> List[DataDocument]:
    """Get all data documents for a specific data_id"""
    db = get_database()
    data_documents = db.data_documents

    docs = data_documents.find({"data_id": data_id})
    documents = []
    for doc in docs:
        doc["_id"] = str(doc["_id"])
        documents.append(DataDocument(**doc))
    return documents


def list_data_metadata_by_user(user_id: str) -> List[DataMetadata]:
    """List all data metadata for a user"""
    db = get_database()
    data_metadata = db.data_metadata

    docs = data_metadata.find({"user_id": user_id}).sort("created_at", -1)
    metadata_list = []
    for doc in docs:
        doc["_id"] = str(doc["_id"])
        metadata_list.append(DataMetadata(**doc))
    return metadata_list


def analyze_column(
    column_name: str, column_type: str, values: List[Any]
) -> Dict[str, Any]:
    """Analyze a single column and return statistics"""
    clean_values = [v for v in values if v != "" and v is not None]
    total_count = len(values)
    non_null_count = len(clean_values)
    null_count = total_count - non_null_count

    analysis = {
        "column_name": column_name,
        "column_type": column_type,
        "total_count": total_count,
        "non_null_count": non_null_count,
        "null_count": null_count,
        "null_percentage": (
            round((null_count / total_count * 100), 2) if total_count > 0 else 0
        ),
    }

    if column_type == ColumnType.NUMBER and clean_values:
        numeric_values = [
            float(v)
            for v in clean_values
            if isinstance(v, (int, float))
            or str(v).replace(".", "", 1).replace("-", "", 1).isdigit()
        ]
        if numeric_values:
            analysis.update(
                {
                    "min": min(numeric_values),
                    "max": max(numeric_values),
                    "avg": round(sum(numeric_values) / len(numeric_values), 2),
                    "sum": round(sum(numeric_values), 2),
                }
            )

    elif column_type == ColumnType.TEXT and clean_values:
        unique_values = list(set(clean_values))
        analysis.update(
            {
                "unique_count": len(unique_values),
                "sample_values": unique_values[:5],
                "is_categorical": len(unique_values) <= 20,
            }
        )

    elif column_type == ColumnType.DATE and clean_values:
        analysis.update(
            {
                "min_date": str(min(clean_values)),
                "max_date": str(max(clean_values)),
                "date_range_days": (
                    (
                        pd.to_datetime(max(clean_values))
                        - pd.to_datetime(min(clean_values))
                    ).days
                    if len(clean_values) > 1
                    else 0
                ),
            }
        )

    elif column_type == ColumnType.BOOLEAN and clean_values:
        true_count = sum(
            1 for v in clean_values if str(v).lower() in ["true", "1", "yes", "si"]
        )
        false_count = non_null_count - true_count
        analysis.update(
            {
                "true_count": true_count,
                "false_count": false_count,
                "true_percentage": (
                    round((true_count / non_null_count * 100), 2)
                    if non_null_count > 0
                    else 0
                ),
            }
        )

    return analysis


def suggest_visualizations(
    template: DataTemplate, column_analyses: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    """Suggest visualizations based on data analysis"""
    suggestions = []

    date_cols = [c for c in column_analyses if c["column_type"] == ColumnType.DATE]
    number_cols = [c for c in column_analyses if c["column_type"] == ColumnType.NUMBER]
    text_cols = [
        c
        for c in column_analyses
        if c["column_type"] == ColumnType.TEXT and c.get("is_categorical", False)
    ]

    # Rule-based suggestions:
    if number_cols:
        for num_col in number_cols[:3]:
            suggestions.append(
                {
                    "chart_type": ChartType.KPI,
                    "title": f"Total {num_col['column_name']}",
                    "columns": [num_col["column_name"]],
                    "aggregation": AggregationType.SUM,
                    "priority": 1,
                    "description": f"Display sum of {num_col['column_name']}",
                }
            )

    if date_cols and number_cols:
        date_col = date_cols[0]
        for num_col in number_cols[:2]:
            suggestions.append(
                {
                    "chart_type": ChartType.LINE,
                    "title": f"{num_col['column_name']} over time",
                    "columns": [date_col["column_name"], num_col["column_name"]],
                    "aggregation": AggregationType.SUM,
                    "priority": 2,
                    "description": f"Time series showing {num_col['column_name']} trends",
                }
            )

    if text_cols and number_cols:
        text_col = text_cols[0]
        for num_col in number_cols[:2]:
            suggestions.append(
                {
                    "chart_type": ChartType.BAR,
                    "title": f"{num_col['column_name']} by {text_col['column_name']}",
                    "columns": [text_col["column_name"], num_col["column_name"]],
                    "aggregation": AggregationType.SUM,
                    "priority": 3,
                    "description": f"Compare {num_col['column_name']} across {text_col['column_name']}",
                }
            )

    if date_cols and text_cols and number_cols:
        date_col = date_cols[0]
        text_col = text_cols[0]
        num_col = number_cols[0]
        suggestions.append(
            {
                "chart_type": ChartType.LINE,
                "title": f"{num_col['column_name']} by {text_col['column_name']} over time",
                "columns": [
                    date_col["column_name"],
                    text_col["column_name"],
                    num_col["column_name"],
                ],
                "aggregation": AggregationType.SUM,
                "priority": 4,
                "description": f"Multi-series comparison of {num_col['column_name']} across {text_col['column_name']}",
            }
        )

    if len(column_analyses) >= 2:
        suggestions.append(
            {
                "chart_type": ChartType.TABLE,
                "title": "Data Table",
                "columns": [c["column_name"] for c in column_analyses[:5]],
                "aggregation": None,
                "priority": 5,
                "description": "Detailed view of all data",
            }
        )

    return sorted(suggestions, key=lambda x: x["priority"])


def analyze_data(data_id: str, template_id: str) -> Dict[str, Any]:
    """Analyze uploaded data and suggest visualizations"""
    metadata = get_data_metadata_by_id(data_id)
    if not metadata:
        raise ValueError("Data not found")

    template = get_data_template_by_id(template_id)
    if not template:
        raise ValueError("Template not found")

    documents = get_data_documents_by_data_id(data_id)
    if not documents:
        raise ValueError("No data documents found")

    column_data = {col: [] for col in template.columns.keys()}
    for doc in documents:
        for col in template.columns.keys():
            column_data[col].append(doc.row_data.get(col))

    column_analyses = []
    for col_name, col_type in template.columns.items():
        analysis = analyze_column(col_name, col_type, column_data[col_name])
        column_analyses.append(analysis)

    suggestions = suggest_visualizations(template, column_analyses)

    return {
        "data_id": data_id,
        "template_id": template_id,
        "num_rows": metadata.num_rows,
        "num_columns": len(template.columns),
        "column_analyses": column_analyses,
        "visualization_suggestions": suggestions,
    }
