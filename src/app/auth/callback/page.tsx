"use client";

import { useEffect } from "react";

export default function AuthCallbackPage() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const storedNextPath = localStorage.getItem("mfl_next_path");

    if (!params.get("next") && storedNextPath) {
      params.set("next", storedNextPath);
    }

    if (storedNextPath) {
      localStorage.removeItem("mfl_next_path");
    }

    const destination = new URL("/auth/callback/complete", window.location.origin);
    params.forEach((value, key) => {
      destination.searchParams.set(key, value);
    });

    window.location.replace(destination.toString());
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#FAF7EE]">
      {/* Loading Spinner */}
      <div className="relative">
        <div className="w-16 h-16 border-4 border-[#31372B1F] border-t-[#31372B] rounded-full animate-spin"></div>
      </div>

      {/* Loading Text */}
      <p className="mt-6 text-[#31372B] text-lg font-medium">
        Redirecting...
      </p>

      {/* Optional subtext */}
      <p className="mt-2 text-[#717182] text-sm">
        Finishing sign in securely...
      </p>

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}
