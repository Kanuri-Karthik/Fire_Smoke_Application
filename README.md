# FireGuard AI

**Intelligent Fire & Smoke Detection Platform**

FireGuard AI is a highly scalable, real-time computer vision platform designed to detect fire and smoke in video streams and static images. Leveraging a custom-trained YOLOv8 model and WebSockets, FireGuard provides instantaneous alerts and a modern, premium dashboard for monitoring critical incidents.

## Features
- **Real-Time Detection**: Asynchronous video stream processing using YOLOv8.
- **WebSocket Alerts**: Instant push notifications to the frontend on detection.
- **Modern Dashboard**: Built with React, Zustand, and Tailwind CSS.
- **Incident Center**: Persistent tracking of active, acknowledged, and resolved alerts via PostgreSQL.
- **Analytics**: Beautiful charts mapping detection trends over time.

## Architecture
- **Frontend**: React, Vite, Zustand, Tailwind CSS, Recharts.
- **Backend**: FastAPI, Ultralytics (YOLOv8), SQLAlchemy, Alembic.
- **Database**: PostgreSQL.
- **Deployment**: Docker Compose.

## Quick Start
```bash
cd deployment/compose
docker-compose up --build -d
```
The dashboard will be available at `http://localhost:5173`.
The API will be available at `http://localhost:8000/docs`.

## Documentation
- [Architecture Review](docs/Architecture_Review.md)
- [API Reference](API_REFERENCE.md)
- [Database Schema](DATABASE.md)
- [Deployment Guide](DEPLOYMENT.md)
- [Developer Guide](DEVELOPER_GUIDE.md)
- [Operations Runbook](OPERATIONS_RUNBOOK.md)
