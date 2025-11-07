from typing import Optional, List, Dict, Any
from app.models.models import DashboardConfig, VisualizationWidget, AggregationType
from app.models.mongo import get_database
from datetime import datetime, timezone
from bson import ObjectId
import pandas as pd


def create_dashboard(
    user_id: str,
    template_id: str,
    data_id: str,
    name: str,
    widgets: List[Dict[str, Any]],
    layout_type: str = "default_6",
) -> DashboardConfig:
    """Create a new dashboard configuration"""
    db = get_database()
    dashboards = db.dashboards

    now = datetime.now(timezone.utc)
    dashboard_dict = {
        "user_id": user_id,
        "template_id": template_id,
        "data_id": data_id,
        "name": name,
        "layout_type": layout_type,
        "widgets": widgets,
        "created_at": now,
        "updated_at": now,
    }
    result = dashboards.insert_one(dashboard_dict)
    dashboard_dict["_id"] = str(result.inserted_id)
    return DashboardConfig(**dashboard_dict)


def get_dashboard_by_id(dashboard_id: str) -> Optional[DashboardConfig]:
    """Get dashboard by ID"""
    db = get_database()
    dashboards = db.dashboards

    doc = dashboards.find_one({"_id": ObjectId(dashboard_id)})
    if doc:
        doc["_id"] = str(doc["_id"])
        return DashboardConfig(**doc)
    return None


def list_dashboards_by_user(user_id: str) -> List[DashboardConfig]:
    """List all dashboards for a user"""
    db = get_database()
    dashboards = db.dashboards

    docs = dashboards.find({"user_id": user_id})
    dashboard_list = []
    for doc in docs:
        doc["_id"] = str(doc["_id"])
        dashboard_list.append(DashboardConfig(**doc))
    return dashboard_list


def update_dashboard(
    dashboard_id: str,
    name: Optional[str] = None,
    widgets: Optional[List[Dict[str, Any]]] = None,
) -> Optional[DashboardConfig]:
    """Update dashboard configuration"""
    db = get_database()
    dashboards = db.dashboards

    update_fields = {}
    if name is not None:
        update_fields["name"] = name
    if widgets is not None:
        update_fields["widgets"] = widgets
    if not update_fields:
        return None

    update_fields["updated_at"] = datetime.now(timezone.utc)
    result = dashboards.update_one(
        {"_id": ObjectId(dashboard_id)},
        {"$set": update_fields},
    )
    if result.modified_count == 1:
        return get_dashboard_by_id(dashboard_id)
    return None


def delete_dashboard(dashboard_id: str) -> bool:
    """Delete a dashboard"""
    db = get_database()
    dashboards = db.dashboards

    result = dashboards.delete_one({"_id": ObjectId(dashboard_id)})
    return result.deleted_count == 1


def process_widget_data(
    data_id: str,
    columns: List[str],
    aggregation: Optional[str] = None,
    filters: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """Process data for a specific widget"""
    from app.crud.data import get_data_documents_by_data_id

    documents = get_data_documents_by_data_id(data_id)
    if not documents:
        return {"data": [], "labels": []}

    rows = [doc.row_data for doc in documents]
    df = pd.DataFrame(rows)

    if filters:
        for col, value in filters.items():
            if col in df.columns:
                df = df[df[col] == value]

    if aggregation is None and len(columns) >= 1:
        selected_cols = [col for col in columns if col in df.columns]
        if not selected_cols:
            return {"columns": columns, "rows": []}

        table_data = df[selected_cols].head(100)

        return {
            "columns": selected_cols,
            "rows": table_data.values.tolist(),
        }

    if len(columns) == 1:
        col = columns[0]
        if col not in df.columns:
            return {"value": 0, "label": col}

        if aggregation == AggregationType.COUNT:
            if df[col].dtype == "object" or str(df[col].dtype) == "category":
                value_counts = df[col].value_counts()
                return {
                    "labels": value_counts.index.tolist(),
                    "data": value_counts.values.tolist(),
                }
            else:
                result = len(df)
                return {"value": result, "label": col}
        elif aggregation in [
            AggregationType.SUM,
            AggregationType.AVG,
            AggregationType.MIN,
            AggregationType.MAX,
        ]:
            values = pd.to_numeric(df[col], errors="coerce").dropna()
            if aggregation == AggregationType.SUM:
                result = float(values.sum())
            elif aggregation == AggregationType.AVG:
                result = float(values.mean())
            elif aggregation == AggregationType.MIN:
                result = float(values.min())
            elif aggregation == AggregationType.MAX:
                result = float(values.max())
            return {"value": round(result, 2), "label": col}
        return {"value": 0, "label": col}

    elif len(columns) == 2:
        x_col, y_col = columns
        if x_col in df.columns and y_col in df.columns:
            if aggregation:
                grouped = df.groupby(x_col)[y_col]
                if aggregation == AggregationType.SUM:
                    result = grouped.sum()
                elif aggregation == AggregationType.AVG:
                    result = grouped.mean()
                elif aggregation == AggregationType.COUNT:
                    result = grouped.count()
                elif aggregation == AggregationType.MIN:
                    result = grouped.min()
                elif aggregation == AggregationType.MAX:
                    result = grouped.max()
                else:
                    result = grouped.sum()

                return {
                    "labels": result.index.tolist(),
                    "data": [round(float(v), 2) for v in result.values],
                }
            else:
                return {
                    "labels": df[x_col].tolist(),
                    "data": df[y_col].tolist(),
                }

    elif len(columns) == 3:
        x_col, group_col, y_col = columns
        if all(col in df.columns for col in [x_col, group_col, y_col]):
            grouped = df.groupby([x_col, group_col])[y_col]
            if aggregation:
                if aggregation == AggregationType.SUM:
                    result = grouped.sum()
                elif aggregation == AggregationType.AVG:
                    result = grouped.mean()
                elif aggregation == AggregationType.COUNT:
                    result = grouped.count()
                else:
                    result = grouped.sum()
            else:
                result = grouped.sum()

            result_df = result.reset_index()
            pivot = result_df.pivot(index=x_col, columns=group_col, values=y_col)

            return {
                "labels": pivot.index.tolist(),
                "datasets": [
                    {
                        "label": str(col),
                        "data": [
                            round(float(v), 2) if pd.notna(v) else 0
                            for v in pivot[col].values
                        ],
                    }
                    for col in pivot.columns
                ],
            }

    return {"data": [], "labels": []}


def get_dashboard_data(dashboard_id: str) -> Dict[str, Any]:
    """Get processed data for all widgets in a dashboard"""
    dashboard = get_dashboard_by_id(dashboard_id)
    if not dashboard:
        raise ValueError("Dashboard not found")

    widgets_data = []
    for widget in dashboard.widgets:
        widget_dict = widget.dict() if hasattr(widget, "dict") else widget
        processed_data = process_widget_data(
            data_id=dashboard.data_id,
            columns=widget_dict["columns"],
            aggregation=widget_dict.get("aggregation"),
            filters=widget_dict.get("filters"),
        )

        widgets_data.append(
            {
                "position": widget_dict["position"],
                "chart_type": widget_dict["chart_type"],
                "title": widget_dict["title"],
                "data": processed_data,
            }
        )

    return {
        "dashboard_id": dashboard_id,
        "name": dashboard.name,
        "layout_type": dashboard.layout_type,
        "widgets": widgets_data,
    }
