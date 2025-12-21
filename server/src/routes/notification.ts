import express from "express";
import { authenticate } from "../middleware/auth";
import { prisma } from "../index";
import webpush from "web-push";
import "dotenv/config";

const router = express.Router();

const vapidKeys = {
  publicKey: process.env.PUBLIC_KEY,
  privateKey: process.env.PRIVATE_KEY,
};

if (!vapidKeys.publicKey || !vapidKeys.privateKey) {
  throw new Error("VAPID keys are not defined in environment variables");
}

webpush.setVapidDetails(
  "mailto:petolulope7@gmail.com",
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

const front = process.env.CLIENT_URL || "http://localhost:5173";

function formatTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

async function getFormattedNotifications(userId: string) {
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { timestamp: "desc" },
  });
  return notifications.map((noti) => ({
    id: noti.id,
    title: noti.title,
    body: noti.body,
    timeAgo: formatTimeAgo(noti.timestamp.getTime()),
  }));
}

router.get("/public-key", (req, res) => {
  res.json({ publicKey: vapidKeys.publicKey });
});

router.post("/save-subscription", authenticate, async (req, res) => {
  const { subscription } = req.body;
  const parsedSubscription = JSON.parse(subscription);
  const { endpoint, keys } = parsedSubscription;
  const userId = req.user?.id; // From authenticate middleware

  if (!userId) {
    return res.status(401).json({ error: "User not authenticated" });
  }

  try {
    await prisma.pushSubscription.upsert({
      where: { endpoint },
      update: { auth: keys?.auth, p256dh: keys?.p256dh, userId },
      create: {
        endpoint,
        auth: keys.auth,
        p256dh: keys.p256dh,
        userId,
      },
    });

    res.status(201).json({ message: "Subscription saved" });
  } catch (err) {
    console.error("Save subscription error:", err);
    res.status(500).json({ error: "Failed to save subscription" });
  }
});

router.post("/send-notification", authenticate, async (req, res) => {
  const { title, body, type, userId } = req.body;
  console.log("The request happned", title, body, type, userId);

  const rando =
    type === "upcoming"
      ? [
          "Your scheduled event is about to begin. Don't miss it!",
          "Just a reminder — your event starts in a few minutes.",
          "Stay prepared! You're almost there.",
          "Time to wrap up — your next task is approaching.",
          "Your next scheduled activity is around the corner.",
        ]
      : [
          "Your scheduled event is starting now.",
          "It's time to jump in — your event is live!",
          "Go time! You're all set to begin.",
          "This is your moment — get started now!",
          "The countdown's over — your activity begins now",
        ];

  const payload = JSON.stringify({
    title: title || "New Notification",
    body: body || rando[Math.floor(Math.random() * rando.length)],
    icon: `${front}/logo.svg`,
    link: `${front}/auths`,
  });
  console.log("The payload", payload);

  try {
    // Store the notification
    const notification = await prisma.notification.create({
      data: {
        userId,
        title: title || "New Notification",
        body: body || rando[Math.floor(Math.random() * rando.length)],
      },
    });
    console.log("The notification", notification);

    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId },
    });

    await Promise.all(
      subscriptions.map((sub) => {
        const pushConfig = {
          endpoint: sub.endpoint,
          keys: {
            auth: sub.auth,
            p256dh: sub.p256dh,
          },
        };
        return webpush.sendNotification(pushConfig, payload).catch((err) => {
          console.error(`Send error for subscription ${sub.endpoint}:`, err);
        });
      })
    );

    res
      .status(200)
      .json({ message: "Notifications sent", notificationId: notification.id });
  } catch (err) {
    console.error("Notification error:", err);
    res.status(500).json({ error: "Failed to send notifications" });
  }
});

router.get("/", authenticate, async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: "User not authenticated" });
  }
  try {
    const notis = await getFormattedNotifications(userId);
    console.log("All notis", notis);

    res.json(notis);
  } catch (err) {
    console.error("Fetch notifications error:", err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

export default router;
