import { api } from "../service/api.service";
import { demoApi } from "../service/demo.service";
import { useAuthStore } from "../store/auth.store";

import { Event as Task } from "../types/index";

const sendTaskNotifications = async (tasks: Task[]): Promise<void> => {
  const sentNotifications = JSON.parse(
    localStorage.getItem("sentNotifications") || "[]"
  ) as string[];

  const now = new Date();

  // Filter tasks for today to optimize
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const tasksToday = tasks.filter((task) => {
    const startTime = new Date(task.startTime);
    return startTime >= today && startTime < tomorrow;
  });

  for (const task of tasksToday) {
    const startTime = new Date(task.startTime);
    const timeDiff = startTime.getTime() - now.getTime();
    
    // Use task's notifyBefore or default to 15
    const notifyBeforeMins = (task as any).notifyBefore || 15;
    const NOTIFY_BEFORE_MS = notifyBeforeMins * 60 * 1000;
    const ONE_MINUTE_MS = 60 * 1000;

    let notificationType: "upcoming" | "now" | null = null;
    
    // Check for "upcoming" notification
    if (timeDiff <= NOTIFY_BEFORE_MS && timeDiff > NOTIFY_BEFORE_MS - ONE_MINUTE_MS) {
      notificationType = "upcoming";
    } 
    // Check for "now" notification
    else if (timeDiff <= 0 && timeDiff > -ONE_MINUTE_MS) {
      notificationType = "now";
    } 

    if (notificationType) {
      // Unique key for this specific notification type for this task
      const notifKey = `${task.id}_${notificationType}`;
      
      if (sentNotifications.includes(notifKey)) {
        continue;
      }

      try {
        const getApi = () => useAuthStore.getState().isDemo ? demoApi : api;
        
        const title = notificationType === "upcoming" 
          ? `Upcoming: ${task.title}` 
          : `Starting Now: ${task.title}`;
        
        const body = notificationType === "upcoming"
          ? `Starts in ${notifyBeforeMins} minutes`
          : task.description || "Your event is starting now";

        await getApi().sendNotification({
          title,
          body,
          type: notificationType,
          userId: task.userId,
        });

        sentNotifications.push(notifKey);
        localStorage.setItem(
          "sentNotifications",
          JSON.stringify(sentNotifications)
        );
      } catch (error) {
        console.error(`Error sending notification for task ${task.id}:`, error);
      }
    }
  }
};

const runDailyNotifications = async (
  tasks: Task[],
  intervalMs: number = 60000
): Promise<NodeJS.Timeout> => {
  await sendTaskNotifications(tasks);
  console.log("The tasks", tasks);
  const interval = setInterval(() => {
    sendTaskNotifications(tasks);
  }, intervalMs);
  return interval;
};

export default runDailyNotifications;
