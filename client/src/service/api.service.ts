import axios, { AxiosError } from "axios";
import { toast } from "react-toastify";
import { env } from "../config/env";
import { Event, Goal, AiSuggestion } from "../types/index";

export interface User {
  goals: (Goal & { percentage: number })[];
  email: string;
  name: string | null;
  image: string | null;
  createdAt: Date;
  events: Event[];
  notifications: {
    id: string;
    title: string;
    userId: string;
    body: string;
    isRead: boolean;
    timestamp: Date;
  }[];
  weeklySummary: {
    totalEvents: number;
    completedEvents: number;
    specialEvents: number;
    aggregateGoalProgress: number;
  };
  aiCredits: number;
  cachedInsights: AiSuggestion[] | null;
  notificationsEnabled: boolean;
  defaultNotifyBefore: number;
}

interface Steps {
  title: string;
  description: string;
  dueDate: string;
}

class ApiService {
  private static axios = axios.create({
    baseURL: env.data?.VITE_API_URL,
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  });

  constructor() {
    ApiService.axios.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config;

        // Handle Network Errors
        if (!error.response) {
          toast.error("Network error. Please check your connection.");
          return Promise.reject(error);
        }

        const { status, data } = error.response;
        const errorMessage =
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (data as any)?.error || "An unexpected error occurred";

        if (originalRequest?.url === "/auth/refresh") {
          return Promise.reject(error);
        }

        if (
          status === 401 &&
          originalRequest &&
          !originalRequest.headers?.["_retry"]
        ) {
          originalRequest.headers["_retry"] = true;
          try {
            await ApiService.axios.get("/auth/refresh");
            return ApiService.axios(originalRequest);
          } catch (refreshError) {
            if (
              window.location.pathname !== "/login" &&
              window.location.pathname !== "/"
            ) {
              window.location.href = "/login";
            }
            return Promise.reject(refreshError);
          }
        }

        if (status === 403) {
          if (errorMessage !== "Daily AI limit reached (3/3)") {
            toast.error(errorMessage);
          }
        } else if (status >= 500) {
          toast.error("Server error. Please try again later.");
        }

        return Promise.reject(error);
      }
    );
  }

  async getUser(): Promise<User | null> {
    try {
      const response: { data: { data: User | null; error: null | string } } =
        await ApiService.axios.get("/users");
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }

  async logout() {
    try {
      const response: { data: { data: null | boolean; error: null | string } } =
        await ApiService.axios.get("/auth/logout");
      return response.data.data;
    } catch (error) {
      console.error("Error logging out:", error);
      throw error;
    }
  }

  async handleGoogleLogin() {
    try {
      const response = await ApiService.axios.get("/auth/google");
      window.location.href = response.data.data;
    } catch (error) {
      console.error("Google Auth error:", error);
      throw error;
    }
  }

  async getEvents(): Promise<Event[] | null> {
    try {
      const response = await ApiService.axios.get("/events");
      return response.data.data;
    } catch (error) {
      console.error("Error fetching events:", error);
      throw error;
    }
  }

  async getUpcomingEvents(): Promise<Event[] | null> {
    try {
      const response = await ApiService.axios.get("/events/upcoming");
      return response.data.data;
    } catch (error) {
      console.error("Error fetching upcoming events:", error);
      throw error;
    }
  }

  async createEvent(event: Partial<Event>): Promise<Event | null> {
    try {
      const response = await ApiService.axios.post("/events", event);
      return response.data.data;
    } catch (error) {
      console.error("Error creating event:", error);
      throw error;
    }
  }

  async createEventsBatch(events: Partial<Event>[]): Promise<Event[] | null> {
    try {
      const response = await ApiService.axios.post("/events/batch", { events });
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }

  async updateEvent(id: string, event: Partial<Event>): Promise<string> {
    try {
      await ApiService.axios.put(`/events/${id}`, event);
      return "Event updated successfully";
    } catch (error) {
      throw error;
    }
  }

  async deleteEvent(id: string): Promise<string> {
    try {
      await ApiService.axios.delete(`/events/${id}`);
      return "Event deleted successfully";
    } catch (error) {
      throw error;
    }
  }

  async getGoals() {
    try {
      const response = await ApiService.axios.get("/goals");
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }

  async createGoal(goal: Partial<Goal>) {
    try {
      const response = await ApiService.axios.post("/goals", goal);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }

  async updateGoal(id: string, goal: Partial<Goal>): Promise<string> {
    try {
      await ApiService.axios.put(`/goals/${id}`, goal);
      return "Goal updated successfully";
    } catch (error) {
      throw error;
    }
  }

  async deleteGoal(id: string): Promise<string> {
    try {
      await ApiService.axios.delete(`/goals/${id}`);
      return "Goal deleted successfully";
    } catch (error) {
      throw error;
    }
  }

  async getNotifications() {
    try {
      const response = await ApiService.axios.get("/notification");
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }

  async deleteNotification(id: string): Promise<string> {
    try {
      await ApiService.axios.delete(`/notification/${id}`);
      return "Notification deleted successfully";
    } catch (error) {
      throw error;
    }
  }

  async clearAllNotifications(): Promise<string> {
    try {
      await ApiService.axios.delete("/notification");
      return "All notifications deleted successfully";
    } catch (error) {
      console.error("Error clearing all notifications:", error);
      throw error;
    }
  }

  async getAnalytics(range: string, date: Date) {
    try {
      const response = await ApiService.axios.get("/analytics", {
        params: { range, date: date.toISOString() },
      });
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }

  async saveSubscription(subscription: PushSubscription) {
    try {
      const response = await ApiService.axios.post(
        "/notification/save-subscription",
        {
          subscription: JSON.stringify(subscription),
        }
      );
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }

  async markNotificationAsRead(id: string): Promise<string> {
    try {
      await ApiService.axios.put(`/notification/${id}/read`);
      return "Notification marked as read";
    } catch (error) {
      throw error;
    }
  }

  async getPublicKey() {
    try {
      const response = await ApiService.axios.get("/notification/public-key");
      return response.data.data.publicKey;
    } catch (error) {
      throw error;
    }
  }

  async getSuggestions() {
    try {
      const response = await ApiService.axios.get("/ai/suggestions");
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }

  async generateSteps(
    goal: { title: string; description?: string },
    totalDays: number,
    stepCount?: number,
    currentSteps?: { title: string; description?: string }[]
  ): Promise<{ steps: Steps[] }> {
    try {
      const response = await ApiService.axios.post("/ai/generate-steps", {
        goal,
        totalDays,
        stepCount,
        currentSteps,
      });
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }

  async updateStepStatus(goalId: string, stepId: string) {
    try {
      await ApiService.axios.put(`/goals/${goalId}/steps/${stepId}`);
    } catch (error) {
      throw error;
    }
  }

  async sendNotification(notification: {
    title: string;
    body: string;
    type: string;
    userId: string;
  }) {
    try {
      const response = await ApiService.axios.post(
        "/notification/send",
        notification
      );
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }

  async requestAccountDeletion(): Promise<{ message: string; expiresAt: string }> {
    try {
      const response = await ApiService.axios.post("/users/request-delete");
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }

  async deleteAccount(code: string): Promise<{ message: string }> {
    try {
      const response = await ApiService.axios.post("/users/delete-account", { code });
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }

  async updateUserProfile(data: { 
    name?: string; 
    image?: string;
    notificationsEnabled?: boolean;
    defaultNotifyBefore?: number;
  }): Promise<string> {
    try {
      const response = await ApiService.axios.put("/users", data);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }
}

export const api = new ApiService();
