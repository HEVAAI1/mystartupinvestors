"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, Mail, MapPin, X } from "lucide-react";

interface InvestorProfileDrawerProps {
  investor: {
    id: number;
    name: string;
    about: string;
    city: string;
    country: string;
    preference_sector: string;
    firm_name: string;
    email: string;
    linkedin: string;
    type?: string;
  } | null;
  onClose: () => void;
}

export default function InvestorProfileDrawer({
  investor,
  onClose,
}: InvestorProfileDrawerProps) {
  return (
    <AnimatePresence>
      {investor && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/35 backdrop-blur-[2px]"
          />

          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed inset-y-0 left-0 z-50 flex w-full max-w-xl flex-col bg-[#FAF7EE] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-black/[0.06] bg-white/90 px-5 py-4 backdrop-blur-sm">
              <div>
                <p className="text-xs font-inter font-semibold uppercase tracking-[0.16em] text-[#6B6B6B]">
                  Investor Profile
                </p>
                <h2 className="mt-1 font-space text-xl font-bold text-[#1E1E1E]">
                  {investor.name}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="rounded-full border border-black/[0.08] bg-white p-2 text-[#6B6B6B] transition hover:text-[#1E1E1E]"
                aria-label="Close investor profile"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-6">
              <div className="rounded-3xl border border-black/[0.06] bg-white p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1E1E1E] font-space text-lg font-bold text-white">
                    {investor.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-space text-lg font-bold text-[#1E1E1E]">
                        {investor.name}
                      </h3>
                      {investor.type && (
                        <span className="rounded-full bg-black/[0.05] px-2.5 py-1 text-[10px] font-inter font-semibold text-[#31372B]">
                          {investor.type}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm font-inter text-[#6B6B6B]">
                      {investor.firm_name}
                    </p>
                    <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#C6FF55]/20 px-3 py-1 text-xs font-inter font-medium text-[#31372B]">
                      <MapPin className="h-3.5 w-3.5" />
                      {investor.city ? `${investor.city}, ` : ""}
                      {investor.country}
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-6">
                  <div>
                    <h4 className="mb-2 text-sm font-inter font-semibold text-[#1E1E1E]">
                      About
                    </h4>
                    <p className="text-sm leading-relaxed text-[#4B4B4B]">
                      {investor.about}
                    </p>
                  </div>

                  <div>
                    <h4 className="mb-3 text-sm font-inter font-semibold text-[#1E1E1E]">
                      Preferred Sectors
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {investor.preference_sector.split(",").map((sector) => (
                        <span
                          key={sector}
                          className="rounded-full bg-[#C6FF55]/15 px-3 py-1 text-xs font-inter font-semibold text-[#1E1E1E]"
                        >
                          {sector.trim()}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3 border-t border-black/[0.06] pt-5">
                    <a
                      href={`mailto:${investor.email}`}
                      className="flex items-center justify-between rounded-2xl border border-black/[0.07] bg-[#FAF7EE] px-4 py-3 text-sm font-inter text-[#31372B] transition hover:border-[#C6FF55]/40"
                    >
                      <span className="flex items-center gap-2 min-w-0">
                        <Mail className="h-4 w-4 shrink-0" />
                        <span className="truncate">{investor.email}</span>
                      </span>
                      <span className="text-xs font-semibold">Email</span>
                    </a>

                    <a
                      href={investor.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between rounded-2xl border border-black/[0.07] bg-[#1E1E1E] px-4 py-3 text-sm font-inter text-white transition hover:bg-[#333]"
                    >
                      <span>LinkedIn profile</span>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
