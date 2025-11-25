"use client";

import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";

interface AddInvestorModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AddInvestorModal({ open, onClose, onSuccess }: AddInvestorModalProps) {
    const [formData, setFormData] = useState({
        name: "",
        firm_name: "",
        email: "",
        linkedin: "",
        city: "",
        country: "",
        preference_sector: "",
        about: "",
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSaving(true);

        try {
            const supabase = createSupabaseBrowserClient();

            const { error: insertError } = await supabase
                .from("investors")
                .insert([formData]);

            if (insertError) throw insertError;

            // Reset form
            setFormData({
                name: "",
                firm_name: "",
                email: "",
                linkedin: "",
                city: "",
                country: "",
                preference_sector: "",
                about: "",
            });

            onSuccess();
            onClose();
        } catch (err: unknown) {
            console.error("Error adding investor:", err);
            const errorMessage = err instanceof Error ? err.message : "Failed to add investor. Please try again.";
            setError(errorMessage);
        } finally {
            setSaving(false);
        }
    };

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
                        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            {/* Header */}
                            <div className="sticky top-0 bg-white border-b border-[#31372B1F] p-6 flex justify-between items-center">
                                <h2 className="text-[24px] font-bold text-[#31372B]">
                                    Add New Investor
                                </h2>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-[#F5F5F5] rounded-lg transition"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="p-6">
                                {error && (
                                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                                        <p className="text-[14px] text-red-600">{error}</p>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <label className="block text-[14px] font-semibold text-[#31372B] mb-2">
                                            Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-2 border border-[#31372B1F] rounded-md outline-none focus:ring-2 focus:ring-[#31372B] text-[14px]"
                                            placeholder="John Doe"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[14px] font-semibold text-[#31372B] mb-2">
                                            Firm Name
                                        </label>
                                        <input
                                            type="text"
                                            name="firm_name"
                                            value={formData.firm_name}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-[#31372B1F] rounded-md outline-none focus:ring-2 focus:ring-[#31372B] text-[14px]"
                                            placeholder="Acme Ventures"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[14px] font-semibold text-[#31372B] mb-2">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-[#31372B1F] rounded-md outline-none focus:ring-2 focus:ring-[#31372B] text-[14px]"
                                            placeholder="john@example.com"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[14px] font-semibold text-[#31372B] mb-2">
                                            LinkedIn URL
                                        </label>
                                        <input
                                            type="url"
                                            name="linkedin"
                                            value={formData.linkedin}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-[#31372B1F] rounded-md outline-none focus:ring-2 focus:ring-[#31372B] text-[14px]"
                                            placeholder="https://linkedin.com/in/..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[14px] font-semibold text-[#31372B] mb-2">
                                            City
                                        </label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-[#31372B1F] rounded-md outline-none focus:ring-2 focus:ring-[#31372B] text-[14px]"
                                            placeholder="San Francisco"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[14px] font-semibold text-[#31372B] mb-2">
                                            Country
                                        </label>
                                        <input
                                            type="text"
                                            name="country"
                                            value={formData.country}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-[#31372B1F] rounded-md outline-none focus:ring-2 focus:ring-[#31372B] text-[14px]"
                                            placeholder="United States"
                                        />
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <label className="block text-[14px] font-semibold text-[#31372B] mb-2">
                                        Preferred Sectors <span className="text-[12px] text-[#717182] font-normal">(comma-separated)</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="preference_sector"
                                        value={formData.preference_sector}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-[#31372B1F] rounded-md outline-none focus:ring-2 focus:ring-[#31372B] text-[14px]"
                                        placeholder="SaaS, FinTech, AI/ML"
                                    />
                                </div>

                                <div className="mb-6">
                                    <label className="block text-[14px] font-semibold text-[#31372B] mb-2">
                                        About
                                    </label>
                                    <textarea
                                        name="about"
                                        value={formData.about}
                                        onChange={handleChange}
                                        rows={4}
                                        className="w-full px-4 py-2 border border-[#31372B1F] rounded-md outline-none focus:ring-2 focus:ring-[#31372B] text-[14px] resize-none"
                                        placeholder="Brief description about the investor..."
                                    />
                                </div>

                                <div className="flex gap-3 justify-end">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-4 py-2 border border-[#31372B1F] rounded-lg hover:bg-[#F5F5F5] transition text-[14px] font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="px-4 py-2 bg-[#31372B] text-white rounded-lg hover:opacity-90 transition text-[14px] font-medium disabled:opacity-50"
                                    >
                                        {saving ? "Adding..." : "Add Investor"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
