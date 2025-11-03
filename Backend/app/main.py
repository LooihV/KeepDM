from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.api import auth
from app.models.mongo import get_database, close_database


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    get_database()
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


@app.get("/")
async def root():
    return {"message": "KeepDM API is running"}
