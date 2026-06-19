import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/Common/Card';
import { Badge } from '../components/Common/Badge';
import { Button } from '../components/Common/Button';
import { Plane, Battery, Signal, Zap, AlertTriangle, ShieldCheck, Crosshair, Map as MapIcon, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Drones = () => {
  const [drones, setDrones] = useState([
    { id: 'DRN-Alpha', status: 'patrolling', battery: 84, signal: 98, sector: 'Sector 4 North' },
    { id: 'DRN-Bravo', status: 'charging', battery: 12, signal: 100, sector: 'Base Station' },
    { id: 'DRN-Charlie', status: 'intercepting', battery: 56, signal: 72, sector: 'Sector 7 East' },
  ]);

  const [selectedDrone, setSelectedDrone] = useState('DRN-Charlie');

  // Simulate random battery drain and signal fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setDrones(prev => prev.map(d => ({
        ...d,
        battery: d.status === 'charging' ? Math.min(100, d.battery + 2) : Math.max(0, d.battery - 1),
        signal: Math.max(40, Math.min(100, d.signal + (Math.random() > 0.5 ? 2 : -2)))
      })));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const activeDrone = drones.find(d => d.id === selectedDrone);

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <motion.h2 
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-3"
          >
            <Plane className="text-indigo-500" /> Autonomous Aerial Fleet
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
            className="text-gray-500 dark:text-gray-400 mt-2 text-lg"
          >
            Command and control center for UAV thermal surveillance.
          </motion.p>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" className="border-indigo-500/30 text-indigo-600 dark:text-indigo-400">
            <RotateCcw size={18} className="mr-2" /> Recall All
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <Zap size={18} className="mr-2" /> Deploy Reserve Fleet
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* Drone List */}
        <div className="space-y-4 xl:col-span-1">
          {drones.map(drone => (
            <motion.div 
              key={drone.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedDrone(drone.id)}
              className={`p-4 rounded-2xl cursor-pointer border-2 transition-all ${
                selectedDrone === drone.id 
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10' 
                  : 'border-gray-200 dark:border-white/5 bg-white dark:bg-[#151520] hover:border-indigo-300'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Plane size={16} className={drone.status === 'intercepting' ? 'text-rose-500 animate-pulse' : 'text-gray-400'} /> 
                  {drone.id}
                </h4>
                <Badge type={drone.status === 'intercepting' ? 'fire' : drone.status === 'charging' ? 'default' : 'smoke'}>
                  {drone.status}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-medium text-gray-500">
                  <span className="flex items-center gap-1"><Battery size={14} className={drone.battery < 20 ? 'text-red-500' : 'text-emerald-500'}/> {drone.battery}%</span>
                  <span className="flex items-center gap-1"><Signal size={14} className="text-blue-500"/> {drone.signal}%</span>
                </div>
                <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div className={`h-full ${drone.battery < 20 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${drone.battery}%` }}></div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Selected Drone Telemetry */}
        <div className="xl:col-span-3 space-y-6">
          <Card className="border-none shadow-xl bg-white dark:bg-[#151520] rounded-3xl overflow-hidden relative">
            <CardContent className="p-0">
              {/* Drone Camera Feed Mockup */}
              <div className="w-full aspect-[21/9] bg-slate-900 relative overflow-hidden group">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=2074&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-luminosity"></div>
                
                {/* Thermal filter overlay if intercepting */}
                {activeDrone?.status === 'intercepting' && (
                  <div className="absolute inset-0 bg-gradient-to-t from-rose-900/50 to-transparent mix-blend-overlay"></div>
                )}

                {/* HUD Elements */}
                <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between font-mono text-emerald-400">
                  <div className="flex justify-between">
                    <div>
                      <p>REC •</p>
                      <p>ALT: 420ft</p>
                      <p>SPD: 45knots</p>
                    </div>
                    <div className="text-right">
                      <p>GPS: 34.0522° N</p>
                      <p>118.2437° W</p>
                      <p>CAM: THERMAL</p>
                    </div>
                  </div>
                  
                  {activeDrone?.status === 'intercepting' && (
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
                    >
                      <Crosshair size={120} className="text-rose-500 opacity-80" />
                      <p className="mt-2 text-rose-500 font-bold bg-black/50 px-3 py-1 rounded">THERMAL ANOMALY DETECTED</p>
                    </motion.div>
                  )}

                  <div className="flex justify-between items-end">
                    <p>UAV ID: {activeDrone?.id}</p>
                    <p>SYSTEM OPTIMAL</p>
                  </div>
                </div>

                {/* Scanline effect */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none opacity-50"></div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-indigo-600 border-none text-white shadow-xl rounded-3xl overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-20"><MapIcon size={80} /></div>
              <CardContent className="p-6 relative z-10">
                <p className="text-indigo-200 text-sm font-bold uppercase tracking-wider mb-1">Current Sector</p>
                <h3 className="text-2xl font-black">{activeDrone?.sector}</h3>
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" className="border-indigo-400 text-white hover:bg-indigo-500 w-full text-xs">Reassign Sector</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-[#151520] border-none shadow-xl rounded-3xl">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">Payload</p>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white">Extinguisher</h3>
                  </div>
                  <ShieldCheck className="text-emerald-500" />
                </div>
                <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-blue-500 w-[80%]"></div>
                </div>
                <p className="text-xs text-gray-500 text-right font-medium">80% Capacity</p>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-[#151520] border-none shadow-xl rounded-3xl">
              <CardContent className="p-6 flex flex-col justify-center h-full gap-3">
                <Button className="w-full bg-rose-500 hover:bg-rose-600 text-white rounded-xl">Manual Override (Pilot)</Button>
                <Button variant="outline" className="w-full rounded-xl border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5">Return to Base</Button>
              </CardContent>
            </Card>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Drones;
