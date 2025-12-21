import axios from "axios";
import { API_URL } from "../config";

interface Task {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  isCompleted: boolean;
  skippedReason: string | null;
  skippedIsImportant: boolean;
  isSpecial: boolean;
  userId: string;
}

const sendTaskNotifications = async (tasks: Task[]): Promise<void> => {
  const sentNotifications = JSON.parse(
    localStorage.getItem("sentNotifications") || "[]"
  ) as string[];

  const now = new Date();
  const TEN_MINUTES_MS = 10 * 60 * 1000;
  const ONE_MINUTE_MS = 60 * 1000;

  // Filter tasks for today to optimize
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const tasksToday = tasks.filter((task) => {
    const startTime = new Date(task.startTime);
    return startTime >= today && startTime < tomorrow;
  });
  console.log("Sent notifcation", sentNotifications);

  for (const task of tasksToday) {
    console.log("Looping through tasks", task);
    const startTime = new Date(task.startTime);
    const timeDiff = startTime.getTime() - now.getTime();
    console.log("time diff err", timeDiff, startTime, now);

    if (sentNotifications.includes(task.id)) {
      console.log("Task already sent");

      continue;
    }
    console.log("Getting here", timeDiff, TEN_MINUTES_MS, ONE_MINUTE_MS);

    let notificationType: "upcoming" | "now" | null = null;
    if (
      timeDiff <= TEN_MINUTES_MS &&
      timeDiff > TEN_MINUTES_MS - ONE_MINUTE_MS
    ) {
      notificationType = "upcoming";
    } else if (timeDiff <= 0 && timeDiff > -ONE_MINUTE_MS) {
      notificationType = "now";
    } 

    console.log("Notification type", notificationType);

    if (notificationType) {
      try {
        const response = await axios.post(
          `${API_URL}/api/notis/send-notification`,
          {
            title: task.title,
            body: task?.description,
            type: notificationType,
            userId: task.userId,
          }
        );
        console.log(`Notification sent for task ${task.id}:`, response.data);

        sentNotifications.push(task.id);
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
