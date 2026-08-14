"use client";

import { useEffect } from "react";

export function ReferralTracker() {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get('ref') || sessionStorage.getItem('circucity_referral');

    if (ref && urlParams.get('signup') === 'complete') {
      fetch("/api/referral/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ref }),
      }).catch(() => {});
      sessionStorage.removeItem('circucity_referral');
      window.history.replaceState({}, '', '/');
    }
  }, []);

  return null;
}
