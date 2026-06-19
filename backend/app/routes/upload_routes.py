"""
Upload routes — /api/v1/upload
"""
import cv2
import logging
import numpy as np
import tempfile
import os
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..ai.inference_service import DetectionService
from ..services.storage_service import save_evidence
from ..services.alert_service import create_alert, create_event
from .. import schemas

logger = logging.getLogger("fireguard.upload")
router = APIRouter(prefix="/api/v1/upload", tags=["upload"])

_detection_svc: DetectionService = None
_ws_manager = None


def get_detection_svc() -> DetectionService:
    if _detection_svc is None:
        raise HTTPException(status_code=503, detail="Detection service not ready")
    return _detection_svc


async def _broadcast(
    alert_id: str,
    detection_type: str,
    confidence: float,
    camera_id: str | None = None,
    location: str | None = None,
):
    if _ws_manager:
        await _ws_manager.broadcast({
            "event":        "new_alert",
            "alert_id":     alert_id,
            "type":         detection_type,
            "confidence":   confidence,
            "camera_id":    camera_id,
            "location":     location,
        })


# ── Image upload ──────────────────────────────────────────────────────────────
@router.post("/image", response_model=schemas.ImageUploadResponse)
async def upload_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    svc: DetectionService = Depends(get_detection_svc),
):
    logger.info(f"Image received: {file.filename}")

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".jpg", ".jpeg", ".png", ".bmp", ".webp"]:
        raise HTTPException(
            status_code=400,
            detail="Unsupported image format. Allowed: JPG, JPEG, PNG, BMP, WEBP.",
        )

    data = await file.read()
    MAX_IMAGE_SIZE = 20 * 1024 * 1024
    if len(data) > MAX_IMAGE_SIZE:
        raise HTTPException(status_code=413, detail="Image too large. Max 20MB.")

    arr = np.frombuffer(data, np.uint8)
    frame = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if frame is None:
        raise HTTPException(status_code=400, detail="Could not decode image file")

    logger.debug(f"Decoded shape: {frame.shape}")
    annotated, detections = svc.infer_image(frame)
    logger.info(f"Detections: {len(detections)}")

    if not detections:
        return schemas.ImageUploadResponse(
            detections=[], alert_ids=[], evidence_path=None, file_name=file.filename
        )

    # Save original + annotated evidence
    save_evidence(frame, prefix="img_orig")
    evidence_path = save_evidence(annotated, prefix="img")

    # One alert per unique class (best confidence)
    best: dict[str, dict] = {}
    for det in detections:
        t = det["detection_type"]
        if t not in best or det["confidence"] > best[t]["confidence"]:
            best[t] = det

    alerts_created = []
    for cls_type, det in best.items():
        alert = create_alert(
            db,
            detection_type=cls_type,
            confidence=det["confidence"],
            source_type="image",
            camera_id="CAM-UPLOAD",
            location="Upload",
            file_name=file.filename,
            evidence_path=evidence_path,
        )
        alerts_created.append(alert.id)
        logger.info(f"Alert created: id={alert.id} type={cls_type} conf={det['confidence']:.4f}")
        await _broadcast(
            alert.id,
            cls_type,
            det["confidence"],
            camera_id="CAM-UPLOAD",
            location="Upload",
        )


    # Store every bounding box as an event
    for det in detections:
        alert_id = next(
            (aid for aid, (ct, _) in zip(alerts_created, best.items()) if ct == det["detection_type"]),
            alerts_created[0] if alerts_created else None,
        )
        create_event(
            db, alert_id, det, "image",
            camera_id="CAM-UPLOAD", location="Upload",
            file_name=file.filename, evidence_path=evidence_path,
        )

    logger.info(f"Upload complete — {len(alerts_created)} alert(s)")

    return schemas.ImageUploadResponse(
        detections=detections,
        alert_ids=alerts_created,
        evidence_path=evidence_path,
        file_name=file.filename,
    )


