import { User, Analytics } from "./api.service";
import { Event, Goal, AiSuggestion } from "../types/index";

class DemoService {
  private user: User = {
    email: "demo@example.com",
    name: "Demo User",
    image:
      "https://imgs.search.brave.com/GaeuVTp4HBoPykNJG-XE1uv7gqWRONiS8JMgOr5VYew/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly93YWxs/cGFwZXJjYXZlLmNv/bS93cC93cDExMTg3/MjQxLmpwZw",
    createdAt: new Date(),
    events: [],
    goals: [],
    notifications: [],
    notificationsEnabled: true,
    defaultNotifyBefore: 15,
  };

  private events: Event[] = [
    {
      id: "1",
      title: "Team Standup",
      description: "Daily team sync",
      startTime: new Date(new Date().setHours(10, 0, 0, 0)),
      endTime: new Date(new Date().setHours(10, 30, 0, 0)),
      isCompleted: false,
      skippedIsImportant: false,
      isSpecial: false,
      notifyBefore: 15,
      userId: "demo",
    },
    {
      id: "2",
      title: "Project Work",
      description: "Focus time",
      startTime: new Date(new Date().setHours(14, 0, 0, 0)),
      endTime: new Date(new Date().setHours(16, 0, 0, 0)),
      isCompleted: false,
      skippedIsImportant: false,
      isSpecial: false,
      notifyBefore: 15,
      userId: "demo",
    },
    {
      id: "3",
      title: "Gym Session",
      description: "Leg day",
      startTime: new Date(new Date().setDate(new Date().getDate() + 1)),
      endTime: new Date(new Date().setDate(new Date().getDate() + 1)),
      isCompleted: false,
      skippedIsImportant: false,
      isSpecial: true,
      notifyBefore: 30,
      userId: "demo",
    },
  ];

  private goals: Goal[] = [
    {
      id: "1",
      title: "Learn React",
      description: "Master React concepts",
      totalDays: 30,
      createdAt: new Date(),
      userId: "demo",
      steps: [
        {
          id: "s1",
          title: "Understand Hooks",
          description: "Learn useState and useEffect",
          dueDate: new Date(new Date().setDate(new Date().getDate() + 1)),
          isCompleted: true,
          goalId: "1",
        },
        {
          id: "s2",
          title: "Master Context API",
          description: "Learn how to use Context for state management",
          dueDate: new Date(new Date().setDate(new Date().getDate() + 3)),
          isCompleted: false,
          goalId: "1",
        },
      ],
    },
    {
      id: "2",
      title: "Build a Portfolio",
      description: "Create a stunning portfolio website",
      totalDays: 14,
      createdAt: new Date(),
      userId: "demo",
      steps: [
        {
          id: "s3",
          title: "Design Layout",
          description: "Wireframe the main pages",
          dueDate: new Date(new Date().setDate(new Date().getDate() + 2)),
          isCompleted: false,
          goalId: "2",
        },
      ],
    },
  ];

  private notifications = [
    {
      id: "1",
      title: "Welcome to Demo",
      body: "Explore the features of Timeforge!",
      timestamp: new Date(),
      userId: "demo",
      isRead: false,
    },
    {
      id: "2",
      title: "Goal Progress",
      body: "You've completed 50% of your 'Learn React' goal!",
      timestamp: new Date(new Date().setHours(new Date().getHours() - 2)),
      userId: "demo",
      isRead: true,
    },
  ];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  completed: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  skipped: any;

  async getUser(): Promise<User | null> {
    const goalsWithPercentage = this.goals.map((goal) => {
      const completedSteps = goal.steps.filter((s) => s.isCompleted).length;
      const percentage =
        goal.steps.length > 0 ? completedSteps / goal.steps.length : 0;
      return { ...goal, percentage };
    });

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    const weeklyEvents = this.events.filter((event) => {
      const eventDate = new Date(event.startTime);
      return eventDate >= startOfWeek && eventDate <= endOfToday;
    });

    const totalEventsThisWeek = weeklyEvents.length;
    const completedEventsThisWeek = weeklyEvents.filter(
      (e) => e.isCompleted,
    ).length;
    const specialEventsThisWeek = weeklyEvents.filter(
      (e) => e.isSpecial,
    ).length;
    const aggregateGoalProgress =
      goalsWithPercentage.length > 0
        ? Math.round(
            (goalsWithPercentage.reduce(
              (sum, goal) => sum + goal.percentage,
              0,
            ) /
              goalsWithPercentage.length) *
              100,
          )
        : 0;

    return {
      ...this.user,
      events: this.events,
      goals: goalsWithPercentage,
      notifications: this.notifications,
      weeklySummary: {
        totalEvents: totalEventsThisWeek,
        completedEvents: completedEventsThisWeek,
        specialEvents: specialEventsThisWeek,
        aggregateGoalProgress,
      },
    };
  }

  async logout() {
    return true;
  }

  async handleGoogleLogin() {
    window.location.href = "/login";
  }

