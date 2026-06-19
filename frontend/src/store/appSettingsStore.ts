import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark';

type AppSettingsState = {
  theme: Theme;
  notificationsEnabled: boolean;
  alertSoundEnabled: boolean;

  setTheme: (theme: Theme) => void;
  toggleNotifications: () => void;
  toggleAlertSound: () => void;
};

function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', theme);
  // Tailwind dark variant support
  if (theme === 'dark') document.documentElement.classList.add('dark');
  else document.documentElement.classList.remove('dark');
}

export const useAppSettingsStore = create<AppSettingsState>()(
  persist(
    (set) => ({
      theme: 'light',
      notificationsEnabled: true,
      alertSoundEnabled: true,

      setTheme: (theme) => {
        applyTheme(theme);
        set({ theme });
      },
      toggleNotifications: () => set((state) => ({ notificationsEnabled: !state.notificationsEnabled })),
      toggleAlertSound: () => set((state) => ({ alertSoundEnabled: !state.alertSoundEnabled })),
    }),
    {
      name: 'fg-app-settings',
      version: 1,
      partialize: (state) => ({
        theme: state.theme,
        notificationsEnabled: state.notificationsEnabled,
        alertSoundEnabled: state.alertSoundEnabled,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        applyTheme(state.theme);
      },
    }
  )
);

