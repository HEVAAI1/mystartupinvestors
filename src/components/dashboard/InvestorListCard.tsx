"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { ExternalLink, MapPin, Zap } from "lucide-react";
import type { Investor } from "@/types/investor";

interface InvestorListCardProps {
  investor: Investor;
  isLoading: boolean;
  onViewProfile: (investor: Investor) => void;
}

function InvestorListCard({
  investor,
  isLoading,
  onViewProfile,
}: InvestorListCardProps) {
  const isViewed = !investor.locked;
  const sectors = investor.preference_sector.split(",");

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 16 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.35, ease: "easeOut" },
        },
      }}
      className={`group relative bg-white/70 backdrop-blur-sm border rounded-2xl p-5 transition-all duration-300 [contain:layout_style_paint] ${
        isViewed
          ? "border-black/[0.06] hover:border-[#C6FF55]/40 hover:shadow-lg hover:shadow-[#C6FF55]/5"
          : "border-black/[0.04] hover:border-black/10"
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 font-space font-bold text-sm ${
            isViewed ? "bg-[#1E1E1E] text-white" : "bg-black/[0.06] text-[#6B6B6B]"
          }`}
        >
          {investor.name.charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3
              className={`font-space font-bold text-base ${
                isViewed ? "text-[#1E1E1E]" : "text-[#6B6B6B]"
              }`}
            >
              {investor.name}
            </h3>
            {investor.type && (
              <span className="text-[10px] font-inter font-semibold bg-black/[0.05] border border-black/[0.06] text-[#31372B] px-2 py-0.5 rounded-full">
                {investor.type}
              </span>
            )}
          </div>
          <p
            className={`text-xs font-inter mt-0.5 ${
              isViewed ? "text-[#6B6B6B]" : "text-[#6B6B6B]/60"
            }`}
          >
            {investor.firm_name}
          </p>
        </div>

        <div className="flex items-center gap-1 text-xs font-inter text-[#6B6B6B] flex-shrink-0">
          <MapPin className="w-3 h-3" />
          {investor.city ? `${investor.city}, ` : ""}
          {investor.country}
        </div>
      </div>

      {isViewed ? (
        <p className="text-sm font-inter text-[#6B6B6B] leading-relaxed mt-3">
          {investor.about}
        </p>
      ) : (
        <div className="relative mt-3">
          <p
            className="text-sm font-inter text-[#6B6B6B]/50 leading-relaxed"
            style={{ filter: "blur(3px)", userSelect: "none" }}
          >
            {investor.about.substring(0, 100)}...
          </p>
          <p className="text-xs font-inter text-[#6B6B6B] mt-1">
            🔒 Unlock to view full description
          </p>
        </div>
      )}

      <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
        <div className="flex gap-1.5 flex-wrap">
          {sectors.map((tag) => (
            <span
              key={tag}
              className={`text-[10px] font-inter font-semibold px-2.5 py-1 rounded-full ${
                isViewed
                  ? "bg-[#C6FF55]/15 text-[#1E1E1E]"
                  : "bg-black/[0.04] text-[#6B6B6B]/60"
              }`}
            >
              {tag.trim()}
            </span>
          ))}
        </div>
        <button
          type="button"
          onClick={() => onViewProfile(investor)}
          disabled={isLoading}
          className={`flex items-center gap-1.5 text-xs font-inter font-semibold px-4 py-2 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            isViewed
              ? "bg-[#C6FF55]/20 text-[#1E1E1E] hover:bg-[#C6FF55]/40"
              : "bg-[#1E1E1E] text-white hover:bg-[#333]"
          }`}
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin h-3 w-3"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Loading...
            </>
          ) : isViewed ? (
            <>
              <ExternalLink className="w-3 h-3" /> View Profile
            </>
          ) : (
            <>
              <Zap className="w-3 h-3 text-[#C6FF55]" /> Unlock Profile
            </>
          )}
        </button>
      </div>

      {!isViewed && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-transparent via-transparent to-white/60 pointer-events-none" />
      )}
    </motion.div>
  );
}

export default memo(InvestorListCard);
