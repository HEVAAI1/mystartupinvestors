"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, X, Zap } from "lucide-react";

const DISMISS_KEY = "mfl_upgrade_banner_dismissed";

interface UpgradeBannerProps {
  visible: boolean;
}

export default function UpgradeBanner({ visible }: UpgradeBannerProps) {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(localStorage.getItem(DISMISS_KEY) === "1");
  }, []);

  const show = visible && !dismissed;

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-5 overflow-hidden"
        >
          <div className="relative flex items-center justify-between gap-4 overflow-hidden rounded-2xl bg-[#1E1E1E] px-5 py-4">
            <div className="pointer-events-none absolute top-0 left-0 h-32 w-64 bg-[#C6FF55]/10 blur-[60px]" />
            <div className="relative flex min-w-0 flex-1 items-center gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-[#C6FF55]/20 bg-[#C6FF55]/15">
                <Zap className="h-4 w-4 text-[#C6FF55]" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-inter font-semibold text-white">
                  Unlock your first investor — just $19
                </p>
                <p className="mt-0.5 truncate text-xs font-inter text-white/45">
                  Get 60 credits and access verified emails, direct contacts and full profiles
                </p>
              </div>
            </div>
            <div className="relative flex flex-shrink-0 items-center gap-2">
              <Link
                href="/pricing"
                className="flex items-center gap-1.5 rounded-xl bg-[#C6FF55] px-4 py-2 text-xs font-inter font-bold text-[#1E1E1E] transition-colors hover:bg-[#d4ff77]"
              >
                Upgrade Now <ChevronRight className="h-3.5 w-3.5" />
              </Link>
              <button
                type="button"
                onClick={handleDismiss}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.08] transition-colors hover:bg-white/15"
                aria-label="Dismiss upgrade banner"
              >
                <X className="h-3.5 w-3.5 text-white/50" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
