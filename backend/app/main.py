from fastapi import FastAPI

from app.api.health import router as health_router


def create_app() -> FastAPI:
    app = FastAPI(
        title="my-fin API",
        version="0.1.0",
        description="Backend scaffold for future my-fin sync, auth, and parser services.",
    )
    app.include_router(health_router, prefix="/api/v1")
    return app


app = create_app()
