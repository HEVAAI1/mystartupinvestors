"use client";

import { X, Download, Upload, FileSpreadsheet } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import * as XLSX from "xlsx";

interface AddInvestorExcelModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AddInvestorExcelModal({ open, onClose, onSuccess }: AddInvestorExcelModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleDownloadTemplate = () => {
        const templateData = [
            {
                name: "John Doe",
                firm_name: "Acme Ventures",
                email: "john@example.com",
                linkedin: "https://linkedin.com/in/johndoe",
                city: "San Francisco",
                country: "United States",
                preference_sector: "SaaS, FinTech, AI/ML",
                about: "Experienced investor focusing on early-stage startups",
            },
        ];

        const worksheet = XLSX.utils.json_to_sheet(templateData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Investors");

        worksheet['!cols'] = [
            { wch: 20 }, { wch: 25 }, { wch: 30 }, { wch: 40 },
            { wch: 20 }, { wch: 20 }, { wch: 30 }, { wch: 50 },
        ];

        XLSX.writeFile(workbook, "Investor_Template.xlsx");
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setError("");
            setSuccess("");
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError("Please select a file to upload");
            return;
        }

        setUploading(true);
        setError("");
        setSuccess("");

        try {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data);
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            if (jsonData.length === 0) {
                throw new Error("The Excel file is empty");
            }

            const investors = jsonData.map((row: any) => ({
                name: row.name || "",
                firm_name: row.firm_name || "",
                email: row.email || "",
                linkedin: row.linkedin || "",
                city: row.city || "",
                country: row.country || "",
                preference_sector: row.preference_sector || "",
                about: row.about || "",
            }));

            const supabase = createSupabaseBrowserClient();
            const { error: insertError } = await supabase
                .from("investors")
                .insert(investors);

            if (insertError) throw insertError;

            setSuccess(`Successfully added ${investors.length} investor(s)!`);
            setFile(null);

            const fileInput = document.getElementById('excel-file-input') as HTMLInputElement;
            if (fileInput) fileInput.value = '';

            setTimeout(() => {
                onSuccess();
                onClose();
            }, 2000);
        } catch (err: any) {
            console.error("Error uploading investors:", err);
            setError(err.message || "Failed to upload investors. Please check your file format.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 z-50"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            {/* Header - Sticky */}
                            <div className="sticky top-0 bg-white border-b border-[#31372B1F] p-6 flex justify-between items-center rounded-t-xl z-10">
                                <h2 className="text-[24px] font-bold text-[#31372B]">
                                    Add Investors via Excel
                                </h2>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-[#F5F5F5] rounded-lg transition"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Content - Scrollable */}
                            <div className="p-6">
                                {/* Instructions */}
                                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <h3 className="text-[14px] font-bold text-[#31372B] mb-2">
                                        📋 Instructions
                                    </h3>
                                    <ol className="text-[13px] text-[#717182] space-y-1 list-decimal list-inside">
                                        <li>Download the template Excel file</li>
                                        <li>Fill in investor details</li>
                                        <li>Upload the completed file</li>
                                    </ol>
                                </div>

                                {/* Expected Format */}
                                <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                    <h3 className="text-[14px] font-bold text-[#31372B] mb-2">
                                        📊 Expected Format
                                    </h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-[11px] border-collapse">
                                            <thead>
                                                <tr className="bg-gray-200">
                                                    <th className="border border-gray-300 px-2 py-1 text-left">name</th>
                                                    <th className="border border-gray-300 px-2 py-1 text-left">firm_name</th>
                                                    <th className="border border-gray-300 px-2 py-1 text-left">email</th>
                                                    <th className="border border-gray-300 px-2 py-1 text-left">city</th>
                                                    <th className="border border-gray-300 px-2 py-1 text-left">country</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td className="border border-gray-300 px-2 py-1 text-[#717182]">John Doe</td>
                                                    <td className="border border-gray-300 px-2 py-1 text-[#717182]">Acme Ventures</td>
                                                    <td className="border border-gray-300 px-2 py-1 text-[#717182]">john@example.com</td>
                                                    <td className="border border-gray-300 px-2 py-1 text-[#717182]">San Francisco</td>
                                                    <td className="border border-gray-300 px-2 py-1 text-[#717182]">United States</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <p className="text-[11px] text-[#717182] mt-2">
                                        + linkedin, preference_sector, about columns
                                    </p>
                                </div>

                                {/* Download Template */}
                                <button
                                    onClick={handleDownloadTemplate}
                                    className="w-full mb-4 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-[14px] font-medium"
                                >
                                    <Download size={16} />
                                    Download Template
                                </button>

                                {/* File Upload */}
                                <div className="mb-4">
                                    <label className="block text-[14px] font-semibold text-[#31372B] mb-2">
                                        Upload Excel File
                                    </label>
                                    <div className="border-2 border-dashed border-[#31372B1F] rounded-lg p-4 text-center">
                                        <input
                                            id="excel-file-input"
                                            type="file"
                                            accept=".xlsx,.xls"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                        <label
                                            htmlFor="excel-file-input"
                                            className="cursor-pointer flex flex-col items-center"
                                        >
                                            <FileSpreadsheet size={40} className="text-[#717182] mb-2" />
                                            <p className="text-[13px] text-[#31372B] font-medium mb-1">
                                                Click to upload
                                            </p>
                                            <p className="text-[11px] text-[#717182]">
                                                .xlsx or .xls files only
                                            </p>
                                        </label>
                                    </div>
                                    {file && (
                                        <p className="mt-2 text-[13px] text-green-600 flex items-center gap-2">
                                            <FileSpreadsheet size={14} />
                                            {file.name}
                                        </p>
                                    )}
                                </div>

                                {/* Messages */}
                                {error && (
                                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                                        <p className="text-[13px] text-red-600">{error}</p>
                                    </div>
                                )}

                                {success && (
                                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                                        <p className="text-[13px] text-green-600">{success}</p>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex gap-3 justify-end">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-4 py-2 border border-[#31372B1F] rounded-lg hover:bg-[#F5F5F5] transition text-[14px] font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleUpload}
                                        disabled={!file || uploading}
                                        className="px-4 py-2 bg-[#31372B] text-white rounded-lg hover:opacity-90 transition text-[14px] font-medium disabled:opacity-50 flex items-center gap-2"
                                    >
                                        <Upload size={14} />
                                        {uploading ? "Uploading..." : "Upload & Add"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
