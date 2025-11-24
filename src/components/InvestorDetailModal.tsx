"use client";

import React from "react";

interface InvestorDetailModalProps {
  open: boolean;
  onClose: () => void;
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
  } | null;
}

const InvestorDetailModal: React.FC<InvestorDetailModalProps> = ({
  open,
  onClose,
  investor,
}) => {
  if (!open || !investor) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex justify-center items-center z-[2000] px-4">
      {/* MODAL CARD */}
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl p-6 border border-[#31372B1F] animate-fadeIn">

        {/* HEADER */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-[22px] font-bold text-[#31372B] mb-1">
              {investor.name}
            </h2>
            <p className="text-sm text-[#717182]">{investor.firm_name}</p>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="text-[#717182] hover:text-[#31372B] text-xl font-bold"
          >
            ×
          </button>
        </div>

        {/* ABOUT */}
        <p className="text-[15px] text-[#31372B] leading-relaxed mb-4">
          {investor.about}
        </p>

        {/* TAGS */}
        <div className="flex flex-wrap gap-2 mb-5">
          {investor.preference_sector.split(",").map((tag) => (
            <span
              key={tag}
              className="bg-[#F5F5F5] border border-[#31372B1F] text-[#31372B] text-xs px-2 py-1 rounded-md"
            >
              {tag.trim()}
            </span>
          ))}
        </div>

        {/* LOCATION + CONTACT */}
        <div className="space-y-2 text-[14px]">
          <div className="flex justify-between">
            <span className="font-semibold text-[#31372B]">Location:</span>
            <span className="text-[#717182]">
              {investor.city}, {investor.country}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="font-semibold text-[#31372B]">Email:</span>
            <a
              href={`mailto:${investor.email}`}
              className="text-[#31372B] hover:underline"
            >
              {investor.email}
            </a>
          </div>

          <div className="flex justify-between">
            <span className="font-semibold text-[#31372B]">LinkedIn:</span>
            <a
              href={investor.linkedin}
              target="_blank"
              className="text-[#31372B] hover:underline"
            >
              View Profile
            </a>
          </div>
        </div>

        {/* BUTTONS */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-[#31372B] text-[#FAF7EE] rounded-md px-5 py-2 text-sm font-medium hover:opacity-90"
          >
            Close
          </button>
        </div>
      </div>

      {/* ANIMATION */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default InvestorDetailModal;
