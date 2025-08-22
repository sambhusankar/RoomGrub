"use client";  // forces client-side execution

import { useEffect } from "react";

export default function NotificationSubscriber({ userId, roomId }) {
  useEffect(() => {
    async function subscribe() {
      try {
        if (typeof window === "undefined" || !("Notification" in window)) {
          console.log("Notifications not supported in this environment");
          return;
        }

        // Ask permission
        console.log("Requesting notification permission...");
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          console.log("Notifications denied by user");
          return;
        }
        console.log("✅ Notification permission granted!");

        // Check if service worker is supported
        if (!('serviceWorker' in navigator)) {
          console.error("Service Worker not supported");
          return;
        }

        // Wait for the existing PWA service worker to be ready
        console.log("Waiting for existing service worker to be ready...");
        let registration;
        try {
          registration = await navigator.serviceWorker.ready;
          console.log("✅ Service Worker ready:", registration);
        } catch (error) {
          console.error("❌ Service worker not available:", error);
          return;
        }
        
        // Check VAPID key
        const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!vapidKey) {
          console.error("❌ VAPID public key is missing from environment variables");
          return;
        }
        console.log("✅ VAPID key found");
        
        // Subscribe to push
        console.log("Attempting to subscribe to push notifications...");
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: vapidKey
        });
        console.log("✅ Push subscription created:", subscription);
        
        // Send subscription to backend
        console.log("Sending subscription to backend with userId:", userId, "roomId:", roomId);
        const response = await fetch("/api/subscriptions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, roomId, subscription })
        });

        console.log("Response status:", response.status, response.statusText);

        if (!response.ok) {
          const errorData = await response.json();
          console.error("❌ Failed to save subscription:", errorData);
          return;
        }

        const result = await response.json();
        console.log("✅ Subscription saved successfully:", result);
        console.log("🎉 User is now subscribed to notifications!");
      } catch (error) {
        console.error("❌ Error during notification setup:", error);
      }
    }

    if (userId && roomId) {
      subscribe();
    } else {
      console.log("⚠️ Missing userId or roomId, skipping notification setup");
    }
  }, [userId, roomId]);

  return null; // nothing to render
}
