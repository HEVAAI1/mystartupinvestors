"use client";

import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface InvestorDetailsModalProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    investor: any;
    open: boolean;
    onClose: () => void;
}

export default function InvestorDetailsModal({ investor, open, onClose }: InvestorDetailsModalProps) {
    if (!investor) return null;

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                            {/* Header */}
                            <div className="sticky top-0 bg-white border-b border-[#31372B1F] p-6 flex justify-between items-center">
                                <h2 className="text-[24px] font-bold text-[#31372B]">
                                    Investor Details
                                </h2>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-[#F5F5F5] rounded-lg transition"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                {/* Basic Information */}
                                <div className="mb-8">
                                    <h3 className="text-[18px] font-bold text-[#31372B] mb-4">Basic Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[12px] text-[#717182] mb-1">ID</p>
                                            <p className="text-[14px] text-[#31372B] font-medium">{investor.id}</p>
                                        </div>
                                        <div>
                                            <p className="text-[12px] text-[#717182] mb-1">Name</p>
                                            <p className="text-[14px] text-[#31372B] font-medium">{investor.name || "N/A"}</p>
                                        </div>
                                        <div>
                                            <p className="text-[12px] text-[#717182] mb-1">Firm Name</p>
                                            <p className="text-[14px] text-[#31372B] font-medium">{investor.firm_name || "N/A"}</p>
                                        </div>
                                        <div>
                                            <p className="text-[12px] text-[#717182] mb-1">Email</p>
                                            <p className="text-[14px] text-[#31372B] font-medium">{investor.email || "N/A"}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Location */}
                                <div className="mb-8">
                                    <h3 className="text-[18px] font-bold text-[#31372B] mb-4">Location</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[12px] text-[#717182] mb-1">City</p>
                                            <p className="text-[14px] text-[#31372B] font-medium">{investor.city || "N/A"}</p>
                                        </div>
                                        <div>
                                            <p className="text-[12px] text-[#717182] mb-1">Country</p>
                                            <p className="text-[14px] text-[#31372B] font-medium">{investor.country || "N/A"}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Investment Preferences */}
                                <div className="mb-8">
                                    <h3 className="text-[18px] font-bold text-[#31372B] mb-4">Investment Preferences</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-[12px] text-[#717182] mb-2">Preferred Sectors</p>
                                            <div className="flex flex-wrap gap-2">
                                                {investor.preference_sector?.split(",").map((sector: string, idx: number) => (
                                                    <span
                                                        key={idx}
                                                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-md text-[12px] font-medium"
                                                    >
                                                        {sector.trim()}
                                                    </span>
                                                )) || <p className="text-[14px] text-[#31372B]">N/A</p>}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Professional Links */}
                                <div className="mb-8">
                                    <h3 className="text-[18px] font-bold text-[#31372B] mb-4">Professional Links</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-[12px] text-[#717182] mb-1">LinkedIn</p>
                                            {investor.linkedin ? (
                                                <a
                                                    href={investor.linkedin}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-[14px] text-blue-600 hover:underline"
                                                >
                                                    View LinkedIn Profile
                                                </a>
                                            ) : (
                                                <p className="text-[14px] text-[#31372B]">N/A</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* About */}
                                {investor.about && (
                                    <div>
                                        <h3 className="text-[18px] font-bold text-[#31372B] mb-4">About</h3>
                                        <p className="text-[14px] text-[#31372B] whitespace-pre-wrap leading-relaxed">
                                            {investor.about}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
