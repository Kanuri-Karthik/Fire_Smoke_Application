import { APP_CONFIG } from '../config/appConfig';

const BASE = APP_CONFIG.apiBaseUrl;

export type CameraStatus = 'online' | 'offline' | 'maintenance';

export interface Camera {
  id: string;
  name: string;
  location?: string | null;
  zone?: string | null;
  status: CameraStatus;
  stream_url?: string | null;
  description?: string | null;
}

export interface CameraCreateInput {
  name: string;
  location?: string;
  zone?: string;
  stream_url?: string;
}

export interface CameraUpdateInput {
  name?: string;
  location?: string | null;
  zone?: string | null;
  status?: CameraStatus;
  stream_url?: string | null;
  description?: string | null;
}

export interface CameraStatusUpdateInput {
  status: CameraStatus;
}

export interface CameraZoneUpdateInput {
  zone?: string | null;
}

function toQuery(params?: Record<string, unknown>): string {
  if (!params) return '';
  const p = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') p.append(k, String(v));
  });
  const s = p.toString();
  return s ? '?' + s : '';
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}${toQuery(undefined)}`, init);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function listCameras(): Promise<Camera[]> {
  return api<Camera[]>('/api/v1/cameras');
}

export async function createCamera(body: CameraCreateInput): Promise<Camera> {
  return api<Camera>('/api/v1/cameras', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export async function patchCamera(cameraId: string, body: CameraUpdateInput): Promise<Camera> {
  return api<Camera>(`/api/v1/cameras/${cameraId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export async function patchCameraStatus(cameraId: string, body: CameraStatusUpdateInput): Promise<Camera> {
  return api<Camera>(`/api/v1/cameras/${cameraId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export async function patchCameraZone(cameraId: string, body: CameraZoneUpdateInput): Promise<Camera> {
  return api<Camera>(`/api/v1/cameras/${cameraId}/zone`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export async function deleteCamera(cameraId: string): Promise<void> {
  await api<{ status: string; message?: string }>(`/api/v1/cameras/${cameraId}`, { method: 'DELETE' });
}

