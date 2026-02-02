
self.addEventListener("push", function (event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: "/logo.svg",
      badge: "/logo.svg",
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.id || "1",
      },
    };
    event.waitUntil(self.registration.showNotification(data.title || "Persona Alert", options));
  }
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow("http://localhost:5173") // Update with your production URL when deploying
  );
});
