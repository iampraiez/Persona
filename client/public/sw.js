self.addEventListener("push", function (event) {
  const data = event.data.json();

  self.registration.showNotification(data.title, {
    body: data.body,
    icon: "/icon.png",
    badge: "/badge.png",
    image: data.image,
    data: {
      url: data.url,
    },
    actions: [
      { action: "open", title: "Open", icon: "/open-icon.png" },
      { action: "dismiss", title: "Dismiss", icon: "/dismiss-icon.png" },
    ],
  });
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  if (event.action === "open") {
    event.waitUntil(clients.openWindow(event.notification.data.url));
  }
});
