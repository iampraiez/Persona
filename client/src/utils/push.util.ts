import { api } from "../service/api.service";
import { useAuthStore } from "../store/auth.store";
import { env } from "../config/env";
import { urlBase64ToUint8Array } from "./notification.utils";

export async function subscribeUser() {
  if (useAuthStore.getState().isDemo) return;
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    console.warn("Push notifications are not supported in this browser");
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.js");

    await navigator.serviceWorker.ready;

    const existingSubscription =
      await registration.pushManager.getSubscription();

    const publicKey = env.data?.VITE_PUBLIC_VAPID_KEY;
    if (!publicKey) {
      console.error("VAPID public key is missing");
      return;
    }

    if (existingSubscription) {
      try {
        // Try to save existing one first
        await api.saveSubscription(existingSubscription);
        return;
      } catch (err) {
        // If saving fails (maybe VAPID mismatch), unsubscribe and re-subscribe
        console.warn("Existing subscription invalid or mismatch, re-subscribing...");
        await existingSubscription.unsubscribe();
      }
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });

    await api.saveSubscription(subscription);
  } catch (error) {
    console.error("Error subscribing user to push notifications:", error);
  }
}
