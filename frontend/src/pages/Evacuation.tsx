import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/Common/Card';
import { Badge } from '../components/Common/Badge';
import { Button } from '../components/Common/Button';
import { ShieldAlert, Users, DoorOpen, ArrowRight, ShieldCheck, Siren, Activity, Map } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIncidentStore } from '../store/incidentStore';

const Evacuation = () => {
  const incidents = useIncidentStore(state => state.incidents);
  const activeAlerts = incidents.filter(i => i.status === 'active');
  
  const [systemState, setSystemState] = useState<'monitoring' | 'evacuation' | 'lockdown'>('monitoring');
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (activeAlerts.length > 0 && systemState === 'monitoring') {
      setSystemState('evacuation');
    } else if (activeAlerts.length === 0) {
      setSystemState('monitoring');
      setElapsedTime(0);
    }
  }, [activeAlerts.length]);

  useEffect(() => {
    let interval: number;
    if (systemState !== 'monitoring') {
      interval = window.setInterval(() => setElapsedTime(prev => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [systemState]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <motion.h2 
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-3"
          >
            <Map className="text-rose-500" /> Tactical Evacuation
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
            className="text-gray-500 dark:text-gray-400 mt-2 text-lg"
          >
            Dynamic pathfinding and personnel safety routing.
          </motion.p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className={`border-gray-300 dark:border-gray-700 ${systemState === 'lockdown' ? 'bg-orange-500/20 text-orange-500 border-orange-500/50' : ''}`}
            onClick={() => setSystemState(systemState === 'lockdown' ? 'evacuation' : 'lockdown')}
          >
            <ShieldCheck size={18} className="mr-2" /> 
            {systemState === 'lockdown' ? 'Lift Lockdown' : 'Initiate Lockdown'}
          </Button>
          <Button 
            className={`text-white transition-all ${systemState !== 'monitoring' ? 'bg-red-600 hover:bg-red-700 animate-pulse' : 'bg-gray-800 hover:bg-gray-900 dark:bg-gray-700'}`}
            onClick={() => setSystemState(systemState === 'monitoring' ? 'evacuation' : 'monitoring')}
          >
            <Siren size={18} className="mr-2" /> 
            {systemState !== 'monitoring' ? 'Cancel Alarm' : 'Trigger Alarm'}
          </Button>
        </div>
      </div>

      {/* Dynamic Status Banner */}
      <AnimatePresence mode="wait">
        {systemState !== 'monitoring' && (
          <motion.div
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            className="overflow-hidden"
          >
            <div className={`p-6 rounded-3xl border flex items-center justify-between ${
              systemState === 'evacuation' 
                ? 'bg-rose-500/10 border-rose-500/30' 
                : 'bg-orange-500/10 border-orange-500/30'
            }`}>
              <div className="flex items-center gap-6">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  systemState === 'evacuation' ? 'bg-rose-500 text-white animate-bounce' : 'bg-orange-500 text-white'
                }`}>
                  {systemState === 'evacuation' ? <ArrowRight size={32} /> : <ShieldAlert size={32} />}
                </div>
                <div>
                  <h3 className={`text-2xl font-black uppercase tracking-widest ${
                    systemState === 'evacuation' ? 'text-rose-600 dark:text-rose-400' : 'text-orange-600 dark:text-orange-400'
                  }`}>
                    {systemState === 'evacuation' ? 'Evacuation Ordered' : 'Building Lockdown'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 font-medium mt-1">
                    {systemState === 'evacuation' ? 'Please proceed to the nearest safe exit.' : 'All primary access points have been sealed.'}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-1">Time Elapsed</p>
                <p className="text-4xl font-mono font-black text-gray-900 dark:text-white tracking-tighter">
                  {formatTime(elapsedTime)}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Floor Plan Visualization */}
        <Card className="xl:col-span-2 border-none shadow-xl bg-white dark:bg-[#151520] rounded-3xl overflow-hidden relative">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 dark:opacity-10 pointer-events-none mix-blend-overlay"></div>
          
          <CardContent className="p-8 relative z-10">
            <div className="flex items-center justify-between mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
              <h3 className="text-lg font-bold">Floor 3 - Engineering Wing</h3>
              <div className="flex gap-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-rose-500 rounded-full"></div> Hazard</span>
                <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div> Safe Route</span>
                <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div> Personnel</span>
              </div>
            </div>

            {/* The Map Concept */}
            <div className="w-full aspect-video bg-gray-100 dark:bg-[#0a0a0f] rounded-2xl border-2 border-gray-200 dark:border-white/5 relative p-4 overflow-hidden">
              
              {/* Corridors */}
              <div className="absolute top-[30%] left-[10%] right-[10%] h-[40%] bg-gray-200 dark:bg-[#1c1c28] rounded-xl border border-gray-300 dark:border-white/10"></div>
              <div className="absolute top-[10%] bottom-[10%] left-[45%] w-[10%] bg-gray-200 dark:bg-[#1c1c28] rounded-xl border border-gray-300 dark:border-white/10"></div>

              {/* Rooms */}
              <div className="absolute top-[10%] left-[10%] w-[30%] h-[15%] bg-white dark:bg-[#151520] rounded-lg border border-gray-300 dark:border-white/10 flex items-center justify-center text-gray-400 font-bold text-xs">Lab A</div>
              <div className="absolute top-[10%] right-[10%] w-[30%] h-[15%] bg-white dark:bg-[#151520] rounded-lg border border-gray-300 dark:border-white/10 flex items-center justify-center text-gray-400 font-bold text-xs">Lab B</div>
              <div className="absolute bottom-[10%] left-[10%] w-[30%] h-[15%] bg-white dark:bg-[#151520] rounded-lg border border-gray-300 dark:border-white/10 flex items-center justify-center text-gray-400 font-bold text-xs">Server Room</div>
              
              {/* Exits */}
              <div className="absolute bottom-[5%] right-[10%] px-3 py-1 bg-emerald-500/20 text-emerald-500 border border-emerald-500/50 rounded flex items-center gap-1 text-xs font-bold uppercase"><DoorOpen size={14}/> Exit Primary</div>
              <div className="absolute top-[5%] left-[40%] px-3 py-1 bg-emerald-500/20 text-emerald-500 border border-emerald-500/50 rounded flex items-center gap-1 text-xs font-bold uppercase"><DoorOpen size={14}/> Exit North</div>

              {/* Dynamic Overlay based on state */}
              {systemState !== 'monitoring' && (
                <>
                  {/* Fire Hazard */}
                  <motion.div 
                    initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    className="absolute top-[40%] left-[25%] w-20 h-20 bg-rose-500/30 rounded-full blur-md flex items-center justify-center"
                  >
                    <div className="w-6 h-6 bg-rose-500 rounded-full animate-ping"></div>
                  </motion.div>

                  {/* Escape Route */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                    <motion.path 
                      d="M 600,180 L 600,250 L 800,250 L 800,450" 
                      fill="none" 
                      stroke="#10b981" 
                      strokeWidth="6" 
                      strokeDasharray="10 10" 
                      className="animate-[dash_1s_linear_infinite]"
                      style={{ filter: 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.8))' }}
                    />
                     <motion.path 
                      d="M 200,180 L 200,200 L 400,200 L 400,60" 
                      fill="none" 
                      stroke="#10b981" 
                      strokeWidth="6" 
                      strokeDasharray="10 10" 
                      className="animate-[dash_1s_linear_infinite]"
                      style={{ filter: 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.8))' }}
                    />
                  </svg>
                  
                  {/* Personnel Markers */}
                  <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 1 }} className="absolute top-[20%] left-[20%] w-4 h-4 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)] border-2 border-white"></motion.div>
                  <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.2 }} className="absolute top-[25%] right-[25%] w-4 h-4 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)] border-2 border-white"></motion.div>
                </>
              )}
            </div>
            
            <style>{`
              @keyframes dash {
                to { stroke-dashoffset: -20; }
              }
            `}</style>
          </CardContent>
        </Card>

        {/* Action Center Sidebar */}
        <div className="space-y-6">
          <Card className="border-none shadow-xl bg-white dark:bg-[#151520] rounded-3xl overflow-hidden">
             <CardContent className="p-6">
               <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Activity className="text-rose-500" size={18}/> Copilot Guidance</h3>
               
               <div className="space-y-4">
                 <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#0a0a0f] border border-gray-100 dark:border-gray-800">
                    <Badge type="warning" className="mb-2">Priority 1</Badge>
                    <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">Verify structural integrity of Server Room firewalls.</p>
                 </div>
                 <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#0a0a0f] border border-gray-100 dark:border-gray-800">
                    <Badge type="default" className="mb-2 bg-blue-500/10 text-blue-500">Priority 2</Badge>
                    <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">Dispatch security to guide personnel out of Lab A via North Exit.</p>
                 </div>
                 <Button className="w-full mt-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl">Generate Incident Report PDF</Button>
               </div>
             </CardContent>
          </Card>

          <Card className="border-none shadow-xl bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl overflow-hidden text-white">
             <CardContent className="p-8">
               <Users size={32} className="mb-4 text-blue-200" />
               <h3 className="text-3xl font-black mb-1">42</h3>
               <p className="text-blue-200 font-medium text-sm">Personnel currently in affected zones</p>
               
               <div className="mt-6 pt-6 border-t border-blue-500/30">
                 <div className="flex justify-between items-center mb-2">
                   <span className="text-sm font-medium">Evacuation Progress</span>
                   <span className="text-sm font-bold">65%</span>
                 </div>
                 <div className="h-2 bg-black/20 rounded-full overflow-hidden">
                   <motion.div 
                     initial={{ width: 0 }} 
                     animate={{ width: systemState === 'evacuation' ? '65%' : '0%' }} 
                     transition={{ duration: 1 }}
                     className="h-full bg-emerald-400"
                   ></motion.div>
                 </div>
               </div>
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Evacuation;
