from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.api import auth, data, templates, dashboards
from app.models.mongo import get_database, close_database


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    try:
        get_database()
    except Exception as e:
        print(f"Startup Warning: Database connection failed: {e}")
    yield
    # Shutdown
    close_database()


app = FastAPI(title="KeepDM API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(data.router, prefix="/api")
app.include_router(templates.router, prefix="/api")
app.include_router(dashboards.router, prefix="/api")


@app.get("/")
async def root():
    return {"message": "KeepDM API is running"}