# ── Video upload ──────────────────────────────────────────────────────────────
@router.post("/video", response_model=schemas.VideoUploadResponse)
async def upload_video(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    svc: DetectionService = Depends(get_detection_svc),
):
    logger.info(f"Video received: {file.filename}")

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".mp4", ".avi", ".mov", ".mkv"]:
        raise HTTPException(
            status_code=400,
            detail="Unsupported video format. Allowed: MP4, AVI, MOV, MKV.",
        )

    video_data = await file.read()
    MAX_VIDEO_SIZE = 100 * 1024 * 1024
    if len(video_data) > MAX_VIDEO_SIZE:
        raise HTTPException(status_code=413, detail="Video too large. Max 100MB.")

    suffix = os.path.splitext(file.filename)[1] or ".mp4"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(video_data)
        tmp_path = tmp.name

    cap = cv2.VideoCapture(tmp_path)
    if not cap.isOpened():
        cap.release()
        try:
            os.unlink(tmp_path)
        except Exception:
            pass
        raise HTTPException(status_code=400, detail="Could not decode video file.")
    cap.release()

    events_out = []
    try:
        for frame_num, detections, annotated in svc.infer_video(tmp_path):
            evidence_path = save_evidence(annotated, prefix=f"vid_f{frame_num}")

            best: dict[str, dict] = {}
            for det in detections:
                t = det["detection_type"]
                if t not in best or det["confidence"] > best[t]["confidence"]:
                    best[t] = det

            for cls_type, det in best.items():
                alert = create_alert(
                    db,
                    detection_type=cls_type,
                    confidence=det["confidence"],
                    source_type="video",
                    camera_id="CAM-UPLOAD",
                    location="Upload",
                    file_name=file.filename,
                    evidence_path=evidence_path,
                    frame_number=frame_num,
                )
                for d in [d for d in detections if d["detection_type"] == cls_type]:
                    create_event(
                        db, alert.id, d, "video",
                        camera_id="CAM-UPLOAD", location="Upload",
                        file_name=file.filename, frame_number=frame_num,
                        evidence_path=evidence_path,
                    )
                await _broadcast(
                    alert.id,
                    cls_type,
                    det["confidence"],
                    camera_id="CAM-UPLOAD",
                    location="Upload",
                )

                events_out.append({
                    "alert_id":       alert.id,
                    "frame_number":   frame_num,
                    "detection_type": cls_type,
                    "confidence":     det["confidence"],
                    "evidence_path":  evidence_path,
                })
    finally:
        try:
            os.unlink(tmp_path)
        except Exception:
            pass

    logger.info(f"Video done — {len(events_out)} event(s)")
    return schemas.VideoUploadResponse(
        total_events=len(events_out), events=events_out, file_name=file.filename
    )


# ── Debug endpoints ───────────────────────────────────────────────────────────
@router.get("/debug/detection")
def debug_class_map(svc: DetectionService = Depends(get_detection_svc)):
    """Shows exactly how the model maps class IDs to fire/smoke labels."""
    from ..ai.inference_service import CONF_FIRE, CONF_SMOKE, CONF_RUN
    return {
        "raw_model_names":    svc.class_names,
        "resolved_class_map": svc.get_class_map(),
        "thresholds": {
            "fire":          CONF_FIRE,
            "smoke":         CONF_SMOKE,
            "yolo_run_conf": CONF_RUN,
        },
    }


@router.post("/debug/detection")
async def debug_upload(
    file: UploadFile = File(...),
    svc: DetectionService = Depends(get_detection_svc),
):
    """Upload an image — returns raw table of ALL boxes including suppressed."""
    from ..ai.inference_service import CONF_RUN, PER_CLASS_THRESHOLD, _map_class
    data = await file.read()
    arr = np.frombuffer(data, np.uint8)
    frame = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if frame is None:
        raise HTTPException(status_code=400, detail="Invalid image")

    results = svc.model(frame, verbose=False, conf=CONF_RUN, device=svc.device)
    raw_rows = []
    for r in results:
        for box in (r.boxes or []):
            cls_id = int(box.cls[0])
            raw_name = svc.class_names.get(cls_id, str(cls_id))
            conf = round(float(box.conf[0]), 4)
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            mapped = _map_class(cls_id, raw_name)
            threshold = PER_CLASS_THRESHOLD.get(mapped, 0.25) if mapped else 0.25
            suppressed = conf < threshold
            raw_rows.append({
                "class_id":       cls_id,
                "raw_class_name": raw_name,
                "mapped":         mapped,
                "confidence":     conf,
                "threshold":      threshold,
                "suppressed":     suppressed,
                "bbox":           {"x1": x1, "y1": y1, "x2": x2, "y2": y2},
            })

    accepted = [r for r in raw_rows if not r["suppressed"] and r["mapped"]]
    _, detections = svc.infer_image(frame)

    return {
        "file":                file.filename,
        "frame_shape":         list(frame.shape),
        "total_raw_boxes":     len(raw_rows),
        "total_accepted":      len(accepted),
        "alert_generated":     len(accepted) > 0,
        "raw_detection_table": raw_rows,
        "detections":          detections,
    }
