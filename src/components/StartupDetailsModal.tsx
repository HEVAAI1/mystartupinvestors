"use client";

import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface StartupDetailsModalProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    startup: any;
    open: boolean;
    onClose: () => void;
}

export default function StartupDetailsModal({ startup, open, onClose }: StartupDetailsModalProps) {
    if (!startup) return null;

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
                                    Startup Details
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
                                {/* Personal Information */}
                                <div className="mb-8">
                                    <h3 className="text-[18px] font-bold text-[#31372B] mb-4">Personal Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[12px] text-[#717182] mb-1">Full Name</p>
                                            <p className="text-[14px] text-[#31372B] font-medium">{startup.full_name || "N/A"}</p>
                                        </div>
                                        <div>
                                            <p className="text-[12px] text-[#717182] mb-1">Email</p>
                                            <p className="text-[14px] text-[#31372B] font-medium">{startup.email || "N/A"}</p>
                                        </div>
                                        <div>
                                            <p className="text-[12px] text-[#717182] mb-1">Phone</p>
                                            <p className="text-[14px] text-[#31372B] font-medium">{startup.phone || "N/A"}</p>
                                        </div>
                                        <div>
                                            <p className="text-[12px] text-[#717182] mb-1">City</p>
                                            <p className="text-[14px] text-[#31372B] font-medium">{startup.city || "N/A"}</p>
                                        </div>
                                        <div>
                                            <p className="text-[12px] text-[#717182] mb-1">LinkedIn</p>
                                            {startup.linkedin ? (
                                                <a href={startup.linkedin} target="_blank" rel="noopener noreferrer" className="text-[14px] text-blue-600 hover:underline">
                                                    View Profile
                                                </a>
                                            ) : (
                                                <p className="text-[14px] text-[#31372B] font-medium">N/A</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Company Information */}
                                <div className="mb-8">
                                    <h3 className="text-[18px] font-bold text-[#31372B] mb-4">Company Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[12px] text-[#717182] mb-1">Company Name</p>
                                            <p className="text-[14px] text-[#31372B] font-medium">{startup.company_name || "N/A"}</p>
                                        </div>
                                        <div>
                                            <p className="text-[12px] text-[#717182] mb-1">Designation</p>
                                            <p className="text-[14px] text-[#31372B] font-medium">{startup.designation || "N/A"}</p>
                                        </div>
                                        <div>
                                            <p className="text-[12px] text-[#717182] mb-1">Website</p>
                                            {startup.company_website ? (
                                                <a href={startup.company_website} target="_blank" rel="noopener noreferrer" className="text-[14px] text-blue-600 hover:underline">
                                                    Visit Website
                                                </a>
                                            ) : (
                                                <p className="text-[14px] text-[#31372B] font-medium">N/A</p>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-[12px] text-[#717182] mb-1">Industry</p>
                                            <p className="text-[14px] text-[#31372B] font-medium">{startup.industry || "N/A"}</p>
                                        </div>
                                        <div>
                                            <p className="text-[12px] text-[#717182] mb-1">Profile</p>
                                            <p className="text-[14px] text-[#31372B] font-medium">{startup.profile || "N/A"}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Funding Information */}
                                <div className="mb-8">
                                    <h3 className="text-[18px] font-bold text-[#31372B] mb-4">Funding Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[12px] text-[#717182] mb-1">Current ARR</p>
                                            <p className="text-[14px] text-[#31372B] font-medium">{startup.current_arr || "N/A"}</p>
                                        </div>
                                        <div>
                                            <p className="text-[12px] text-[#717182] mb-1">Funding Status</p>
                                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-[12px] font-medium">
                                                {startup.funding_status || "N/A"}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-[12px] text-[#717182] mb-1">Looking to Raise</p>
                                            <p className="text-[14px] text-[#31372B] font-medium">{startup.looking_to_raise || "N/A"}</p>
                                        </div>
                                        <div>
                                            <p className="text-[12px] text-[#717182] mb-1">Pre-Money Valuation</p>
                                            <p className="text-[14px] text-[#31372B] font-medium">{startup.pre_money_valuation || "N/A"}</p>
                                        </div>
                                        <div className="md:col-span-2">
                                            <p className="text-[12px] text-[#717182] mb-1">Previous Funding Amount</p>
                                            <p className="text-[14px] text-[#31372B] font-medium">{startup.previous_funding_amount || "N/A"}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Additional Information */}
                                <div>
                                    <h3 className="text-[18px] font-bold text-[#31372B] mb-4">Additional Information</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-[12px] text-[#717182] mb-1">Referral Source</p>
                                            <p className="text-[14px] text-[#31372B] font-medium">{startup.referral_source || "N/A"}</p>
                                        </div>
                                        <div>
                                            <p className="text-[12px] text-[#717182] mb-1">Additional Notes</p>
                                            <p className="text-[14px] text-[#31372B] font-medium whitespace-pre-wrap">{startup.additional_notes || "N/A"}</p>
                                        </div>
                                        {startup.deck_url && (
                                            <div>
                                                <p className="text-[12px] text-[#717182] mb-1">Pitch Deck</p>
                                                <a href={startup.deck_url} target="_blank" rel="noopener noreferrer" className="text-[14px] text-blue-600 hover:underline">
                                                    View Deck
                                                </a>
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-[12px] text-[#717182] mb-1">Submitted On</p>
                                            <p className="text-[14px] text-[#31372B] font-medium">
                                                {new Date(startup.created_at).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
