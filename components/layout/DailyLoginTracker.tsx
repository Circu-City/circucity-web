"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";

export function DailyLoginTracker() {
  const { isSignedIn, isLoaded } = useAuth();

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    const today = localStorage.getItem('login_bonus_date');
    const now = new Date().toISOString().substring(0, 10);
    if (today !== now) {
      fetch("/api/earn-tokens", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login" }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success || data.bonusAwarded) {
            localStorage.setItem('login_bonus_date', now);
          }
        })
        .catch(() => {});
    }
  }, [isLoaded, isSignedIn]);

  return null;
}
