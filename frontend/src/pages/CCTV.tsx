import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../components/Common/Button';
import { Camera, Map as MapIcon, Settings, Maximize, AlertCircle, Signal, Battery, VideoOff, Crosshair, ZoomIn, ZoomOut, RotateCcw, ShieldAlert, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_CAMERAS = [
  { id: 'CAM-01', location: 'Main Entrance', status: 'online', type: 'PTZ', alert: false },
  { id: 'CAM-02', location: 'Loading Dock A', status: 'online', type: 'Fixed', alert: false },
  { id: 'CAM-03', location: 'Server Room', status: 'online', type: 'Thermal', alert: true },
  { id: 'CAM-04', location: 'Perimeter Fence', status: 'offline', type: 'PTZ', alert: false },
  { id: 'CAM-05', location: 'Cafeteria', status: 'online', type: 'Fixed', alert: false },
  { id: 'CAM-06', location: 'Parking Garage', status: 'online', type: 'PTZ', alert: false },
];

const CCTV = () => {
  const [cameras, setCameras] = useState(MOCK_CAMERAS);
  const [activeCam, setActiveCam] = useState('CAM-01');
  const [isManualOverride, setIsManualOverride] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Flash warning for alerts
  useEffect(() => {
    const interval = setInterval(() => {
      setCameras(prev => prev.map(c => 
        c.id === 'CAM-03' ? { ...c, alert: !c.alert } : c
      ));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleOverride = async () => {
    if (isManualOverride) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      setIsManualOverride(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setIsManualOverride(true);
      } catch (err) {
        console.error("Webcam error:", err);
      }
    }
  };

  const currentCamData = cameras.find(c => c.id === activeCam);

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col gap-6 font-sans">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
            <Cpu className="text-indigo-500" size={32} /> Central Surveillance Matrix
          </h1>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-widest">
            Enterprise Video Management System v4.2
          </p>
        </div>
        <div className="flex items-center gap-4 bg-white dark:bg-[#151520] p-2 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2 px-3 border-r border-gray-200 dark:border-gray-700">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-xs font-bold text-gray-600 dark:text-gray-300">SYSTEM ONLINE</span>
          </div>
          <div className="flex items-center gap-2 px-3 text-red-500">
            <AlertCircle size={16} />
            <span className="text-xs font-bold">1 ACTIVE THREAT</span>
          </div>
        </div>
      </div>

      {/* Main Grid Interface */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
        
        {/* Left Side: Video Wall Grid */}
        <div className="lg:col-span-3 grid grid-cols-2 lg:grid-cols-3 gap-4">
          {cameras.map((cam) => (
            <motion.div 
              key={cam.id}
              onClick={() => setActiveCam(cam.id)}
              whileHover={{ scale: 1.02 }}
              className={`relative rounded-xl overflow-hidden cursor-pointer group shadow-lg transition-all ${
                activeCam === cam.id ? 'ring-4 ring-indigo-500 z-10' : 'border border-gray-800'
              } ${cam.alert ? 'ring-2 ring-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]' : ''}`}
            >
              {/* Video Feed Placeholder */}
              <div className="absolute inset-0 bg-black">
                {cam.status === 'online' ? (
                  <div className={`w-full h-full bg-cover bg-center opacity-60 group-hover:opacity-100 transition-opacity ${cam.type === 'Thermal' ? 'mix-blend-luminosity' : ''}`} style={{ backgroundImage: `url(https://images.unsplash.com/photo-1557597774-9d273605dfa9?q=80&w=1000&auto=format&fit=crop)` }}></div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900">
                    <VideoOff size={32} className="text-gray-600 mb-2" />
                    <span className="text-gray-500 text-xs font-mono font-bold tracking-widest">NO SIGNAL</span>
                  </div>
                )}
                
                {cam.type === 'Thermal' && (
                  <div className="absolute inset-0 bg-gradient-to-t from-orange-900/40 to-transparent mix-blend-color"></div>
                )}
              </div>

              {/* Overlays */}
              <div className="absolute top-0 inset-x-0 p-3 bg-gradient-to-b from-black/80 to-transparent flex justify-between items-start">
                <div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black tracking-wider text-white ${cam.alert ? 'bg-red-500' : 'bg-black/50'}`}>
                    {cam.id}
                  </span>
                  <p className="text-white/80 text-xs font-medium mt-1 drop-shadow-md">{cam.location}</p>
                </div>
                {cam.type === 'PTZ' && <Crosshair size={14} className="text-white/50" />}
              </div>

              <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/80 to-transparent flex justify-between items-end font-mono text-[10px] text-emerald-400">
                <span>{cam.status === 'online' ? 'REC •' : ''}</span>
                <span>{new Date().toLocaleTimeString()}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Right Side: Active Camera Inspector & Controls */}
        <div className="flex flex-col gap-4">
          
          {/* Main Feed View */}
          <div className="bg-black rounded-2xl overflow-hidden shadow-2xl border border-gray-800 relative aspect-video flex-shrink-0">
            {isManualOverride ? (
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" style={{ transform: `scale(${zoomLevel})` }} />
            ) : (
              <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1557597774-9d273605dfa9?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center" style={{ transform: `scale(${zoomLevel})` }}></div>
            )}
            
            {/* HUD Overlay */}
            <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between border-[1px] border-white/10 m-2 rounded-lg">
              <div className="flex justify-between items-start font-mono text-xs font-bold text-white drop-shadow-md">
                <div className="flex flex-col gap-1">
                  <span className="bg-red-500 px-2 py-0.5 rounded flex items-center gap-2">LIVE <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span></span>
                  <span className="bg-black/50 px-2 py-0.5 rounded backdrop-blur-sm">{activeCam}</span>
                </div>
                <span className="bg-black/50 px-2 py-0.5 rounded backdrop-blur-sm">{currentCamData?.type} MODE</span>
              </div>
              <div className="flex justify-between items-end">
                <Crosshair size={24} className="text-white/30" />
                <span className="font-mono text-emerald-400 text-[10px] bg-black/80 px-2 py-1 rounded">ZOOM: {zoomLevel.toFixed(1)}X</span>
              </div>
            </div>
            {/* Scanlines */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none opacity-30"></div>
          </div>

          {/* Controls Deck */}
          <div className="bg-white dark:bg-[#151520] border border-gray-100 dark:border-gray-800 rounded-2xl p-5 flex-1 flex flex-col shadow-sm">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">PTZ Command Deck</h3>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-gray-50 dark:bg-[#1A1A24] p-3 rounded-xl">
                <span className="block text-[10px] text-gray-500 font-bold mb-1">LOCATION</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">{currentCamData?.location}</span>
              </div>
              <div className="bg-gray-50 dark:bg-[#1A1A24] p-3 rounded-xl">
                <span className="block text-[10px] text-gray-500 font-bold mb-1">NETWORK</span>
                <span className="text-sm font-semibold text-emerald-500 flex items-center gap-1"><Signal size={12}/> 99% STR</span>
              </div>
            </div>

            <div className="space-y-3 mt-auto">
              {currentCamData?.type === 'PTZ' && (
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setZoomLevel(z => Math.min(z + 0.5, 5.0))}>
                    <ZoomIn size={16} />
                  </Button>
                  <Button variant="outline" className="flex-1 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setZoomLevel(z => Math.max(z - 0.5, 1.0))}>
                    <ZoomOut size={16} />
                  </Button>
                  <Button variant="outline" className="flex-1 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setZoomLevel(1.0)}>
                    <RotateCcw size={16} />
                  </Button>
                </div>
              )}
              
              <Button 
                onClick={toggleOverride}
                disabled={currentCamData?.status === 'offline'}
                className={`w-full py-4 text-white font-bold rounded-xl shadow-lg transition-all ${isManualOverride ? 'bg-red-500 hover:bg-red-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}
              >
                {isManualOverride ? 'DISENGAGE MANUAL OVERRIDE' : 'ENGAGE OPTICAL OVERRIDE'}
              </Button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CCTV;
