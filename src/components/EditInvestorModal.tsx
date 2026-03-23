"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";

interface Investor {
    id: number;
    name: string;
    firm_name?: string;
    type?: string;
    email: string;
    linkedin?: string;
    city?: string;
    country?: string;
    preference_sector?: string;
    about?: string;
}

interface EditInvestorModalProps {
    investor: Investor | null;
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function EditInvestorModal({
    investor,
    open,
    onClose,
    onSuccess,
}: EditInvestorModalProps) {
    const [formData, setFormData] = useState({
        name: "",
        firm_name: "",
        type: "",
        email: "",
        linkedin: "",
        city: "",
        country: "",
        preference_sector: "",
        about: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Update form data when investor changes
    useEffect(() => {
        if (investor) {
            setFormData({
                name: investor.name || "",
                firm_name: investor.firm_name || "",
                type: investor.type || "",
                email: investor.email || "",
                linkedin: investor.linkedin || "",
                city: investor.city || "",
                country: investor.country || "",
                preference_sector: investor.preference_sector || "",
                about: investor.about || "",
            });
        }
    }, [investor]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!investor) return;

        setLoading(true);
        setError("");

        try {
            const supabase = createSupabaseBrowserClient();

            const { error: updateError } = await supabase
                .from("investors")
                .update(formData)
                .eq("id", investor.id);

            if (updateError) throw updateError;

            onSuccess();
            onClose();
        } catch (err) {
            console.error("Error updating investor:", err);
            setError(err instanceof Error ? err.message : "Failed to update investor");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

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
                    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
                        >
                            {/* Header */}
                            <div className="flex justify-between items-center p-6 border-b border-[#31372B1F]">
                                <h2 className="text-[24px] font-bold text-[#31372B]">
                                    Edit Investor
                                </h2>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-[#F5F5F5] rounded-lg transition"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                                {error && (
                                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                                        {error}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-[#31372B] mb-1">
                                            Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-3 py-2 border border-[#31372B1F] rounded-lg outline-none focus:ring-2 focus:ring-[#31372B] text-sm"
                                        />
                                    </div>

                                    {/* Firm Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-[#31372B] mb-1">
                                            Firm Name
                                        </label>
                                        <input
                                            type="text"
                                            name="firm_name"
                                            value={formData.firm_name}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-[#31372B1F] rounded-lg outline-none focus:ring-2 focus:ring-[#31372B] text-sm"
                                        />
                                    </div>

                                    {/* Type */}
                                    <div>
                                        <label className="block text-sm font-medium text-[#31372B] mb-1">
                                            Type
                                        </label>
                                        <select
                                            name="type"
                                            value={formData.type}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-[#31372B1F] rounded-lg outline-none focus:ring-2 focus:ring-[#31372B] text-sm"
                                        >
                                            <option value="">Select Type</option>
                                            <option value="VC">VC</option>
                                            <option value="Angel Investor">Angel Investor</option>
                                            <option value="Corporate VC">Corporate VC</option>
                                            <option value="Family office">Family office</option>
                                            <option value="Angel network">Angel network</option>
                                            <option value="Revenue-based">Revenue-based</option>
                                            <option value="Solo angel">Solo angel</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label className="block text-sm font-medium text-[#31372B] mb-1">
                                            Email <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-3 py-2 border border-[#31372B1F] rounded-lg outline-none focus:ring-2 focus:ring-[#31372B] text-sm"
                                        />
                                    </div>

                                    {/* LinkedIn */}
                                    <div>
                                        <label className="block text-sm font-medium text-[#31372B] mb-1">
                                            LinkedIn URL
                                        </label>
                                        <input
                                            type="url"
                                            name="linkedin"
                                            value={formData.linkedin}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-[#31372B1F] rounded-lg outline-none focus:ring-2 focus:ring-[#31372B] text-sm"
                                        />
                                    </div>

                                    {/* City */}
                                    <div>
                                        <label className="block text-sm font-medium text-[#31372B] mb-1">
                                            City
                                        </label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-[#31372B1F] rounded-lg outline-none focus:ring-2 focus:ring-[#31372B] text-sm"
                                        />
                                    </div>

                                    {/* Country */}
                                    <div>
                                        <label className="block text-sm font-medium text-[#31372B] mb-1">
                                            Country
                                        </label>
                                        <input
                                            type="text"
                                            name="country"
                                            value={formData.country}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-[#31372B1F] rounded-lg outline-none focus:ring-2 focus:ring-[#31372B] text-sm"
                                        />
                                    </div>

                                    {/* Preference Sector */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-[#31372B] mb-1">
                                            Preference Sector
                                        </label>
                                        <input
                                            type="text"
                                            name="preference_sector"
                                            value={formData.preference_sector}
                                            onChange={handleChange}
                                            placeholder="e.g., AI, Fintech, Healthcare"
                                            className="w-full px-3 py-2 border border-[#31372B1F] rounded-lg outline-none focus:ring-2 focus:ring-[#31372B] text-sm"
                                        />
                                    </div>

                                    {/* About */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-[#31372B] mb-1">
                                            About
                                        </label>
                                        <textarea
                                            name="about"
                                            value={formData.about}
                                            onChange={handleChange}
                                            rows={4}
                                            className="w-full px-3 py-2 border border-[#31372B1F] rounded-lg outline-none focus:ring-2 focus:ring-[#31372B] text-sm resize-none"
                                        />
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[#31372B1F]">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-4 py-2 border border-[#31372B1F] rounded-lg hover:bg-[#F5F5F5] transition text-sm font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-4 py-2 bg-[#31372B] text-white rounded-lg hover:opacity-90 transition text-sm font-medium disabled:opacity-50"
                                    >
                                        {loading ? "Updating..." : "Update Investor"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
