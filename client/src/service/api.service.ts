import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { toast } from "react-toastify";
import { env } from "../config/env";
import { Event, Goal, AiSuggestion } from "../types/index";

export interface User {
  goals: (Goal & { percentage: number })[] | [];
  email: string;
  name: string | null;
  image: string | null;
  createdAt: Date;
  events: Event[] | [];
  notifications: Notification[] | [];
  weeklySummary?: WeeklySummary | null;
  aiCredits?: number | 0;
  cachedInsights?: AiSuggestion[] | null;
  notificationsEnabled: boolean | true;
  defaultNotifyBefore: number | 5;
}

export interface Notification {
  id: string;
  title: string;
  userId: string;
  body: string;
  isRead: boolean;
  timestamp: Date;
}

export interface Analytics {
  totalEvents: number;
  completedEvents: number;
  completionRate: number;
  focusTime: number | string;
  specialEventsCount: number;
  activityData: {
    date: string;
    completed: number;
    skipped: number;
    total: number;
  }[];
  specialEventsData: {
    date: string;
    completed: number;
    skipped: number;
    total: number;
  }[];
  goalProgressData: { id: string; name: string; progress: number }[];
  averageGoalProgress: number;
  range: { start: Date; end: Date };
}

interface WeeklySummary {
  totalEvents: number;
  completedEvents: number;
  specialEvents: number;
  aggregateGoalProgress: number;
}

interface Steps {
  title: string;
  description: string;
  dueDate: string;
}

interface ApiResponse<T = unknown> {
  data: T;
  error: string | null;
}

const ERROR_MESSAGES = {
  NETWORK: "Network error. Please check your connection.",
  SERVER: "Server error. Please try again later.",
  UNEXPECTED: "An unexpected error occurred",
  DAILY_LIMIT: "Daily AI limit reached (3/3)",
} as const;

const PATHS = {
  LOGIN: "/login",
  HOME: "/",
};

const STATUS_CODES = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  SERVER_ERROR: 500,
} as const;

