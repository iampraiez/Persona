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

    if (existingSubscription) {
      await api.saveSubscription(existingSubscription);
      return;
    }

    const publicKey = env.data?.VITE_PUBLIC_VAPID_KEY;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });

    await api.saveSubscription(subscription);
  } catch (error) {
    console.error("Error subscribing user:", error);
  }
}
