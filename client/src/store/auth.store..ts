import { create } from "zustand";
import axios from "axios";
import { User } from "../types";
import { API_URL } from "../config";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (token: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (token: string) => {
    try {
      set({ isLoading: true, error: null });
      localStorage.setItem("token", token);

      // Set default auth header for future requests
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // Get user data
      const { data } = await axios.get(`${API_URL}/api/users/me`);

      set({
        user: data,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: `Authentication failed: ${error}`,
        isLoading: false,
        isAuthenticated: false,
      });
      localStorage.removeItem("token");
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    set({
      user: null,
      isAuthenticated: false,
    });
  },

  checkAuth: async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      set({ isAuthenticated: false });
      return;
    }

    try {
      set({ isLoading: true });
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      const { data } = await axios.get(`${API_URL}/api/users/me`);

      set({
        user: data,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
      localStorage.removeItem("token");
      console.log(error);
    }
  },
}));
