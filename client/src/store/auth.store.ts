import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User, api } from "../service/api.service";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isDemo: boolean;
  setUser: (user: User | null) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
  loginDemo: () => void;
  logout: () => void;
  isLoggingOut: boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isDemo: false,
      isLoggingOut: false,

      setUser: (user) => set({ user }),
      setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),

      loginDemo: () => {
        set({
          isAuthenticated: true,
          isDemo: true,
          user: {
            email: "demo@example.com",
            name: "Demo User",
            image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Demo",
            createdAt: new Date(),
            events: [],
            goals: [],
            notifications: [],
            notificationsEnabled: true,
            defaultNotifyBefore: 5,
          },
        });
      },

      logout: async () => {
        set({ isLoggingOut: true });
        try {
          const { isDemo } = useAuthStore.getState();
          if (!isDemo) {
            await api.logout();
          }
        } catch {
          console.error("Logout error");
        } finally {
          set({ user: null, isAuthenticated: false, isDemo: false, isLoggingOut: false });
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
        }
      },
    }),
    {
      name: "auth-storage",
    }
  )
);
