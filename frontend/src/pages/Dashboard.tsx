import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Common/Card';
import { Badge } from '../components/Common/Badge';
import { useDashboardStore } from '../store/dashboardStore';
import { Flame, Wind, Video, AlertTriangle, Activity, ShieldCheck, Zap, Maximize2, Radio } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

type TimelinePoint = { time: string; fire: number; smoke: number };

const mockStats = {
  totalAlerts: 145,
  activeAlerts: 12,
  fireAlerts: 34,
  smokeAlerts: 111,
  connectedCameras: 24,
  recentAlerts: [
    { id: '1', detection_type: 'fire', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), location: 'Warehouse A', confidence: 0.92, camera_id: 'CAM-01' },
    { id: '2', detection_type: 'smoke', timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), location: 'Loading Dock', confidence: 0.85, camera_id: 'CAM-04' },
    { id: '3', detection_type: 'smoke', timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), location: 'Lobby', confidence: 0.76, camera_id: 'CAM-02' },
    { id: '4', detection_type: 'fire', timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), location: 'Server Room', confidence: 0.98, camera_id: 'CAM-09' },
  ]
};

const mockTimeline: TimelinePoint[] = [
  { time: '00:00', fire: 0, smoke: 2 },
  { time: '04:00', fire: 1, smoke: 5 },
  { time: '08:00', fire: 3, smoke: 12 },
  { time: '12:00', fire: 2, smoke: 8 },
  { time: '16:00', fire: 5, smoke: 15 },
  { time: '20:00', fire: 1, smoke: 4 },
  { time: '24:00', fire: 0, smoke: 1 },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
};

