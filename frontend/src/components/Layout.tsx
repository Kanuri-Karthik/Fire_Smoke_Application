import { useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Flame, Activity, LayoutDashboard, History, Settings, Video, AlertTriangle, Moon, Sun, Bell, Map, Camera } from 'lucide-react';
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
    { path: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { path: '/live', icon: <Activity size={20} />, label: 'Live Monitoring' },
    { path: '/incidents', icon: <AlertTriangle size={20} />, label: 'Incident Center' },
    { path: '/evacuation', icon: <Map size={20} />, label: 'Evacuation Routes' },
    { path: '/cctv', icon: <Camera size={20} />, label: 'PTZ CCTV Network' },
    { path: '/upload', icon: <Video size={20} />, label: 'Upload' },
    { path: '/cameras', icon: <Video size={20} />, label: 'Cameras' },
    { path: '/history', icon: <History size={20} />, label: 'History' },
    { path: '/settings', icon: <Settings size={20} />, label: 'Settings' },
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#0a0a0f] text-gray-900 dark:text-gray-100 font-sans transition-colors duration-200 selection:bg-rose-500/30 overflow-hidden relative">
      {/* Global Background Glow */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rose-900/10 via-[#0a0a0f]/0 to-[#0a0a0f]/0 dark:from-rose-900/20 z-0"></div>

      {/* Sidebar */}
      <aside className="w-[280px] border-r border-gray-200/80 dark:border-white/5 bg-white/80 dark:bg-[#0f0f17]/80 backdrop-blur-xl flex flex-col relative z-20 shadow-xl">
        <div className="h-[76px] flex items-center px-8 border-b border-gray-200/50 dark:border-white/5">
          <div className="flex items-center gap-3 text-rose-600 dark:text-rose-500 font-bold text-2xl tracking-tight relative">
            <div className="absolute inset-0 bg-rose-500/20 blur-xl rounded-full"></div>
            <Flame className="w-7 h-7 fill-current relative z-10 drop-shadow-[0_0_15px_rgba(244,63,94,0.8)]" />
            <span className="relative z-10 drop-shadow-sm">FireGuard<span className="text-gray-900 dark:text-white font-black ml-1">AI</span></span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-8 px-4 custom-scrollbar">
          <p className="px-4 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">Main Navigation</p>
          <nav className="space-y-1.5">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[15px] font-semibold transition-all duration-300 overflow-hidden ${
                    isActive
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.div
                        layoutId="active-nav"
                        className="absolute inset-0 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-2xl z-0"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                      {item.icon}
                    </span>
                    <span className="relative z-10">{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="p-5 border-t border-gray-200/50 dark:border-white/5 bg-gray-50/50 dark:bg-black/20 flex items-center justify-between backdrop-blur-md">
          <div className="flex items-center gap-3 bg-white dark:bg-[#151520] px-3 py-2 rounded-xl shadow-sm border border-gray-200/50 dark:border-white/5">
            <div className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isConnected ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isConnected ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
            </div>
            <span className="text-xs font-bold tracking-wide uppercase text-gray-600 dark:text-gray-300">
              {isConnected ? 'Connected' : 'Offline'}
            </span>
          </div>
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2.5 rounded-xl text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white bg-white dark:bg-[#151520] border border-gray-200/50 dark:border-white/5 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 active:scale-95"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative z-10">
        {/* Top Header */}
        <header className="h-[76px] border-b border-gray-200/50 dark:border-white/5 bg-white/40 dark:bg-[#0f0f17]/40 backdrop-blur-xl flex items-center justify-between px-10 z-20 sticky top-0">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
            {location.pathname.replace('/', '').replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Dashboard'}
          </h1>
          <div className="flex items-center gap-5">
            <button 
              onClick={toggleNotifications}
              className={`p-2.5 rounded-xl transition-all duration-300 relative bg-white dark:bg-[#151520] border border-gray-200/50 dark:border-white/5 shadow-sm hover:shadow-md hover:scale-105 active:scale-95 ${notificationsEnabled ? 'text-gray-800 dark:text-gray-200' : 'text-gray-400'}`}
            >
              <Bell size={18} />
              {notificationsEnabled && <span className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-[#151520] animate-pulse"></span>}
            </button>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 text-white flex items-center justify-center font-bold text-sm shadow-[0_4px_10px_rgba(244,63,94,0.3)] ring-2 ring-white dark:ring-[#0f0f17] cursor-pointer hover:scale-105 transition-transform">
              AD
            </div>
          </div>
        </header>
        
        {/* Page Content with Transitions */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar relative z-0">
          <div className="max-w-[1600px] mx-auto h-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 15, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -15, filter: 'blur(4px)' }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
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
