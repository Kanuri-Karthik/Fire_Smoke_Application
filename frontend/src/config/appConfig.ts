export const APP_CONFIG = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:6000',
  evidenceBaseUrl:
    import.meta.env.VITE_EVIDENCE_BASE_URL ??
    (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:6000'),
  wsBaseUrl: import.meta.env.VITE_WS_URL ?? 'ws://localhost:6000/ws/alerts',
  websocketUrl: import.meta.env.VITE_WS_URL ?? 'ws://localhost:6000/ws/alerts',
};


