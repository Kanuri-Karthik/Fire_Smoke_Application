import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '../components/Common/Card';
import { Badge } from '../components/Common/Badge';
import { Button } from '../components/Common/Button';
import { Camera, Camera as CameraIcon, Signal, Zap, AlertTriangle, ShieldCheck, Crosshair, Map as MapIcon, RotateCcw, VideoOff, Video as VideoIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CCTV = () => {
  const [cameras, setCameras] = useState([
    { id: 'PTZ-Alpha', status: 'patrolling', zoom: 1.2, signal: 98, sector: 'Sector 4 North' },
    { id: 'PTZ-Bravo', status: 'offline', zoom: 1.0, signal: 0, sector: 'Loading Dock' },
    { id: 'PTZ-Charlie', status: 'tracking', zoom: 4.5, signal: 92, sector: 'Sector 7 East' },
  ]);

  const [selectedCamera, setSelectedCamera] = useState('PTZ-Charlie');
  const [isLive, setIsLive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Simulate random signal fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setCameras(prev => prev.map(c => ({
        ...c,
        signal: c.status === 'offline' ? 0 : Math.max(40, Math.min(100, c.signal + (Math.random() > 0.5 ? 2 : -2)))
      })));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const toggleLiveFeed = async () => {
    if (isLive) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setIsLive(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setIsLive(true);
      } catch (err) {
        console.error("Error accessing webcam:", err);
        alert("Unable to access camera for live feed. Please check permissions.");
      }
    }
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const activeCamera = cameras.find(c => c.id === selectedCamera);

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <motion.h2 
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-3"
          >
            <CameraIcon className="text-indigo-500" /> PTZ Camera Network
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
            className="text-gray-500 dark:text-gray-400 mt-2 text-lg"
          >
            Command and control center for Pan-Tilt-Zoom thermal surveillance.
          </motion.p>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" className="border-indigo-500/30 text-indigo-600 dark:text-indigo-400">
            <RotateCcw size={18} className="mr-2" /> Reset All PTZ
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <Zap size={18} className="mr-2" /> Activate Reserve Network
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* Camera List */}
        <div className="space-y-4 xl:col-span-1">
          {cameras.map(cam => (
            <motion.div 
              key={cam.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedCamera(cam.id)}
              className={`p-4 rounded-2xl cursor-pointer border-2 transition-all ${
                selectedCamera === cam.id 
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10' 
                  : 'border-gray-200 dark:border-white/5 bg-white dark:bg-[#151520] hover:border-indigo-300'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <CameraIcon size={16} className={cam.status === 'tracking' ? 'text-rose-500 animate-pulse' : 'text-gray-400'} /> 
                  {cam.id}
                </h4>
                <Badge type={cam.status === 'tracking' ? 'fire' : cam.status === 'offline' ? 'default' : 'smoke'}>
                  {cam.status}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-medium text-gray-500">
                  <span className="flex items-center gap-1">Zoom: {cam.zoom.toFixed(1)}x</span>
                  <span className="flex items-center gap-1"><Signal size={14} className={cam.signal < 20 ? 'text-red-500' : 'text-blue-500'}/> {cam.signal}%</span>
                </div>
                <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div className={`h-full ${cam.signal < 20 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${cam.signal}%` }}></div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Selected Camera Telemetry */}
        <div className="xl:col-span-3 space-y-6">
          <Card className="border-none shadow-xl bg-white dark:bg-[#151520] rounded-3xl overflow-hidden relative">
            <CardContent className="p-0">
              {/* Camera Feed Mockup */}
              <div className="w-full aspect-[21/9] bg-black relative overflow-hidden group">
                
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className={`absolute inset-0 w-full h-full object-cover ${isLive ? 'opacity-100' : 'opacity-0'} transition-opacity duration-1000`} 
                />
                
                {!isLive && (
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=2074&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-luminosity"></div>
                )}
                
                {/* Thermal filter overlay if tracking */}
                {activeCamera?.status === 'tracking' && (
                  <div className="absolute inset-0 bg-gradient-to-t from-rose-900/50 to-transparent mix-blend-overlay pointer-events-none"></div>
                )}

                {/* HUD Elements */}
                <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between font-mono text-emerald-400">
                  <div className="flex justify-between">
                    <div>
                      <p className="flex items-center gap-2">
                        {isLive ? <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span> : null}
                        {isLive ? 'LIVE REC' : 'STANDBY'}
                      </p>
                      <p>PAN: {isLive ? '12°' : '45°'}</p>
                      <p>TILT: {isLive ? '-5°' : '15°'}</p>
                    </div>
                    <div className="text-right">
                      <p>LAT: 34.0522° N</p>
                      <p>LON: 118.2437° W</p>
                      <p>MODE: {isLive ? 'OPTICAL' : 'THERMAL'}</p>
                    </div>
                  </div>
                  
                  {activeCamera?.status === 'tracking' && !isLive && (
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
                    >
                      <Crosshair size={120} className="text-rose-500 opacity-80" />
                      <p className="mt-2 text-rose-500 font-bold bg-black/50 px-3 py-1 rounded">THERMAL ANOMALY DETECTED</p>
                    </motion.div>
                  )}

                  <div className="flex justify-between items-end">
                    <p>CAM ID: {activeCamera?.id}</p>
                    <p>{isLive ? 'MANUAL OVERRIDE' : 'SYSTEM OPTIMAL'}</p>
                  </div>
                </div>

                {/* Scanline effect */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none opacity-50 mix-blend-overlay"></div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-indigo-600 border-none text-white shadow-xl rounded-3xl overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-20"><MapIcon size={80} /></div>
              <CardContent className="p-6 relative z-10">
                <p className="text-indigo-200 text-sm font-bold uppercase tracking-wider mb-1">Current Sector</p>
                <h3 className="text-2xl font-black">{activeCamera?.sector}</h3>
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" className="border-indigo-400 text-white hover:bg-indigo-500 w-full text-xs">Reassign Sector</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-[#151520] border-none shadow-xl rounded-3xl">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">Subsystem</p>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white">IR Illuminator</h3>
                  </div>
                  <ShieldCheck className="text-emerald-500" />
                </div>
                <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-blue-500 w-[80%]"></div>
                </div>
                <p className="text-xs text-gray-500 text-right font-medium">80% Range</p>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-[#151520] border-none shadow-xl rounded-3xl">
              <CardContent className="p-6 flex flex-col justify-center h-full gap-3">
                <Button 
                  onClick={toggleLiveFeed}
                  className={`w-full text-white rounded-xl ${isLive ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-indigo-500 hover:bg-indigo-600'}`}
                >
                  {isLive ? <VideoOff className="mr-2" size={18} /> : <VideoIcon className="mr-2" size={18} />}
                  {isLive ? 'End Manual Override' : 'Manual PTZ Override'}
                </Button>
                <Button variant="outline" className="w-full rounded-xl border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5">Reset to Home Position</Button>
              </CardContent>
            </Card>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CCTV;
