"""Create the app and register implemented routes."""
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.health import router as health_router
from app.api.investigations import router as investigations_router
from app.api.sessions import create_router as create_sessions_router
from app.config import Settings


def create_app(database_path: Path | None = None) -> FastAPI:
    settings = Settings()

    application = FastAPI(title=settings.app_name, version="0.1.0")

    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins,
        allow_credentials=False,
        allow_methods=["GET", "POST"],
        allow_headers=["Content-Type"],
    )

    application.include_router(health_router)
    application.include_router(investigations_router)
    application.include_router(create_sessions_router(database_path or Path(settings.session_database)))
    return application


app = create_app()