  async getEvents(): Promise<Event[]> {
    return this.events;
  }

  async getUpcomingEvents(): Promise<Event[]> {
    const now = new Date();
    return this.events.filter((e) => new Date(e.startTime) > now);
  }

  async createEvent(event: Partial<Event>): Promise<Event> {
    const newEvent = {
      ...event,
      id: Math.random().toString(36).substr(2, 9),
      userId: "demo",
      isCompleted: false,
      skippedIsImportant: false,
      isSpecial: false,
    } as Event;
    this.events.push(newEvent);
    return newEvent;
  }

  async createEventsBatch(events: Partial<Event>[]): Promise<Event[] | null> {
    const newEvents = events.map((event) => ({
      ...event,
      id: Math.random().toString(36).substr(2, 9),
      userId: "demo",
      isCompleted: false,
      skippedIsImportant: false,
      isSpecial: false,
    })) as Event[];
    this.events.push(...newEvents);
    return newEvents;
  }

  async updateEvent(id: string, event: Partial<Event>): Promise<string | void> {
    const index = this.events.findIndex((e) => e.id === id);
    if (index !== -1) {
      this.events[index] = { ...this.events[index], ...event };
      return "Event updated successfully";
    }
    throw new Error("Event not found");
  }

  async deleteEvent(id: string): Promise<string | void> {
    this.events = this.events.filter((e) => e.id !== id);
    return "Event deleted successfully";
  }

  async getGoals(): Promise<Goal[]> {
    return this.goals;
  }

  async createGoal(goal: Partial<Goal>): Promise<Goal> {
    const newGoal = {
      ...goal,
      id: Math.random().toString(36).substr(2, 9),
      userId: "demo",
      createdAt: new Date(),
      steps: goal.steps || [],
    } as Goal;
    this.goals.push(newGoal);
    return newGoal;
  }

  async updateGoal(id: string, goal: Partial<Goal>): Promise<string | void> {
    const index = this.goals.findIndex((g) => g.id === id);
    if (index !== -1) {
      if (goal.steps !== undefined) {
        this.goals[index] = {
          ...this.goals[index],
          ...goal,
          steps: goal.steps,
        };
      } else {
        this.goals[index] = { ...this.goals[index], ...goal };
      }
      return "Goal updated successfully";
    }
    throw new Error("Goal not found");
  }

  async deleteGoal(id: string): Promise<string | void> {
    this.goals = this.goals.filter((g) => g.id !== id);
    return "Goal deleted successfully";
  }

  async getNotifications() {
    return this.notifications;
  }

  async deleteNotification(id: string): Promise<string | void> {
    this.notifications = this.notifications.filter((n) => n.id !== id);
    return "Notification deleted successfully";
  }

  async clearAllNotifications(): Promise<string | void> {
    this.notifications = [];
    return "All notifications deleted successfully";
  }

  async getAnalytics(range: string, date: Date): Promise<Analytics | null> {
    const randomBetween = (min: number, max: number) =>
      Math.floor(Math.random() * (max - min + 1)) + min;

    const totalEventsByRange = {
      day: randomBetween(3, 8),
      week: randomBetween(20, 50),
      month: randomBetween(80, 150),
      year: randomBetween(400, 800),
      all: randomBetween(500, 1200),
    };

    const totalEvents =
      totalEventsByRange[range as keyof typeof totalEventsByRange] || 30;
    const completionRate = randomBetween(65, 95);
    const completedEvents = Math.floor((totalEvents * completionRate) / 100);
    const specialEventsCount = randomBetween(
      1,
      Math.max(2, Math.floor(totalEvents * 0.1)),
    );

    const focusTimeHours =
      range === "day"
        ? randomBetween(2, 8)
        : range === "week"
          ? randomBetween(15, 40)
          : range === "month"
            ? randomBetween(60, 150)
            : randomBetween(200, 600);

    const numReasons = randomBetween(2, Math.min(4, specialEventsCount));

    const specialEventsData = Array.from({ length: numReasons }, (_, i) => ({
      date: `Event ${i + 1}`,
      completed: randomBetween(
        1,
        Math.max(1, Math.floor(specialEventsCount / numReasons)),
      ),
      skipped: randomBetween(0, 2),
      total: (() => {
        return this.completed + this.skipped;
      })(),
    }));

    let activityData: Analytics["activityData"] = [];
    if (range === "day") {
      const hours = [
        "9AM",
        "10AM",
        "11AM",
        "12PM",
        "1PM",
        "2PM",
        "3PM",
        "4PM",
        "5PM",
      ];
      activityData = hours.map((h) => {
        const completed = randomBetween(0, 2);
        const skipped = Math.random() > 0.8 ? 1 : 0;
        return { date: h, completed, skipped, total: completed + skipped };
      });
    } else if (range === "week") {
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      activityData = days.map((day) => {
        const completed = randomBetween(2, 8);
        const skipped = randomBetween(0, 2);
        return { date: day, completed, skipped, total: completed + skipped };
      });
    } else if (range === "month") {
      activityData = Array.from({ length: 4 }, (_, i) => {
        const completed = randomBetween(10, 30);
        const skipped = randomBetween(1, 5);
        return {
          date: `Week ${i + 1}`,
          skipped,
          completed,
          total: completed + skipped,
        };
      });
    } else if (range === "year") {
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      activityData = months.map((month) => {
        const completed = randomBetween(20, 80);
        const skipped = randomBetween(2, 10);
        return { date: month, completed, skipped, total: completed + skipped };
      });
    } else {
      const currentYear = new Date().getFullYear();
      activityData = Array.from({ length: 3 }, (_, i) => {
        const year = currentYear - (2 - i);
        const completed = randomBetween(100, 300);
        const skipped = randomBetween(10, 30);
        return {
          date: `${year}`,
          completed,
          skipped,
          total: completed + skipped,
        };
      });
    }

    const goalNames = [
      "Learn TypeScript",
      "Build Portfolio",
      "Master React",
      "Complete Course",
      "Read 12 Books",
      "Exercise Routine",
    ];
    const numGoals = randomBetween(2, 5);
    const goalProgressData = Array.from({ length: numGoals }, (_, i) => ({
      id: `${i + 1}`,
      name: goalNames[i % goalNames.length],
      progress: randomBetween(20, 90),
    }));

    const averageGoalProgress = Math.floor(
      goalProgressData.reduce((sum, g) => sum + g.progress, 0) /
        goalProgressData.length,
    );

    return {
      totalEvents,
      completedEvents,
      completionRate,
      focusTime: focusTimeHours.toFixed(1),
      specialEventsCount,
      specialEventsData,
      activityData,
      goalProgressData,
      averageGoalProgress,
      range: {
        start: new Date(date),
        end: new Date(date),
      },
    };
  }

