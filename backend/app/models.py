import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, Float, Text, Index, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base


def gen_uuid():
    return str(uuid.uuid4())


class Camera(Base):
    __tablename__ = "cameras"
    id           = Column(String, primary_key=True, default=gen_uuid)
    name         = Column(String, nullable=False)
    location     = Column(String, nullable=True)
    zone         = Column(String, nullable=True)
    status       = Column(String, default="online")        # online | offline | maintenance
    stream_url   = Column(String, nullable=True)
    description  = Column(Text, nullable=True)
    last_seen    = Column(DateTime, default=datetime.utcnow)
    created_at   = Column(DateTime, default=datetime.utcnow)


    # Relationships
    alerts = relationship("Alert", back_populates="camera_rel", lazy="dynamic")


class Alert(Base):
    __tablename__ = "alerts"
    id             = Column(String,   primary_key=True, default=gen_uuid)
    detection_type = Column(String,   nullable=False)              # "fire" | "smoke"
    confidence     = Column(Float,    nullable=False)
    status         = Column(String,   default="active")            # "active"|"acknowledged"|"resolved"
    source_type    = Column(String,   nullable=False)              # "image" | "video" | "stream"
    camera_id      = Column(String,   ForeignKey("cameras.id"), nullable=True)
    location       = Column(String,   nullable=True)
    file_name      = Column(String,   nullable=True)
    evidence_path  = Column(String,   nullable=True)
    frame_number   = Column(Integer,  nullable=True)
    timestamp      = Column(DateTime, default=datetime.utcnow)

    # Relationships
    camera_rel = relationship("Camera", back_populates="alerts")
    events     = relationship("DetectionEvent", back_populates="alert_rel",
                              cascade="all, delete-orphan", lazy="dynamic")

    __table_args__ = (
        Index("ix_alert_timestamp", "timestamp"),
        Index("ix_alert_type", "detection_type"),
        Index("ix_alert_status", "status"),
        Index("ix_alert_camera", "camera_id"),
    )


class DetectionEvent(Base):
    __tablename__ = "detection_events"
    id             = Column(String,   primary_key=True, default=gen_uuid)
    alert_id       = Column(String,   ForeignKey("alerts.id"), nullable=True)
    detection_type = Column(String,   nullable=False)
    confidence     = Column(Float,    nullable=False)
    bbox_x1        = Column(Integer,  nullable=True)
    bbox_y1        = Column(Integer,  nullable=True)
    bbox_x2        = Column(Integer,  nullable=True)
    bbox_y2        = Column(Integer,  nullable=True)
    source_type    = Column(String,   nullable=False)
    camera_id      = Column(String,   nullable=True)
    location       = Column(String,   nullable=True)
    file_name      = Column(String,   nullable=True)
    frame_number   = Column(Integer,  nullable=True)
    evidence_path  = Column(String,   nullable=True)
    notes          = Column(Text,     nullable=True)
    timestamp      = Column(DateTime, default=datetime.utcnow)

    # Relationships
    alert_rel = relationship("Alert", back_populates="events")

    __table_args__ = (
        Index("ix_event_timestamp", "timestamp"),
        Index("ix_event_alert", "alert_id"),
    )