export class ApiService {
  private static instance: ApiService;
  private axiosInstance: AxiosInstance;
  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  private constructor() {
    this.axiosInstance = axios.create({
      baseURL: env.data?.VITE_API_URL,
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 30000,
    });

    this.setupInterceptors();
  }

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  private setupInterceptors(): void {
    this.axiosInstance.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error: AxiosError) => {
        if (!error.response) {
          toast.error(ERROR_MESSAGES.NETWORK);
          return Promise.reject(error);
        }
        const { status, data } = error.response;
        const originalRequest = error.config;
        const errorMessage = this.extractErrorMessage(data);

        if (originalRequest?.url?.includes("/auth/refresh")) {
          return Promise.reject(error);
        }

        if (status === STATUS_CODES.UNAUTHORIZED && originalRequest) {
          return this.handleUnauthorizedError(originalRequest);
        }

        if (status === STATUS_CODES.FORBIDDEN) {
          if (errorMessage !== ERROR_MESSAGES.DAILY_LIMIT) {
            toast.error(errorMessage);
          }
          return Promise.reject(error);
        }

        if (status >= STATUS_CODES.SERVER_ERROR) {
          toast.error(ERROR_MESSAGES.SERVER);
        }

        return Promise.reject(error);
      },
    );
  }

  private extractErrorMessage(data: unknown): string {
    if (typeof data === "string") return data;
    if (typeof data === "object" && data !== null) {
      if ("error" in data && typeof data.error === "string") return data.error;
      if ("message" in data && typeof data.message === "string") return data.message;
    }
    return ERROR_MESSAGES.UNEXPECTED;
  }

  private async handleUnauthorizedError(
    originalRequest: InternalAxiosRequestConfig,
  ): Promise<AxiosResponse | void> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;

      try {
        await this.axiosInstance.get("/auth/refresh");
        this.isRefreshing = false;
        return this.axiosInstance(originalRequest);
      } catch (refreshError: any) {
        this.isRefreshing = false;

        // Only clear state and redirect if the refresh call itself returned 401
        if (refreshError?.response?.status === STATUS_CODES.UNAUTHORIZED) {
          localStorage.clear();
          sessionStorage.clear();
          
          try {
            await this.logout();
          } catch {
            // Ignore
          }

          if (window.location.pathname !== PATHS.LOGIN && window.location.pathname !== PATHS.HOME) {
            window.location.href = PATHS.LOGIN;
          }
        }
        
        return Promise.reject(refreshError);
      }
    }

    return new Promise((resolve) => {
      this.refreshSubscribers.push((token: string) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        resolve(this.axiosInstance(originalRequest));
      });
    });
  }

  private async request<T>(
    method: "get" | "post" | "put" | "delete",
    url: string,
    data?: unknown,
    config?: Record<string, unknown>,
  ): Promise<T> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.axiosInstance({
        method,
        url,
        data,
        ...config,
      });
      return response.data.data;
    } catch (error) {
      console.error(`API Error [${method.toUpperCase()} ${url}]`);
      throw error;
    }
  }

  async getUser(): Promise<User | null> {
    return this.request<User | null>("get", "/users");
  }

  async logout(): Promise<boolean | null> {
    return this.request<boolean | null>("get", "/auth/logout");
  }

  async handleGoogleLogin(returnTo?: string): Promise<void> {
    const response = await this.axiosInstance.get("/auth/google", {
      params: { returnTo },
    });
    window.location.href = response.data.data;
  }

  async getEvents(): Promise<Event[] | null> {
    return this.request<Event[] | null>("get", "/events");
  }

  async getUpcomingEvents(): Promise<Event[] | null> {
    return this.request<Event[] | null>("get", "/events/upcoming");
  }

  async createEvent(event: Partial<Event>): Promise<Event | null> {
    return this.request<Event | null>("post", "/events", event);
  }

  async createEventsBatch(events: Partial<Event>[]): Promise<Event[] | null> {
    return this.request<Event[] | null>("post", "/events/batch", { events });
  }

  async updateEvent(id: string, event: Partial<Event>): Promise<void> {
    await this.request("put", `/events/${id}`, event);
  }

  async deleteEvent(id: string): Promise<void> {
    await this.request("delete", `/events/${id}`);
  }

  async getGoals(): Promise<Goal[]> {
    return this.request<Goal[]>("get", "/goals");
  }

  async createGoal(goal: Partial<Goal>): Promise<Goal> {
    return this.request<Goal>("post", "/goals", goal);
  }

  async updateGoal(id: string, goal: Partial<Goal>): Promise<void> {
    await this.request("put", `/goals/${id}`, goal);
  }

  async deleteGoal(id: string): Promise<void> {
    await this.request("delete", `/goals/${id}`);
  }

  async getNotifications(): Promise<Notification[]> {
    return this.request<Notification[]>("get", "/notification");
  }

  async deleteNotification(id: string): Promise<void> {
    await this.request("delete", `/notification/${id}`);
  }

  async clearAllNotifications(): Promise<void> {
    await this.request("delete", "/notification");
  }

  async markNotificationAsRead(id: string): Promise<void> {
    await this.request("put", `/notification/${id}/read`);
  }

  async getAnalytics(range: string, date: Date): Promise<Analytics | null> {
    return this.request("get", "/analytics", undefined, {
      params: { range, date: date.toISOString() },
    });
  }

  async saveSubscription(subscription: PushSubscription): Promise<unknown> {
    return this.request("post", "/notification/save-subscription", {
      subscription: JSON.stringify(subscription),
    });
  }

  async getSuggestions(): Promise<AiSuggestion[]> {
    return this.request<AiSuggestion[]>("get", "/ai/suggestions");
  }

  async generateSteps(
    goal: { title: string; description?: string },
    totalDays: number,
    stepCount?: number,
    currentSteps?: { title: string; description?: string }[],
  ): Promise<{ steps: Steps[] }> {
    return this.request<{ steps: Steps[] }>("post", "/ai/generate-steps", {
      goal,
      totalDays,
      stepCount,
      currentSteps,
    });
  }

  async updateStepStatus(goalId: string, stepId: string): Promise<void> {
    await this.request("put", `/goals/${goalId}/steps/${stepId}`);
  }

  async generateTimetable(
    description: string,
    range: { start: string; end: string },
  ): Promise<Event[]> {
    return this.request<Event[]>("post", "/ai/generate-timetable", {
      description,
      range,
    });
  }

  async copyEvents(
    sourceStart: string,
    sourceEnd: string,
    targetStart: string,
  ): Promise<Event[]> {
    return this.request<Event[]>("post", "/events/copy", {
      sourceStart,
      sourceEnd,
      targetStart,
    });
  }

  async deleteEventsRange(start: string, end: string): Promise<void> {
    await this.request("delete", `/events`, undefined, {
      params: { start, end },
    });
  }

  async sendNotification(notification: {
    title: string;
    body: string;
    type: string;
    userId: string;
  }): Promise<unknown> {
    return this.request("post", "/notification/send", notification);
  }

  async requestAccountDeletion(): Promise<{
    message: string;
    expiresAt: string;
  }> {
    return this.request("post", "/users/request-delete");
  }

  async deleteAccount(code: string): Promise<{ message: string }> {
    return this.request<{ message: string }>("post", "/users/delete-account", {
      code,
    });
  }

  async updateUserProfile(data: {
    name?: string;
    image?: string;
    notificationsEnabled?: boolean;
    defaultNotifyBefore?: number;
  }): Promise<string> {
    return this.request<string>("put", "/users", data);
  }
}

export const api = ApiService.getInstance();
