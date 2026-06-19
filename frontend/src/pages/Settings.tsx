
import { Card, CardContent, CardHeader, CardTitle } from '../components/Common/Card';
import { Button } from '../components/Common/Button';
import { useAppSettingsStore } from '../store/appSettingsStore';
import { Bell, Moon, Sun, Volume2 } from 'lucide-react';

const Settings = () => {
  const { theme, setTheme, notificationsEnabled, toggleNotifications, alertSoundEnabled, toggleAlertSound } = useAppSettingsStore();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your application preferences and system configurations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-2">
          <Button variant="ghost" className="w-full justify-start text-primary bg-primary/10">General</Button>
          <Button variant="ghost" className="w-full justify-start">Notifications</Button>
          <Button variant="ghost" className="w-full justify-start">Detection Rules</Button>
          <Button variant="ghost" className="w-full justify-start">Security</Button>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 dark:bg-slate-800 rounded-lg">
                    {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Theme Preference</h4>
                    <p className="text-sm text-gray-500">Toggle between light and dark mode</p>
                  </div>
                </div>
                <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-lg">
                  <button 
                    onClick={() => setTheme('light')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${theme === 'light' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Light
                  </button>
                  <button 
                    onClick={() => setTheme('dark')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${theme === 'dark' ? 'bg-slate-700 shadow-sm text-white' : 'text-gray-400 hover:text-gray-200'}`}
                  >
                    Dark
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notifications & Alerts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 dark:bg-slate-800 rounded-lg">
                    <Bell size={20} />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Push Notifications</h4>
                    <p className="text-sm text-gray-500">Receive alerts when incidents are detected</p>
                  </div>
                </div>
                <button 
                  onClick={toggleNotifications}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notificationsEnabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notificationsEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 dark:bg-slate-800 rounded-lg">
                    <Volume2 size={20} />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Alert Sounds</h4>
                    <p className="text-sm text-gray-500">Play an audible siren on critical alerts</p>
                  </div>
                </div>
                <button 
                  onClick={toggleAlertSound}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${alertSoundEnabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${alertSoundEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