const Dashboard = () => {
  const { activeAlerts, fireAlerts, smokeAlerts, connectedCameras, recentAlerts, setStats } = useDashboardStore();
  const [timeline, setTimeline] = useState<TimelinePoint[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setStats(mockStats);
      setTimeline(mockTimeline);
    }, 500);
    return () => clearTimeout(timer);
  }, [setStats]);

  const metrics = [
    { label: 'Active Alerts', value: activeAlerts || 0, icon: <AlertTriangle size={32} className="text-rose-500 drop-shadow-[0_0_10px_rgba(244,63,94,0.6)]" />, trend: '+2 today', color: 'from-rose-500 to-rose-600' },
    { label: 'Fire Incidents', value: fireAlerts || 0, icon: <Flame size={32} className="text-orange-500 drop-shadow-[0_0_10px_rgba(249,115,22,0.6)]" />, trend: '+1 today', color: 'from-orange-500 to-orange-600' },
    { label: 'Smoke Incidents', value: smokeAlerts || 0, icon: <Wind size={32} className="text-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.6)]" />, trend: '-3 today', color: 'from-amber-500 to-yellow-500' },
    { label: 'Live Feeds', value: connectedCameras || 0, icon: <Radio size={32} className="text-emerald-500 drop-shadow-[0_0_10px_rgba(16,185,129,0.6)] animate-pulse" />, trend: 'All online', color: 'from-emerald-500 to-teal-500' },
  ];

  return (
    <motion.div className="space-y-8 pb-10 relative" variants={containerVariants} initial="hidden" animate="visible">
      {/* Background Glowing Orbs */}
      <div className="absolute top-20 right-20 w-96 h-96 bg-rose-500/10 rounded-full blur-[100px] pointer-events-none -z-10 animate-pulse"></div>
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none -z-10 animate-pulse" style={{ animationDelay: '2s' }}></div>

      {/* Hero Banner */}
      <motion.div variants={itemVariants} className="bg-[#0f0f17] rounded-[2rem] p-10 text-white shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden border border-white/5">
        <div className="absolute top-0 right-0 p-10 opacity-5 -rotate-12 scale-150 transform origin-center translate-x-10 -translate-y-10">
          <Activity size={300} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 to-transparent pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Neural Engine Online
            </div>
            <h1 className="text-5xl font-black mb-3 tracking-tight">Global Command Center</h1>
            <p className="text-gray-400 max-w-xl text-lg font-medium leading-relaxed">
              Real-time deep learning surveillance. Monitoring all geographic sectors and thermal anomaly patterns.
            </p>
          </div>
          <div className="flex gap-4">
            <button className="h-12 px-6 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold backdrop-blur-md transition-all">Export Log</button>
            <button className="h-12 px-6 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white font-bold shadow-[0_0_20px_rgba(244,63,94,0.3)] transition-all">Initiate Scan</button>
          </div>
        </div>
      </motion.div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, i) => (
          <motion.div key={i} variants={itemVariants}>
            <Card className="overflow-hidden relative group border-none shadow-xl bg-white dark:bg-[#151520] rounded-[2rem] hover:-translate-y-1 transition-transform duration-300">
              <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${metric.color}`} />
              <CardContent className="p-8 relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div className="p-4 bg-gray-50 dark:bg-[#0a0a0f] rounded-2xl border border-gray-100 dark:border-white/5">
                    {metric.icon}
                  </div>
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-[#0a0a0f] px-3 py-1.5 rounded-full border border-gray-200 dark:border-white/5">
                    {metric.trend}
                  </span>
                </div>
                <div>
                  <h4 className="text-gray-500 dark:text-gray-400 text-xs font-bold mb-2 uppercase tracking-widest">{metric.label}</h4>
                  <div className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter">
                    {metric.value}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Area Chart */}
        <motion.div variants={itemVariants} className="col-span-1 lg:col-span-2">
          <Card className="h-full shadow-xl border-none bg-white dark:bg-[#151520] rounded-[2rem] overflow-hidden">
            <CardHeader className="border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-[#0a0a0f]/50 p-6">
              <CardTitle className="flex items-center justify-between text-lg font-bold">
                <div className="flex items-center gap-3">
                  <Activity size={24} className="text-rose-500" />
                  Thermal Incident Velocity (24h)
                </div>
                <Maximize2 size={18} className="text-gray-400 cursor-pointer hover:text-white transition-colors" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="h-96 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorFire" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.6}/>
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorSmoke" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.6}/>
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" strokeOpacity={0.2} />
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--muted)', fontWeight: 600 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--muted)', fontWeight: 600 }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '1rem', border: 'none', backgroundColor: '#151520', color: 'white', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}
                      itemStyle={{ fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="smoke" stroke="#f97316" strokeWidth={4} fillOpacity={1} fill="url(#colorSmoke)" />
                    <Area type="monotone" dataKey="fire" stroke="#f43f5e" strokeWidth={4} fillOpacity={1} fill="url(#colorFire)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Live Event Stream */}
        <motion.div variants={itemVariants} className="col-span-1">
          <Card className="flex flex-col h-full shadow-xl border-none bg-white dark:bg-[#151520] rounded-[2rem] overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-[#0a0a0f]/50 p-6">
              <CardTitle className="flex items-center gap-3 text-lg font-bold">
                <Zap size={24} className="text-amber-500 fill-amber-500" />
                Live Event Stream
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-2 custom-scrollbar max-h-[500px]">
              {recentAlerts.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8 text-center">
                  <ShieldCheck size={48} className="mb-4 text-emerald-500/50" />
                  <p className="text-lg font-bold">All Sectors Clear</p>
                  <p className="text-sm mt-1 font-medium text-gray-500">Awaiting detection events.</p>
                </div>
              ) : (
                <div className="p-2 space-y-3">
                  {recentAlerts.map((alert, index) => (
                    <motion.div 
                      key={alert.id} 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 rounded-2xl bg-gray-50 dark:bg-[#0a0a0f] border border-gray-100 dark:border-white/5 hover:border-rose-500/30 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <Badge type={alert.detection_type} className="shadow-sm">{alert.detection_type}</Badge>
                        <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                          {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className={`p-2.5 rounded-xl ${alert.detection_type === 'fire' ? 'bg-rose-500/20 text-rose-500' : 'bg-orange-500/20 text-orange-500'}`}>
                          {alert.detection_type === 'fire' ? <Flame size={20} /> : <Wind size={20} />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-rose-500 transition-colors">
                            {alert.location || 'Unknown Location'}
                          </p>
                          <p className="text-xs text-gray-500 font-medium mt-1 uppercase tracking-wider">
                            Source: {alert.camera_id || 'Unknown'}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;

