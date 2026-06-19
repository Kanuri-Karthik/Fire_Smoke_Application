import { useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Flame, Activity, LayoutDashboard, History, Settings, Video, AlertTriangle, Moon, Sun, Bell, Map, Camera, ShieldCheck } from 'lucide-react';
import { useAppSettingsStore } from '../store/appSettingsStore';
import { useWebSocketStore } from '../store/websocketStore';
import { APP_CONFIG } from '../config/appConfig';
import { motion, AnimatePresence } from 'framer-motion';

const Layout = () => {
  const location = useLocation();
  const { theme, setTheme, notificationsEnabled, toggleNotifications } = useAppSettingsStore();
  const { connect, disconnect, isConnected } = useWebSocketStore();

  useEffect(() => {
    connect(APP_CONFIG.websocketUrl);
    return () => disconnect();
  }, [connect, disconnect]);

  const navItems = [
    { path: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { path: '/live', icon: <Activity size={18} />, label: 'Live' },
    { path: '/incidents', icon: <AlertTriangle size={18} />, label: 'Incidents' },
    { path: '/evacuation', icon: <Map size={18} />, label: 'Evacuation' },
    { path: '/cctv', icon: <Camera size={18} />, label: 'PTZ CCTV' },
    { path: '/upload', icon: <Video size={18} />, label: 'Analysis' },
  ];

  return (
    <div className="flex flex-col h-screen bg-[#050508] text-gray-100 font-sans selection:bg-rose-500/30 overflow-hidden relative">
      {/* Deep Cyberpunk Background Glows */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-900/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-rose-900/20 blur-[120px] rounded-full"></div>
        <div className="absolute top-[20%] right-[20%] w-[20%] h-[20%] bg-orange-900/10 blur-[100px] rounded-full"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
      </div>

      {/* Floating Glass Top Navigation */}
      <header className="fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl h-[70px] bg-white/5 dark:bg-[#0a0a0f]/60 backdrop-blur-2xl border border-white/10 dark:border-white/5 rounded-3xl z-50 flex items-center justify-between px-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        
        {/* Brand */}
        <div className="flex items-center gap-3 text-white font-bold text-2xl tracking-tight">
          <div className="relative">
            <div className="absolute inset-0 bg-rose-500 blur-md rounded-full opacity-50"></div>
            <Flame className="w-8 h-8 text-rose-500 relative z-10" fill="currentColor" />
          </div>
          <span className="drop-shadow-sm hidden md:block">FireGuard<span className="font-black text-rose-500 ml-1">X</span></span>
        </div>

        {/* Center Nav */}
        <nav className="hidden lg:flex items-center gap-2 bg-white/5 dark:bg-black/20 p-1.5 rounded-2xl border border-white/5">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `relative px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
                  isActive
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="top-nav-active"
                      className="absolute inset-0 bg-gradient-to-r from-rose-500 to-indigo-600 rounded-xl z-0 shadow-lg"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{item.icon}</span>
                  <span className="relative z-10">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
            <div className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isConnected ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isConnected ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
            </div>
            <span className="text-[10px] font-black tracking-widest uppercase text-gray-400">
              {isConnected ? 'UPLINK ESTABLISHED' : 'OFFLINE'}
            </span>
          </div>

          <button onClick={toggleNotifications} className={`p-2 rounded-xl transition-all relative ${notificationsEnabled ? 'text-white bg-white/10' : 'text-gray-500 hover:bg-white/5'}`}>
            <Bell size={18} />
            {notificationsEnabled && <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse"></span>}
          </button>
          
          <NavLink to="/settings" className="p-2 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition-all">
            <Settings size={18} />
          </NavLink>

          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-rose-500 flex items-center justify-center border-2 border-white/20 cursor-pointer hover:scale-105 transition-transform shadow-[0_0_15px_rgba(99,102,241,0.4)]">
            <ShieldCheck size={18} className="text-white" />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full h-full relative z-10 pt-[110px] pb-6 px-6 overflow-hidden">
        <div className="w-full max-w-[1600px] h-full mx-auto bg-white/5 dark:bg-[#0a0a0f]/40 backdrop-blur-md border border-white/10 dark:border-white/5 rounded-3xl overflow-hidden shadow-2xl relative">
          
          {/* Subtle Inner Glow */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          
          <div className="h-full overflow-y-auto custom-scrollbar p-6 lg:p-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, scale: 0.98, filter: 'blur(8px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 0.98, filter: 'blur(8px)' }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="h-full"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
