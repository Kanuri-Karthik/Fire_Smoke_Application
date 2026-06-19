import cv2
import numpy as np
import torch
import os
import logging
from ultralytics import YOLO
from typing import List, Dict, Tuple, Any

logger = logging.getLogger("fireguard.detection")

MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "models", "best.pt")

# Diagnostic result (from diagnose.py on real fire image):
#   fire  best conf = 0.2163  → threshold set to 0.15 to catch it
#   smoke best conf = 0.8430  → threshold stays 0.25
# YOLO runs at 0.10 so we receive every raw box, then apply per-class filtering.
CONF_FIRE  = float(os.environ.get("CONF_FIRE", "0.15"))
CONF_SMOKE = float(os.environ.get("CONF_SMOKE", "0.25"))
CONF_RUN   = 0.10   # passed to YOLO — collect all boxes, filter ourselves

# Verified class order for this model (FireSmokeDataset):
#   Class 0 = fire
#   Class 1 = smoke
NUMERIC_CLASS_MAP: Dict[int, str] = {0: "fire", 1: "smoke"}

COLORS = {
    "fire":  (0,  30, 255),   # BGR red
    "smoke": (0, 140, 255),   # BGR orange
}

PER_CLASS_THRESHOLD = {
    "fire":  CONF_FIRE,
    "smoke": CONF_SMOKE,
}


def _map_class(cls_id: int, raw_name: str) -> str | None:
    low = raw_name.lower().strip()
    if "fire"  in low: return "fire"
    if "smoke" in low: return "smoke"
    if low.isdigit():  return NUMERIC_CLASS_MAP.get(cls_id)
    return None


class DetectionService:
    def __init__(self):
        self.device      = "cuda" if torch.cuda.is_available() else "cpu"
        self.model       = YOLO(MODEL_PATH)
        self.model.to(self.device)
        self.class_names = self.model.names

        logger.info("=" * 60)
        logger.info(f"[MODEL] Path      : {os.path.abspath(MODEL_PATH)}")
        logger.info(f"[MODEL] Device    : {self.device.upper()}")
        logger.info(f"[MODEL] Raw names : {self.class_names}")
        logger.info(f"[MODEL] Thresholds: fire>={CONF_FIRE}  smoke>={CONF_SMOKE}  (run@{CONF_RUN})")
        for cid, raw in self.class_names.items():
            logger.info(f"[MODEL]   Class {cid} '{raw}' -> '{_map_class(cid, raw)}'")
        logger.info("=" * 60)

    def _run_inference(self, frame: np.ndarray) -> List[Dict[str, Any]]:
        results    = self.model(frame, verbose=False, conf=CONF_RUN, device=self.device)
        detections = []

        for r in results:
            if r.boxes is None or len(r.boxes) == 0:
                logger.debug("No boxes in this frame")
                continue

            for box in r.boxes:
                cls_id   = int(box.cls[0])
                raw_name = self.class_names.get(cls_id, str(cls_id))
                conf     = round(float(box.conf[0]), 4)
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                mapped   = _map_class(cls_id, raw_name)

                threshold = PER_CLASS_THRESHOLD.get(mapped, 0.25) if mapped else 0.25
                passes    = conf >= threshold

                logger.debug(
                    f"cls_id={cls_id} raw='{raw_name}' mapped='{mapped}' "
                    f"conf={conf:.4f} thresh={threshold} "
                    f"{'PASS' if passes else f'SKIP(<{threshold})'} "
                    f"bbox=[{x1},{y1},{x2},{y2}]"
                )

                if mapped is None or not passes:
                    continue

                detections.append({
                    "detection_type": mapped,
                    "confidence":     conf,
                    "bbox":           {"x1": x1, "y1": y1, "x2": x2, "y2": y2},
                    "raw_class_name": raw_name,
                    "class_id":       cls_id,
                })

        logger.info(
            f"Accepted: {len(detections)} — "
            f"fire={sum(1 for d in detections if d['detection_type']=='fire')} "
            f"smoke={sum(1 for d in detections if d['detection_type']=='smoke')}"
        )
        return detections

    def annotate_frame(self, frame: np.ndarray, detections: List[Dict]) -> np.ndarray:
        out = frame.copy()
        for d in detections:
            bb    = d["bbox"]
            color = COLORS.get(d["detection_type"], (255, 255, 255))
            cv2.rectangle(out, (bb["x1"], bb["y1"]), (bb["x2"], bb["y2"]), color, 2)
            label = f"{d['detection_type'].upper()} {d['confidence']:.0%}"
            (tw, th), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)

            if bb["y1"] - th - 8 >= 0:
                rect_y1 = bb["y1"] - th - 8
                rect_y2 = bb["y1"]
                text_y  = bb["y1"] - 4
            else:
                rect_y1 = bb["y1"]
                rect_y2 = bb["y1"] + th + 8
                text_y  = bb["y1"] + th + 4

            cv2.rectangle(out,
                          (bb["x1"], rect_y1),
                          (bb["x1"] + tw + 6, rect_y2), color, -1)
            cv2.putText(out, label, (bb["x1"] + 3, text_y),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
        return out

    def infer_image(self, frame: np.ndarray) -> Tuple[np.ndarray, List[Dict]]:
        logger.debug(f"infer_image shape={frame.shape}")
        detections = self._run_inference(frame)
        annotated  = self.annotate_frame(frame, detections)
        return annotated, detections

    def infer_video(self, video_path: str, consecutive: int = 3):
        cap       = cv2.VideoCapture(video_path)
        frame_num = 0
        counters:  Dict[str, int]  = {"fire": 0, "smoke": 0}
        triggered: Dict[str, bool] = {"fire": False, "smoke": False}

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            frame_num += 1
            detections     = self._run_inference(frame)
            detected_types = {d["detection_type"] for d in detections}

            for cls in ("fire", "smoke"):
                if cls in detected_types:
                    counters[cls] += 1
                else:
                    counters[cls] = 0
                    triggered[cls] = False

                if counters[cls] >= consecutive and not triggered[cls]:
                    triggered[cls] = True
                    cls_dets  = [d for d in detections if d["detection_type"] == cls]
                    annotated = self.annotate_frame(frame, cls_dets)
                    logger.info(f"{cls.upper()} confirmed at frame {frame_num}")
                    yield frame_num, cls_dets, annotated

        cap.release()

    def get_class_map(self) -> dict:
        return {
            str(cid): {"raw_name": raw, "mapped": _map_class(cid, raw)}
            for cid, raw in self.class_names.items()
        }
