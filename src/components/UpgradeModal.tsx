"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  onViewPlans: () => void;
}

export default function UpgradeModal({ open, onClose, onViewPlans }: UpgradeModalProps) {
  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Blurred Background */}
          <motion.div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Centered Modal Wrapper */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className="relative bg-[#FAF7EE] border border-[rgba(49,55,43,0.12)] shadow-lg rounded-lg flex flex-col items-center px-6 pt-8 pb-6"
              style={{ width: "448px", height: "370px" }}
              onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute right-5 top-4 text-[#31372B] opacity-70 hover:opacity-100 cursor-pointer"
              >
                ✕
              </button>

              {/* Icon */}
              {/* Icon - perfectly circular, no pill, subtle flat shadow */}
              {/* Icon - perfectly circular */}
              <div
                className="mb-6"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "48px",
                  height: "48px",
                  backgroundColor: "rgba(49, 55, 43, 0.06)",
                  borderRadius: "50%", // guaranteed circle
                  margin: "0 auto", // center horizontally
                }}
              >
                <Image
                  src="/GetCreditsLogo.svg"
                  alt="Upgrade Icon"
                  width={24}
                  height={24}
                  style={{
                    display: "block",
                    width: "24px",
                    height: "24px",
                    objectFit: "contain",
                  }}
                />
              </div>


              {/* Title */}
              <h2 className="text-[24px] font-bold text-center text-[#31372B] mb-4">
                Upgrade plan for more benefits
              </h2>

              {/* Description */}
              <p className="text-center text-[#717182] text-[16px] leading-[26px] mb-8 max-w-[380px]">
                Get access to investor email IDs, full profiles, and join an exclusive WhatsApp
                group of startup founders and mentors to grow your startup.
              </p>

              {/* Buttons */}
              <div className="flex flex-col gap-3 w-full">
                <button
                  onClick={onViewPlans}
                  className="w-full bg-[#31372B] text-[#FAF7EE] py-2.5 rounded-md font-bold text-[14px] leading-[20px] hover:opacity-90 transition cursor-pointer"
                >
                  View Plans
                </button>
                <button
                  onClick={onClose}
                  className="w-full bg-[#FAF7EE] border border-[rgba(49,55,43,0.12)] py-2.5 rounded-md text-[#31372B] text-[14px] leading-[20px] hover:bg-[#f2f0e8] transition cursor-pointer"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
