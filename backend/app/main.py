import json
import logging
import os
from datetime import datetime
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .database import engine, Base
from .ai.inference_service import DetectionService
from .routes import upload_routes, alert_routes, dashboard_routes, camera_routes

# ── Logging setup ─────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("fireguard.main")

# Create DB tables
Base.metadata.create_all(bind=engine)
logger.info("[DB] Tables created / verified")


# ── App lifespan ──────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("[Startup] Loading YOLOv8 model...")
    svc = DetectionService()
    # Inject into upload_routes
    upload_routes._detection_svc = svc
    
    from .websocket.connection_manager import manager
    upload_routes._ws_manager = manager
    
    logger.info("[Startup] Ready — model loaded, routes configured")
    yield
    logger.info("[Shutdown] Cleaning up")


app = FastAPI(title="FireGuard AI API", version="1.0.0", lifespan=lifespan)

# CORS — configurable via env
_origins = os.environ.get("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins + ["*"],  # Keep permissive for dev, tighten in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve evidence images as static files
EVIDENCE_DIR = os.path.join(os.path.dirname(__file__), "..", "evidence")
os.makedirs(EVIDENCE_DIR, exist_ok=True)
app.mount("/evidence", StaticFiles(directory=EVIDENCE_DIR), name="evidence")

# ── v1 Routers ────────────────────────────────────────────────────────────────
app.include_router(upload_routes.router)
app.include_router(alert_routes.router)
app.include_router(dashboard_routes.router)
app.include_router(camera_routes.router)

from .routes import history_routes
app.include_router(history_routes.router)


# ── Analytics routes (v1) ─────────────────────────────────────────────────────

from fastapi import Depends, Query
from sqlalchemy.orm import Session
from .database import get_db
from .services.analytics_service import (
    get_timeline, get_zones, get_weekly_trend,
    get_camera_activity, get_type_breakdown,
    _range_filter,
)
from sqlalchemy import func
from . import models


# Full analytics (kept for backwards compatibility)
@app.get("/api/v1/analytics")
def analytics_full(
    range: str = Query("7d", regex="^(24h|7d|30d)$"),
    db: Session = Depends(get_db),
):
    return {
        "timeline": get_timeline(db, range),
        "zones": get_zones(db),
        "weekly_trend": get_weekly_trend(db),
        "camera_activity": get_camera_activity(db),
        "type_breakdown": get_type_breakdown(db, range),
    }



@app.get("/api/v1/analytics/incident-trends")
def analytics_incident_trends(
    db: Session = Depends(get_db),
):
    # Reuse weekly trend (7d)
    rows = get_weekly_trend(db)
    # API shape expected by frontend: { timeline: [{day, fire, smoke}] }
    return {
        "timeline": [
            {"day": r["day"], "fire": 0, "smoke": int(r["alerts"])}
            for r in rows
        ]
    }


@app.get("/api/v1/analytics/fire-smoke-distribution")
def analytics_fire_smoke_distribution(
    range: str = Query("7d", regex="^(24h|7d|30d)$"),
    db: Session = Depends(get_db),
):
    fb = get_type_breakdown(db, range)
    return {
        "breakdown": [
            {"name": "Fire", "value": fb["fire"], "color": "#ef4444"},
            {"name": "Smoke", "value": fb["smoke"], "color": "#f97316"},
        ]
    }


@app.get("/api/v1/analytics/alert-frequency")
def analytics_alert_frequency(
    range: str = Query("24h", regex="^(24h|7d|30d)$"),
    db: Session = Depends(get_db),
):
    return {"timeline": get_timeline(db, range)}


@app.get("/api/v1/analytics/severity-distribution")
def analytics_severity_distribution(
    range: str = Query("7d", regex="^(24h|7d|30d)$"),
    db: Session = Depends(get_db),
):
    # Derive severity from confidence bands
    cutoff = _range_filter(range)

    critical = db.query(func.count(models.Alert.id)).filter(
        models.Alert.timestamp >= cutoff,
        models.Alert.confidence >= 0.90,
    ).scalar() or 0

    high = db.query(func.count(models.Alert.id)).filter(
        models.Alert.timestamp >= cutoff,
        models.Alert.confidence >= 0.80,
        models.Alert.confidence < 0.90,
    ).scalar() or 0

    medium = db.query(func.count(models.Alert.id)).filter(
        models.Alert.timestamp >= cutoff,
        models.Alert.confidence >= 0.70,
        models.Alert.confidence < 0.80,
    ).scalar() or 0

    low = db.query(func.count(models.Alert.id)).filter(
        models.Alert.timestamp >= cutoff,
        models.Alert.confidence < 0.70,
    ).scalar() or 0

    return {
        "zones": [
            {"name": "Critical", "value": critical, "color": "#ef4444"},
            {"name": "High", "value": high, "color": "#f97316"},
            {"name": "Medium", "value": medium, "color": "#f59e0b"},
            {"name": "Low", "value": low, "color": "#22c55e"},
        ]
    }



@app.get("/api/v1/analytics/camera-activity")
def analytics_camera_activity(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
):
    return {"camera_activity": get_camera_activity(db, limit=limit)}



# ── WebSocket endpoint ────────────────────────────────────────────────────────
@app.websocket("/ws/alerts")
async def alert_ws(websocket: WebSocket):
    from .websocket.connection_manager import manager
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)


# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/api/health")
@app.get("/api/v1/health")
def health():
    return {
        "status":    "ok",
        "service":   "FireGuard AI",
        "version":   "1.0.0",
        "timestamp": datetime.utcnow().isoformat(),
    }
