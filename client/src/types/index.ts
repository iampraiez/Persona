export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  aiCredits: number;
  purchasedAiCredits: number;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  startTime: Date | string;
  endTime: Date | string;
  isCompleted: boolean;
  skippedReason?: string;
  skippedIsImportant: boolean;
  isSpecial: boolean;
  notifyBefore: number;
  focusDuration?: number;
  userId: string;
}

export interface Goal {
  id: string;
  title: string;
  description?: string | undefined;
  totalDays: number | undefined;
  createdAt: Date | string;
  userId: string;
  steps: Step[];
}

export interface Step {
  id: string;
  title: string;
  description?: string;
  dueDate: Date | string;
  isCompleted: boolean;
  goalId?: string;
}

export interface WeeklySchedule {
  [dayOfWeek: string]: Event[];
}

export interface AnalyticsData {
  completedEvents: number;
  skippedEvents: number;
  specialEvents: number;
  goalCompletion: number;
  weeklyProgress: {
    day: string;
    completed: number;
    skipped: number;
  }[];
  goalsProgress: {
    name: string;
    progress: number;
  }[];
}

export interface AiSuggestion {
  message: string;
  type: "schedule" | "goal" | "focus";
}

export interface PaymentPlan {
  id: string;
  name: string;
  credits: number;
  price: number;
  description: string;
}
