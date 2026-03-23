"use client";

import { useState } from "react";
import { X, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";

interface Investor {
    id: number;
    name: string;
    firm_name?: string;
    email: string;
}

interface DeleteConfirmModalProps {
    investor: Investor | null;
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function DeleteConfirmModal({
    investor,
    open,
    onClose,
    onSuccess,
}: DeleteConfirmModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleDelete = async () => {
        if (!investor) return;

        setLoading(true);
        setError("");

        try {
            const supabase = createSupabaseBrowserClient();

            const { error: deleteError } = await supabase
                .from("investors")
                .delete()
                .eq("id", investor.id);

            if (deleteError) throw deleteError;

            onSuccess();
            onClose();
        } catch (err) {
            console.error("Error deleting investor:", err);
            setError(err instanceof Error ? err.message : "Failed to delete investor");
        } finally {
            setLoading(false);
        }
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
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
                        >
                            {/* Header */}
                            <div className="flex justify-between items-start p-6 border-b border-[#31372B1F]">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-red-100 rounded-lg">
                                        <AlertTriangle size={24} className="text-red-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-[20px] font-bold text-[#31372B]">
                                            Delete Investor
                                        </h2>
                                        <p className="text-sm text-[#717182] mt-1">
                                            This action cannot be undone
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-[#F5F5F5] rounded-lg transition"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                {error && (
                                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                                        {error}
                                    </div>
                                )}

                                <p className="text-[#31372B] mb-4">
                                    Are you sure you want to delete <strong>{investor.name}</strong>?
                                </p>

                                <div className="bg-[#F5F5F5] rounded-lg p-4 space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-[#717182]">Name:</span>
                                        <span className="text-[#31372B] font-medium">{investor.name}</span>
                                    </div>
                                    {investor.firm_name && (
                                        <div className="flex justify-between">
                                            <span className="text-[#717182]">Firm:</span>
                                            <span className="text-[#31372B] font-medium">{investor.firm_name}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="text-[#717182]">Email:</span>
                                        <span className="text-[#31372B] font-medium">{investor.email}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex justify-end gap-3 p-6 border-t border-[#31372B1F]">
                                <button
                                    onClick={onClose}
                                    disabled={loading}
                                    className="px-4 py-2 border border-[#31372B1F] rounded-lg hover:bg-[#F5F5F5] transition text-sm font-medium disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={loading}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium disabled:opacity-50"
                                >
                                    {loading ? "Deleting..." : "Delete Investor"}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
