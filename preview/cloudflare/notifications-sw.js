self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
self.addEventListener('push', event => event.waitUntil((async () => {
  let data = {};
  try {data = event.data?.json() || {};} catch {}
  if (Number.isSafeInteger(data.attention_count) && data.attention_count >= 0) {
    try { if (data.attention_count) await self.navigator.setAppBadge?.(data.attention_count);
          else await self.navigator.clearAppBadge?.(); } catch {}
  }
  await self.registration.showNotification('Rodents Exterm notification test', {
    body:'Open Settings to confirm receipt.', tag:'rodents-device-test', icon:'/web-app-manifest-192x192.png',
  });
})()));
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(self.clients.openWindow('/admin/settings/'));
});
