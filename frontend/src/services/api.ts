import { APP_CONFIG } from '../config/appConfig';

const BASE = APP_CONFIG.apiBaseUrl;


export interface BBox { x1: number; y1: number; x2: number; y2: number; }
export interface Detection { detection_type: 'fire' | 'smoke'; confidence: number; bbox: BBox; }

export interface Alert {
  id: string;
  detection_type: 'fire' | 'smoke';
  confidence: number;
  status: 'active' | 'acknowledged' | 'resolved';
  source_type: string;
  camera_id: string | null;
  location: string | null;
  file_name: string | null;
  evidence_path: string | null;
  frame_number: number | null;
  timestamp: string;
}

export interface DashboardStats {
  total_alerts: number;
  active_alerts: number;
  fire_alerts: number;
  smoke_alerts: number;
  connected_cameras: number;
  recent_alerts: Alert[];
}

export interface DetectionEvent {
  id: string;
  alert_id: string | null;
  detection_type: 'fire' | 'smoke';
  confidence: number;
  bbox_x1: number | null;
  bbox_y1: number | null;
  bbox_x2: number | null;
  bbox_y2: number | null;
  source_type: string;
  camera_id: string | null;
  location: string | null;
  file_name: string | null;
  frame_number: number | null;
  evidence_path: string | null;
  timestamp: string;
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, init);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Remove undefined/null/empty values before building query string
function toQuery(params?: Record<string, unknown>): string {
  if (!params) return '';
  const p = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') p.append(k, String(v));
  });
  const s = p.toString();
  return s ? '?' + s : '';
}

// ── Upload ────────────────────────────────────────────────────────────────────
export const uploadImage = (file: File) => {
  const fd = new FormData();
  fd.append('file', file);
  return api<{
    detections: Detection[];
    alert_ids: string[];
    evidence_path: string | null;
    file_name: string;
  }>(
    '/api/v1/upload/image',
    { method: 'POST', body: fd }
  );
};

export const uploadVideo = (file: File) => {
  const fd = new FormData();
  fd.append('file', file);
  return api<{
    total_events: number;
    events: Record<string, unknown>[];
    file_name: string;
  }>(
    '/api/v1/upload/video',
    { method: 'POST', body: fd }
  );
};

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const getDashboardStats = () =>
  api<DashboardStats>('/api/v1/dashboard/stats');

export const getDashboardAnalytics = () =>
  api<{ timeline: Record<string, unknown>[]; zones: Record<string, unknown>[] }>(
    '/api/v1/dashboard/analytics'
  );

export const getAnalyticsIncidentTrends = () =>
  api<{ timeline: { day: string; fire: number; smoke: number }[] }>(
    '/api/v1/analytics/incident-trends'
  ).then((d) => d.timeline);

export const getAnalyticsFireSmokeDistribution = () =>
  api<{ breakdown: { name: string; value: number; color: string }[] }>(
    '/api/v1/analytics/fire-smoke-distribution'
  ).then((d) => d.breakdown);


export const getEvents = (params?: {
  detection_type?: string;
  date_from?: string;
  date_to?: string;
  limit?: number;
}) => api<DetectionEvent[]>(`/api/v1/dashboard/events${toQuery(params)}`);

// ── Alerts ────────────────────────────────────────────────────────────────────
export const getAlerts = (params?: {
  detection_type?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
}) => api<Alert[]>(`/api/v1/alerts${toQuery(params)}`);

export const updateAlertStatus = (alertId: string, status: Alert['status']) =>
  api<Alert>(`/api/v1/alerts/${alertId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });

export const deleteAlert = (alertId: string) =>
  api<{ status: string; message: string }>(`/api/v1/alerts/${alertId}`, {
    method: 'DELETE',
  });


// ── Evidence ──────────────────────────────────────────────────────────────────
export const evidenceUrl = (path: string | null) =>
  path ? `${BASE}${path}` : null;

// ── WebSocket ─────────────────────────────────────────────────────────────────
export const connectAlertSocket = (onMessage: (data: unknown) => void): WebSocket => {
  const wsBase = BASE.replace(/^http/, 'ws');
  const ws = new WebSocket(`${wsBase}/ws/alerts`);
  ws.onmessage = (e) => {
    try {
      onMessage(JSON.parse((e as MessageEvent).data));
    } catch {
      // ignore invalid messages
    }
  };
  const ping = setInterval(() => {
    if (ws.readyState === 1) ws.send('ping');
  }, 20_000);
  ws.onclose = () => clearInterval(ping);
  return ws;
};
