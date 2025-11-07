# KeepDM

## Env config

.env example:

```bash
JWT_SECRET_KEY=super_secret_key
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30

MONGO_HOST=localhost
MONGO_PORT=27017
MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=password
MONGO_DB=keepdm_db
```

## Api config

### Templates `/templates`:

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/` | Create template | ✅ |
| GET | `/` | List user templates | ✅ |
| GET | `/{template_id}` | Get template details | ✅ |
| PUT | `/{template_id}` | Update template | ✅ |
| DELETE | `/{template_id}` | Delete template | ✅ |
| GET | `/{template_id}/download` | Download Excel | ✅ |

### Auth `/auth`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
|POST|`/login`|Logs in the user, returns access token|❌|
|POST|`/register`|Registers a new user|❌|
|POST|`/me`|Returns authenticated user's info|✅|

### Data `/data`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
|POST|`/upload/{template_id}`|Upload data based on template|✅|
|GET|`/`|Lists data|✅|
|GET|`/{data_id}/analysis`|Returns data analysis see analysis for more info|✅|

### Dashboards `/dashboards`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
|POST|`/`|Creates a dashboard|✅|
|GET|`/`|Lists dashboards|✅|
|GET|`/{dashboard_id}`|Gets a dashboard|✅|
|PUT|`/{dashboard_id}`|Updates a dashboard|✅|
|DELETE|`/{dashboard_id}`|Deletes a dashboard|✅|
|GET|`/{dashboard_id}/data`|Gets a dashboard config data|✅|

## Analysis

Return example:

```
{
  "data_id": "...",
  "template_id": "...",
  "num_rows": 150,
  "num_columns": 4,
  "column_analyses": [
    {
      "column_name": "sales",
      "column_type": "number",
      "total_count": 150,
      "non_null_count": 148,
      "null_count": 2,
      "null_percentage": 1.33,
      "min": 100.5,
      "max": 5000.0,
      "avg": 1250.75,
      "sum": 185111.0
    },
    {
      "column_name": "category",
      "column_type": "text",
      "unique_count": 5,
      "is_categorical": true,
      "sample_values": ["Electronics", "Books", ...]
    }
  ],
  "visualization_suggestions": [
    {
      "chart_type": "kpi",
      "title": "Total sales",
      "columns": ["sales"],
      "aggregation": "sum",
      "priority": 1,
      "description": "Display sum of sales"
    },
    {
      "chart_type": "line",
      "title": "sales over time",
      "columns": ["date", "sales"],
      "aggregation": "sum",
      "priority": 2,
      "description": "Time series showing sales trends"
    },
    {
      "chart_type": "bar",
      "title": "sales by category",
      "columns": ["category", "sales"],
      "aggregation": "sum",
      "priority": 3,
      "description": "Compare sales across category"
    }
  ]
}
```

Usable on charts configuration.
