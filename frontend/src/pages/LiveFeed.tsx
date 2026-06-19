import { useEffect, useState } from 'react';
import { Card } from '../components/Common/Card';
import { Badge } from '../components/Common/Badge';
import { useLiveMonitoringStore } from '../store/liveMonitoringStore';
import { pushAlertToDashboardFeed } from '../store/dashboardWebsocketBridge';
import { Video, AlertTriangle, Pause, Maximize2, Crosshair, Sparkles } from 'lucide-react';
import { Button } from '../components/Common/Button';
import { connectAlertSocket } from '../services/api';
import type { Alert } from '../store/dashboardStore';
import { motion, AnimatePresence } from 'framer-motion';

const ScannerOverlay = ({ type }: { type: 'fire' | 'smoke' }) => {
  const color = type === 'fire' ? 'border-rose-500 bg-rose-500/20 text-rose-500' : 'border-orange-500 bg-orange-500/20 text-orange-500';
  const label = type === 'fire' ? 'FIRE DETECTED' : 'SMOKE DETECTED';

  return (
    <motion.div
      className={`absolute z-20 border-2 ${color} flex items-center justify-center backdrop-blur-[2px] shadow-[0_0_15px_rgba(244,63,94,0.5)]`}
      initial={{ opacity: 0, left: '20%', top: '20%', width: '120px', height: '120px' }}
      animate={{ 
        opacity: [0, 1, 0.8, 1], 
        left: ['20%', '30%', '25%'], 
        top: ['20%', '40%', '35%'],
        width: ['120px', '140px', '130px'],
        height: ['120px', '140px', '130px']
      }}
      transition={{ duration: 6, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
    >
      <div className="absolute -top-6 left-[-2px] bg-inherit border-inherit border-2 border-b-0 px-2 py-0.5 text-[10px] font-bold text-white tracking-wider flex items-center gap-1">
        <Crosshair size={10} />
        {label} {(Math.random() * 10 + 85).toFixed(1)}%
      </div>
      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-white"></div>
      <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-white"></div>
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-white"></div>
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-white"></div>
    </motion.div>
  );
};

const RadarSweep = () => (
  <motion.div 
    className="absolute inset-0 z-10 opacity-30 pointer-events-none origin-bottom"
    animate={{ opacity: [0.1, 0.3, 0.1] }}
    transition={{ duration: 2, repeat: Infinity }}
  >
    <div className="w-full h-full bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
    <motion.div 
      className="absolute top-0 left-0 w-full h-[20%] bg-gradient-to-b from-indigo-500/0 via-indigo-500/20 to-indigo-500/0"
      animate={{ y: ['-100%', '500%'] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
    />
  </motion.div>
);

const LiveFeed = () => {
  const { upsertLiveAlert, liveAlerts } = useLiveMonitoringStore();
  const [showAiInsights, setShowAiInsights] = useState(false);

  // Mock initial live alerts for effect
  useEffect(() => {
    if (liveAlerts.length === 0) {
      setTimeout(() => {
        upsertLiveAlert({
          id: 'live-1',
          detection_type: 'fire',
          confidence: 0.94,
          status: 'active',
          source_type: 'stream',
          camera_id: 'CAM-NORTH-01',
          location: 'Sector 4',
          timestamp: new Date().toISOString(),
        });
      }, 2000);
    }
  }, [liveAlerts.length, upsertLiveAlert]);

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-120px)]">
      {/* Live Streams Area */}
      <div className="flex-1 flex flex-col gap-6 relative">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <span className="relative flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]"></span>
              </span>
              Security Command Center
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Advanced AI-powered real-time surveillance grid.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowAiInsights(!showAiInsights)}
              className="border-indigo-500/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
            >
              <Sparkles size={16} className="mr-2" /> 
              {showAiInsights ? 'Hide AI Copilot' : 'AI Copilot'}
            </Button>
            <Button variant="primary" size="sm" className="bg-slate-800 hover:bg-slate-700 text-white border-none shadow-lg">
              <Maximize2 size={16} className="mr-2" /> Fullscreen Grid
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 flex-1">
          {/* Camera 1 with Fire Simulation */}
          <Card className="relative overflow-hidden group bg-slate-950 border border-slate-800 shadow-2xl flex flex-col rounded-2xl">
            <RadarSweep />
            <div className="absolute top-4 left-4 z-30 flex gap-2">
              <Badge type="default" className="bg-red-500/80 text-white border-none backdrop-blur-md shadow-[0_0_10px_rgba(239,68,68,0.5)]">LIVE</Badge>
              <Badge type="default" className="bg-black/60 text-white border border-white/10 backdrop-blur-md flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div> CAM-NORTH-01
              </Badge>
            </div>
            
            <ScannerOverlay type="fire" />

            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-900 to-black z-0">
              <div className="relative">
                <Video size={64} className="text-slate-800" />
                <motion.div 
                  className="absolute inset-0 border border-red-500/30 rounded-full"
                  animate={{ scale: [1, 1.5], opacity: [1, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
            </div>
            
            <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-black via-black/80 to-transparent flex items-end p-5 z-20">
              <div className="flex items-center justify-between w-full">
                <div>
                  <p className="text-white font-semibold text-lg drop-shadow-md">Sector 4 - Warehouse</p>
                  <p className="text-rose-400 text-sm font-medium mt-0.5 flex items-center gap-1">
                    <AlertTriangle size={14} /> Threat Detected
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className="text-xs font-mono text-green-400 bg-green-400/10 border border-green-400/20 px-2 py-0.5 rounded backdrop-blur-sm">4K / 60 FPS</span>
                  <span className="text-xs font-mono text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded backdrop-blur-sm">Latency: 12ms</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Camera 2 Normal */}
          <Card className="relative overflow-hidden group bg-slate-950 border border-slate-800 shadow-2xl flex flex-col rounded-2xl">
            <RadarSweep />
            <div className="absolute top-4 left-4 z-30 flex gap-2">
              <Badge type="default" className="bg-black/60 text-white border border-white/10 backdrop-blur-md flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-slate-500"></div> CAM-EAST-02
              </Badge>
            </div>
            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-900 to-black">
              <Video size={64} className="text-slate-800" />
            </div>
            <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-black via-black/80 to-transparent flex items-end p-5 z-20">
              <div className="flex items-center justify-between w-full">
                <div>
                  <p className="text-white font-semibold text-lg drop-shadow-md">Loading Dock B</p>
                  <p className="text-slate-400 text-sm mt-0.5">Clear - Monitoring</p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className="text-xs font-mono text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded backdrop-blur-sm">1080p / 30 FPS</span>
                  <span className="text-xs font-mono text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded backdrop-blur-sm">Latency: 15ms</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Side Panels */}
      <div className="w-full lg:w-[350px] flex flex-col gap-6 h-full">
        {/* AI Copilot Panel */}
        <AnimatePresence>
          {showAiInsights && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20, overflow: 'hidden' }}
              className="bg-gradient-to-b from-indigo-950 to-slate-900 border border-indigo-500/30 rounded-2xl p-5 shadow-[0_10px_30px_rgba(99,102,241,0.2)]"
            >
              <div className="flex items-center gap-2 text-indigo-400 mb-3">
                <Sparkles size={18} />
                <h3 className="font-semibold tracking-wide uppercase text-sm">AI Copilot Analysis</h3>
              </div>
              <div className="space-y-3">
                <p className="text-slate-300 text-sm leading-relaxed">
                  <span className="text-rose-400 font-semibold">Critical finding:</span> Heat signature anomalous in Sector 4. Growth rate suggests class A combustible. Suggest immediate dispatch to coordinates 34-A.
                </p>
                <div className="bg-indigo-900/40 p-3 rounded-lg border border-indigo-500/20">
                  <div className="flex justify-between text-xs text-indigo-200 mb-1">
                    <span>Threat Probability</span>
                    <span>94.2%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5">
                    <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: '94.2%' }}></div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Live Alerts Stream */}
        <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-lg">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between items-center">
            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-500" /> Event Stream
            </h3>
            <Badge type="default" className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">{liveAlerts.length} Active</Badge>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
            <AnimatePresence>
              {liveAlerts.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-full text-slate-400 text-center px-4 py-10">
                  <Sparkles size={32} className="mb-3 opacity-30" />
                  <p className="text-sm font-medium">All clear. System monitoring.</p>
                </motion.div>
              ) : (
                liveAlerts.map((alert) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    layout
                    className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm relative overflow-hidden"
                  >
                    <div className={`absolute top-0 left-0 w-1 h-full ${alert.detection_type === 'fire' ? 'bg-rose-500' : 'bg-orange-500'}`}></div>
                    <div className="flex items-center justify-between mb-3 pl-2">
                      <Badge type={alert.detection_type} className="shadow-sm">{alert.detection_type}</Badge>
                      <span className="text-[10px] text-slate-400 font-mono tracking-wider">{new Date(alert.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white pl-2">{alert.location || alert.camera_id || 'Unknown Location'}</p>
                    <div className="mt-3 pl-2 flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                        Match: {(alert.confidence * 100).toFixed(1)}%
                      </span>
                      <button className="text-indigo-500 hover:text-indigo-600 font-semibold uppercase tracking-wider text-[10px] bg-indigo-50 dark:bg-indigo-500/10 px-2 py-1 rounded">Action</button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveFeed;

