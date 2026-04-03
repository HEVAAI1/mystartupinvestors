"use client";

import { useEffect } from "react";

/**
 * ReferralLinker — mounts silently after login.
 * Reads any pending referral code from localStorage and calls the API to link it.
 * Safe to mount on every authenticated page; it no-ops if nothing is pending or already linked.
 */
export default function ReferralLinker() {
  useEffect(() => {
    const code = localStorage.getItem("mfl_ref_code");
    const expiry = localStorage.getItem("mfl_ref_expiry");

    if (!code || !expiry) return;

    // Check expiry
    if (Date.now() > Number(expiry)) {
      localStorage.removeItem("mfl_ref_code");
      localStorage.removeItem("mfl_ref_expiry");
      return;
    }

    // Attempt to link (fire-and-forget, non-blocking)
    fetch("/api/affiliate/link-referral", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ referral_code: code }),
    })
      .then(() => {
        // Clean up regardless of outcome
        localStorage.removeItem("mfl_ref_code");
        localStorage.removeItem("mfl_ref_expiry");
      })
      .catch(() => {
        // Silently ignore errors — will retry next page load
      });
  }, []);

  return null; // renders nothing
}
