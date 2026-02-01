import { api } from "../service/api.service";
import { useAuthStore } from "../store/auth.store";
import { env } from "../config/env";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const raw = atob(base64);
  return new Uint8Array([...raw].map((char) => char.charCodeAt(0)));
}

export async function subscribeUser() {
  if (useAuthStore.getState().isDemo) return;
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    console.warn("Push notifications are not supported in this browser");
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.js");
    const existingSubscription = await registration.pushManager.getSubscription();
    
    if (existingSubscription) {
      await api.saveSubscription(existingSubscription);
      return;
    }

    const vapidKey = env.data?.VITE_PUBLIC_VAPID_KEY;
    if (vapidKey) {
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey),
        });
        await api.saveSubscription(subscription);
        return;
    }

    const publicKey = await api.getPublicKey();

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey.publicKey),
    });

    await api.saveSubscription(subscription);
  } catch (error) {
    console.error("Error subscribing user:", error);
  }
}
