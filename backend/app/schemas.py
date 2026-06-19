from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


# ── Camera ────────────────────────────────────────────────────────────────────
class CameraCreate(BaseModel):
    name: str
    location: Optional[str] = None
    zone: Optional[str] = None
    stream_url: Optional[str] = None


class CameraUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    zone: Optional[str] = None
    status: Optional[str] = None
    stream_url: Optional[str] = None
    description: Optional[str] = None


class CameraStatusUpdate(BaseModel):
    status: str  # online | offline | maintenance


class CameraZoneUpdate(BaseModel):
    zone: Optional[str] = None


class CameraOut(BaseModel):
    id: str
    name: str
    location: Optional[str]
    zone: Optional[str]
    status: str
    stream_url: Optional[str]
    description: Optional[str] = None
    last_seen: Optional[datetime]
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


# ── Alert ─────────────────────────────────────────────────────────────────────
class AlertOut(BaseModel):
    id: str
    detection_type: str
    confidence: float
    status: str
    source_type: str
    camera_id: Optional[str]
    location: Optional[str]
    file_name: Optional[str]
    evidence_path: Optional[str]
    frame_number: Optional[int]
    timestamp: datetime

    class Config:
        from_attributes = True


class AlertStatusUpdate(BaseModel):
    status: str  # active | acknowledged | resolved


# ── Detection Event ──────────────────────────────────────────────────────────
class DetectionEventOut(BaseModel):
    id: str
    alert_id: Optional[str]
    detection_type: str
    confidence: float
    bbox_x1: Optional[int]
    bbox_y1: Optional[int]
    bbox_x2: Optional[int]
    bbox_y2: Optional[int]
    source_type: str
    camera_id: Optional[str]
    location: Optional[str]
    file_name: Optional[str]
    frame_number: Optional[int]
    evidence_path: Optional[str]
    timestamp: datetime

    class Config:
        from_attributes = True


# ── Dashboard ────────────────────────────────────────────────────────────────
class DashboardStats(BaseModel):
    total_alerts: int
    active_alerts: int
    fire_alerts: int
    smoke_alerts: int
    connected_cameras: int
    recent_alerts: List[AlertOut]


# ── Pagination ────────────────────────────────────────────────────────────────
class PaginatedAlerts(BaseModel):
    items: List[AlertOut]
    total: int
    page: int
    limit: int
    pages: int


# ── Upload Responses ─────────────────────────────────────────────────────────
class ImageUploadResponse(BaseModel):
    detections: List[dict]
    alert_ids: List[str]
    evidence_path: Optional[str]
    file_name: Optional[str]


class VideoUploadResponse(BaseModel):
    total_events: int
    events: List[dict]
    file_name: Optional[str]