  async saveSubscription(subscription: PushSubscription) {
    console.log("Demo: Subscription saved", subscription);
    return true;
  }

  async markNotificationAsRead(id: string): Promise<string | void> {
    const index = this.notifications.findIndex((n) => n.id === id);
    if (index !== -1) {
      this.notifications[index].isRead = true;
      return "Notification marked as read";
    }
    throw new Error("Notification not found");
  }

  async getPublicKey() {
    return "DEMO_PUBLIC_KEY";
  }

  async getSuggestions(): Promise<AiSuggestion[]> {
    return [
      {
        message:
          "Consider blocking 2 hours for deep work in the morning when you're most productive.",
        type: "schedule" as const,
      },
      {
        message:
          "Your goals are progressing well! Try to complete at least one step today.",
        type: "goal" as const,
      },
      {
        message: "Focus on your most important task first thing today.",
        type: "focus" as const,
      },
    ];
  }

  async generateSteps(
    goal: { title: string; description?: string },
    totalDays: number,
    stepCount?: number,
    currentSteps?: { title: string; description?: string }[],
  ) {
    const stepsCount = stepCount || 10;
    const daysPerStep = Math.floor(totalDays / stepsCount);
    const steps = [];

    for (let i = 0; i < stepsCount; i++) {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + (i + 1) * daysPerStep);

      const existingStep = currentSteps?.[i];

      steps.push({
        title: existingStep?.title || `Step ${i + 1}: ${goal.title} milestone`,
        description:
          existingStep?.description || `Complete this step for ${goal.title}`,
        dueDate: dueDate.toISOString().split("T")[0],
      });
    }

    return { steps };
  }

  async updateStepStatus(goalId: string, stepId: string): Promise<void> {
    const goalIndex = this.goals.findIndex((g) => g.id === goalId);
    if (goalIndex !== -1) {
      const stepIndex = this.goals[goalIndex].steps.findIndex(
        (s) => s.id === stepId,
      );
      if (stepIndex !== -1) {
        this.goals[goalIndex].steps[stepIndex].isCompleted = true;
        return;
      }
      throw new Error("Step not found");
    }
    throw new Error("Goal not found");
  }

  async sendNotification(notification: {
    title: string;
    body: string;
    type: string;
    userId: string;
  }) {
    console.log("Demo: Notification sent", notification);
    return { success: true };
  }

  async requestAccountDeletion(): Promise<{
    message: string;
    expiresAt: string;
  }> {
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 5);
    return {
      message: "Verification code sent to email",
      expiresAt: expiry.toISOString(),
    };
  }

  async deleteAccount(code: string): Promise<{ message: string }> {
    if (code.length !== 6) {
      throw new Error("Invalid verification code");
    }
    return { message: "Account deleted successfully" };
  }

  async updateUserProfile(data: {
    name?: string;
    image?: string;
    notificationsEnabled?: boolean;
    defaultNotifyBefore?: number;
  }): Promise<string> {
    if (data.name) {
      this.user.name = data.name;
    }
    if (data.image) {
      this.user.image = data.image;
    }
    return "User updated";
  }
}

export const demoApi = new DemoService();
