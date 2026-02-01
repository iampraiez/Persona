
import { useEffect } from "react";
import { useNotifications } from "../hooks/useNotifications";
import { urlBase64ToUint8Array } from "../utils/notification.utils";
import { toast } from "react-toastify";
import { env } from '../config/env'

const PUBLIC_VAPID_KEY = env.data.VITE_PUBLIC_VAPID_KEY;

const NotificationManager = () => {
    const { saveSubscription } = useNotifications();

    useEffect(() => {
        if ("serviceWorker" in navigator && "PushManager" in window) {
            registerServiceWorker();
        }
    }, []);

    const registerServiceWorker = async () => {
        try {
            const registration = await navigator.serviceWorker.register("/sw.js", {
                scope: "/",
            });
            console.log("Service Worker registered with scope:", registration.scope);

            await askPermission(registration);
        } catch (error) {
            console.error("Service Worker registration failed:", error);
        }
    };

    const askPermission = async (registration: ServiceWorkerRegistration) => {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
            console.log("Notification permission granted.");
            await subscribeUserToPush(registration);
        } else {
            console.log("Notification permission denied.");
        }
    };

    const subscribeUserToPush = async (registration: ServiceWorkerRegistration) => {
        try {
            // Check if already subscribed
            const existingSubscription = await registration.pushManager.getSubscription();
            if (existingSubscription) {
                console.log("User is already subscribed:", existingSubscription);
                 // Optionally update subscription on backend just in case
                 await saveSubscription(existingSubscription);
                return;
            }

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY), 
            });

            console.log("User subscribed:", subscription);
            await saveSubscription(subscription);
            toast.success("Notifications enabled!");
        } catch (error) {
            console.error("Failed to subscribe the user: ", error);
        }
    };

    return null; // This component doesn't render anything visible
};

export default NotificationManager;
