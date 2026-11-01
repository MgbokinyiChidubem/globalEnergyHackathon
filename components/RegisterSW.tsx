"use client";

import { useEffect } from "react";

/** Registers the offline service worker in production builds only (dev would cache stale bundles). */
export default function RegisterSW() {
  useEffect(() => {
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);
  return null;
}
