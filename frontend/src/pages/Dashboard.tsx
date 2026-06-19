import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Common/Card';
import { Badge } from '../components/Common/Badge';
import { useDashboardStore } from '../store/dashboardStore';
import { Flame, Wind, Video, AlertTriangle, Activity, ShieldCheck, Zap } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

type TimelinePoint = { time: string; fire: number; smoke: number };

// Mock data to make the dashboard work and look attractive
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
    { id: '5', detection_type: 'smoke', timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(), location: 'Cafeteria', confidence: 0.65, camera_id: 'CAM-11' },
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
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.1 } 
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1, 
    transition: { type: 'spring', stiffness: 100 } 
  }
};

const Dashboard = () => {
  const { activeAlerts, fireAlerts, smokeAlerts, connectedCameras, recentAlerts, setStats } = useDashboardStore();
  const [timeline, setTimeline] = useState<TimelinePoint[]>([]);

  useEffect(() => {
    // Simulate API fetch delay
    const timer = setTimeout(() => {
      setStats(mockStats);
      setTimeline(mockTimeline);
    }, 500);
    return () => clearTimeout(timer);
  }, [setStats]);

  const metrics = [
    { label: 'Active Alerts', value: activeAlerts || 0, icon: <AlertTriangle size={28} className="text-amber-500" />, trend: '+2 today', color: 'from-amber-500/20 to-amber-500/5', border: 'border-amber-500/20' },
    { label: 'Fire Incidents', value: fireAlerts || 0, icon: <Flame size={28} className="text-rose-500" />, trend: '+1 today', color: 'from-rose-500/20 to-rose-500/5', border: 'border-rose-500/20' },
    { label: 'Smoke Incidents', value: smokeAlerts || 0, icon: <Wind size={28} className="text-orange-500" />, trend: '-3 today', color: 'from-orange-500/20 to-orange-500/5', border: 'border-orange-500/20' },
    { label: 'Active Cameras', value: connectedCameras || 0, icon: <Video size={28} className="text-indigo-500" />, trend: 'All online', color: 'from-indigo-500/20 to-indigo-500/5', border: 'border-indigo-500/20' },
  ];

  return (
    <motion.div 
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Welcome Header */}
      <motion.div variants={itemVariants} className="bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-950 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <ShieldCheck size={120} />
        </div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-sm font-medium mb-4 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            System Online & Active
          </div>
          <h1 className="text-4xl font-bold mb-2">Welcome to FireGuard AI</h1>
          <p className="text-slate-300 max-w-xl text-lg">
            Real-time monitoring and detection dashboard. Everything looks normal across your facilities.
          </p>
        </div>
      </motion.div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, i) => (
          <motion.div key={i} variants={itemVariants}>
            <Card className={`overflow-hidden relative group hover:-translate-y-1 transition-all duration-300 border-t-4 border-transparent hover:${metric.border} shadow-lg hover:shadow-xl`}>
              <div className={`absolute inset-0 bg-gradient-to-br ${metric.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white dark:bg-slate-800 shadow-sm rounded-2xl ring-1 ring-slate-100 dark:ring-slate-700">
                    {metric.icon}
                  </div>
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 rounded-full backdrop-blur-sm">
                    {metric.trend}
                  </span>
                </div>
                <div>
                  <h4 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-2 uppercase tracking-wider">{metric.label}</h4>
                  <div className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {metric.value}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <motion.div variants={itemVariants} className="col-span-1 lg:col-span-2">
          <Card className="h-full shadow-lg border-slate-200 dark:border-slate-800 overflow-hidden">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <Activity size={20} className="text-indigo-500" />
                Incident Timeline (24h)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorFire" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorSmoke" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" strokeOpacity={0.5} />
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--muted)' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--muted)' }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: '1px solid var(--border)', backgroundColor: 'var(--surface)', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                      itemStyle={{ color: 'var(--text)', fontWeight: 500 }}
                    />
                    <Area type="monotone" dataKey="smoke" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorSmoke)" />
                    <Area type="monotone" dataKey="fire" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorFire)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Live Alert Feed */}
        <motion.div variants={itemVariants} className="col-span-1">
          <Card className="flex flex-col h-full shadow-lg border-slate-200 dark:border-slate-800 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <Zap size={20} className="text-amber-500 fill-amber-500" />
                Live Alert Feed
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-0 custom-scrollbar max-h-[400px]">
              {recentAlerts.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                  <ShieldCheck size={48} className="mb-4 text-slate-300 dark:text-slate-600" />
                  <p className="text-base font-medium">No recent incidents</p>
                  <p className="text-sm mt-1">System is monitoring normally.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {recentAlerts.map((alert, index) => (
                    <motion.div 
                      key={alert.id} 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group flex flex-col gap-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge type={alert.detection_type}>{alert.detection_type}</Badge>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {alert.confidence ? Math.round(alert.confidence * 100) : 0}% Match
                          </span>
                        </div>
                        <span className="text-xs text-slate-400 font-medium">
                          {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg mt-1 ${alert.detection_type === 'fire' ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/20' : 'bg-orange-100 text-orange-600 dark:bg-orange-500/20'}`}>
                          {alert.detection_type === 'fire' ? <Flame size={16} /> : <Wind size={16} />}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {alert.location || 'Unknown Location'}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Camera: {alert.camera_id || 'Unknown'}
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

