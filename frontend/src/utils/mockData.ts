export interface Camera {
  id: string;
  name: string;
  location: string;
  ip: string;
  status: 'Online' | 'Offline' | 'Maintenance';
  resolution: string;
}

export const CAMERAS: Camera[] = [
  { id: 'CAM-01', name: 'Warehouse Entrance', location: 'Warehouse', ip: '192.168.1.101', status: 'Online', resolution: '1080p' },
  { id: 'CAM-02', name: 'Production Floor A', location: 'Production Floor', ip: '192.168.1.102', status: 'Online', resolution: '4K' },
  { id: 'CAM-03', name: 'Chemical Storage', location: 'Storage', ip: '192.168.1.103', status: 'Maintenance', resolution: '1080p' },
  { id: 'CAM-04', name: 'Loading Dock', location: 'Logistics', ip: '192.168.1.104', status: 'Online', resolution: '1080p' },
  { id: 'CAM-05', name: 'Server Room', location: 'IT Dept', ip: '192.168.1.105', status: 'Online', resolution: '4K' },
];

export const TECH_STACK = [
  { name: 'Python', description: 'Core AI processing and computer vision backend.', icon: 'python' },
  { name: 'OpenCV', description: 'Image processing and real-time frame analysis.', icon: 'video' },
  { name: 'YOLOv8', description: 'State-of-the-art object detection for Fire & Smoke.', icon: 'target' },
  { name: 'React', description: 'Modern, high-performance frontend for real-time monitoring.', icon: 'code' },
  { name: 'FastAPI', description: 'High-performance backend API with WebSocket support.', icon: 'zap' },
  { name: 'Tailwind CSS', description: 'Utility-first CSS for a professional industrial design.', icon: 'layout' },
];
