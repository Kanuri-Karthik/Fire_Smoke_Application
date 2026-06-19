import { useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Flame, Activity, LayoutDashboard, History, Settings, Video, AlertTriangle, Moon, Sun, Bell } from 'lucide-react';
import { useAppSettingsStore } from '../store/appSettingsStore';
import { useWebSocketStore } from '../store/websocketStore';
import { APP_CONFIG } from '../config/appConfig';

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
    { path: '/upload', icon: <Video size={20} />, label: 'Upload' },
    { path: '/cameras', icon: <Video size={20} />, label: 'Cameras' },
    { path: '/history', icon: <History size={20} />, label: 'History' },
    { path: '/settings', icon: <Settings size={20} />, label: 'Settings' },
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#0a0a0f] text-gray-900 dark:text-gray-100 font-sans transition-colors duration-200">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0f0f17] flex flex-col relative z-10 shadow-sm">
        <div className="h-16 flex items-center px-6 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2.5 text-red-600 dark:text-red-500 font-bold text-xl tracking-tight">
            <Flame className="w-6 h-6 fill-current" />
            <span>FireGuard<span className="text-gray-900 dark:text-white font-black ml-1">AI</span></span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-3">
          <p className="px-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Main Menu</p>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                  }`
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {isConnected ? 'System Online' : 'Connecting...'}
            </span>
          </div>
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-gray-50 dark:bg-[#0a0a0f]">
        {/* Top Header */}
        <header className="h-16 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-[#0f0f17]/80 backdrop-blur-md flex items-center justify-between px-8 z-10">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
            {location.pathname.replace('/', '').replace('-', ' ')}
          </h1>
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleNotifications}
              className={`p-2 rounded-full transition-colors relative ${notificationsEnabled ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400'}`}
            >
              <Bell size={20} />
              {notificationsEnabled && <span className="absolute top-1 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#0f0f17]"></span>}
            </button>
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-red-500 to-orange-500 text-white flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-white dark:ring-[#0f0f17]">
              AD
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto h-full">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
