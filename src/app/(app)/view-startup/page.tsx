"use client";

import { useState, useEffect, useCallback } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import { useRouter } from "next/navigation";
import { Edit2, Save, X } from "lucide-react";

interface StartupData {
    id: number;
    full_name: string;
    email: string;
    phone: string;
    linkedin: string;
    city: string;
    company_name: string;
    designation: string;
    company_website: string;
    profile: string;
    industry: string;
    current_arr: string;
    looking_to_raise: string;
    pre_money_valuation: string;
    funding_status: string;
    previous_funding_amount: string;
    referral_source: string;
    additional_notes: string;
    deck_url: string | null;
}

export default function ViewStartupPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [startupData, setStartupData] = useState<StartupData | null>(null);
    const [editingField, setEditingField] = useState<string | null>(null);
    const [editValue, setEditValue] = useState("");
    const [saving, setSaving] = useState(false);

    const fetchStartupData = useCallback(async () => {
        try {
            const supabase = createSupabaseBrowserClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push("/");
                return;
            }

            const { data, error } = await supabase
                .from("startup_leads")
                .select("*")
                .eq("user_id", user.id)
                .single();

            if (error) {
                console.error("Error fetching startup data:", error);
                return;
            }

            setStartupData(data);
        } catch (err) {
            console.error("Error:", err);
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        fetchStartupData();
    }, [fetchStartupData]);

    const handleEdit = (field: string, currentValue: string) => {
        setEditingField(field);
        setEditValue(currentValue || "");
    };

    const handleCancel = () => {
        setEditingField(null);
        setEditValue("");
    };

    const handleSave = async (field: string) => {
        if (!startupData) return;

        setSaving(true);
        try {
            const supabase = createSupabaseBrowserClient();
            const { error } = await supabase
                .from("startup_leads")
                .update({ [field]: editValue })
                .eq("id", startupData.id);

            if (error) {
                console.error("Error updating:", error);
                alert("Failed to update. Please try again.");
                return;
            }

            setStartupData({ ...startupData, [field]: editValue });
            setEditingField(null);
            setEditValue("");
        } catch (err) {
            console.error("Error:", err);
            alert("An error occurred. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const renderReadOnlyField = (label: string, value: string) => {
        return (
            <div className="mb-5">
                <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[13px] font-inter font-semibold text-[#31372B]">{label}</label>
                </div>
                <p className="text-[13px] font-inter text-[#6B6B6B] bg-black/[0.04] px-4 py-2.5 rounded-2xl border border-black/[0.05]">
                    {value || "Not provided"}
                </p>
            </div>
        );
    };

    const renderField = (label: string, field: keyof StartupData, value: string) => {
        const isEditing = editingField === field;

        return (
            <div className="mb-5">
                <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[13px] font-inter font-semibold text-[#31372B]">{label}</label>
                    {!isEditing && (
                        <button
                            onClick={() => handleEdit(field, value)}
                            className="text-[#6B6B6B] hover:text-[#31372B] transition p-1 rounded-lg hover:bg-black/[0.05]"
                        >
                            <Edit2 size={15} />
                        </button>
                    )}
                </div>

                {isEditing ? (
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="flex-1 rounded-2xl px-4 py-2.5 text-[13px] font-inter border border-black/[0.08] outline-none focus:ring-2 focus:ring-[#C6FF55]/40 focus:border-[#C6FF55]/60 transition"
                            autoFocus
                        />
                        <button
                            onClick={() => handleSave(field)}
                            disabled={saving}
                            className="px-3 py-2 bg-[#1E1E1E] text-white rounded-2xl hover:bg-[#333] transition disabled:opacity-50"
                        >
                            <Save size={15} />
                        </button>
                        <button
                            onClick={handleCancel}
                            className="px-3 py-2 border border-black/[0.10] rounded-2xl hover:bg-black/[0.04] transition"
                        >
                            <X size={15} />
                        </button>
                    </div>
                ) : (
                    <p className="text-[13px] font-inter text-[#6B6B6B] bg-black/[0.04] px-4 py-2.5 rounded-2xl border border-black/[0.05]">
                        {value || "Not provided"}
                    </p>
                )}
            </div>
        );
    };

    const renderRadioField = (label: string, field: keyof StartupData, value: string, options: string[]) => {
        const isEditing = editingField === field;

        return (
            <div className="mb-5">
                <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[13px] font-inter font-semibold text-[#31372B]">{label}</label>
                    {!isEditing && (
                        <button
                            onClick={() => handleEdit(field, value)}
                            className="text-[#6B6B6B] hover:text-[#31372B] transition p-1 rounded-lg hover:bg-black/[0.05]"
                        >
                            <Edit2 size={15} />
                        </button>
                    )}
                </div>

                {isEditing ? (
                    <div>
                        <div className="flex flex-col gap-2 mb-3 bg-black/[0.03] rounded-2xl p-4 border border-black/[0.05]">
                            {options.map((option) => (
                                <label key={option} className="flex items-center gap-2.5 cursor-pointer">
                                    <input
                                        type="radio"
                                        name={field}
                                        value={option}
                                        checked={editValue === option}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        className="accent-[#1E1E1E]"
                                    />
                                    <span className="text-[13px] font-inter text-[#31372B]">{option}</span>
                                </label>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleSave(field)}
                                disabled={saving}
                                className="px-4 py-2 bg-[#1E1E1E] text-white rounded-2xl hover:bg-[#333] transition text-[13px] font-inter font-semibold disabled:opacity-50"
                            >
                                Save
                            </button>
                            <button
                                onClick={handleCancel}
                                className="px-4 py-2 border border-black/[0.10] rounded-2xl hover:bg-black/[0.04] transition text-[13px] font-inter"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="text-[13px] font-inter text-[#6B6B6B] bg-black/[0.04] px-4 py-2.5 rounded-2xl border border-black/[0.05]">
                        {value || "Not provided"}
                    </p>
                )}
            </div>
        );
    };

    const renderTextareaField = (label: string, field: keyof StartupData, value: string) => {
        const isEditing = editingField === field;

        return (
            <div className="mb-5">
                <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[13px] font-inter font-semibold text-[#31372B]">{label}</label>
                    {!isEditing && (
                        <button
                            onClick={() => handleEdit(field, value)}
                            className="text-[#6B6B6B] hover:text-[#31372B] transition p-1 rounded-lg hover:bg-black/[0.05]"
                        >
                            <Edit2 size={15} />
                        </button>
                    )}
                </div>

                {isEditing ? (
                    <div>
                        <textarea
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            rows={4}
                            className="w-full rounded-2xl px-4 py-3 text-[13px] font-inter border border-black/[0.08] outline-none focus:ring-2 focus:ring-[#C6FF55]/40 focus:border-[#C6FF55]/60 resize-none mb-2 transition"
                            autoFocus
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleSave(field)}
                                disabled={saving}
                                className="px-4 py-2 bg-[#1E1E1E] text-white rounded-2xl hover:bg-[#333] transition text-[13px] font-inter font-semibold disabled:opacity-50"
                            >
                                Save
                            </button>
                            <button
                                onClick={handleCancel}
                                className="px-4 py-2 border border-black/[0.10] rounded-2xl hover:bg-black/[0.04] transition text-[13px] font-inter"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="text-[13px] font-inter text-[#6B6B6B] bg-black/[0.04] px-4 py-2.5 rounded-2xl border border-black/[0.05] whitespace-pre-wrap">
                        {value || "Not provided"}
                    </p>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FAF7EE] flex items-center justify-center">
                <div className="flex items-center gap-3">
                    <div className="animate-spin h-5 w-5 rounded-full border-2 border-[#1E1E1E] border-t-transparent" />
                    <p className="text-[#6B6B6B] font-inter text-sm">Loading...</p>
                </div>
            </div>
        );
    }

    if (!startupData) {
        return (
            <div className="min-h-screen bg-[#FAF7EE] flex items-center justify-center">
                <div className="text-center">
                    <p className="text-[#6B6B6B] font-inter mb-4">No startup details found.</p>
                    <button
                        onClick={() => router.push("/add-startup")}
                        className="px-5 py-2.5 bg-[#1E1E1E] text-white rounded-full font-inter font-semibold text-sm hover:bg-[#333] transition cursor-pointer"
                    >
                        Add Your Startup
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FAF7EE] font-inter pt-[92px] pb-20">
            <div className="max-w-[900px] mx-auto px-6">
                <h1 className="font-space font-bold text-[28px] text-[#1E1E1E] mb-1 tracking-[-0.02em]">My Startup Details</h1>
                <p className="text-[14px] font-inter text-[#6B6B6B] mb-8">
                    View and edit your startup information
                </p>

                <div className="bg-white/70 border border-black/[0.06] rounded-3xl shadow-sm p-7 md:p-8 backdrop-blur-sm">
                    {/* Personal Details Section */}
                    <h2 className="font-space font-bold text-[20px] text-[#1E1E1E] mb-5 tracking-[-0.01em]">Personal Details</h2>
                    {renderReadOnlyField("Name", startupData.full_name)}
                    {renderReadOnlyField("Email", startupData.email)}
                    {renderReadOnlyField("Phone Number", startupData.phone)}
                    {renderReadOnlyField("LinkedIn URL", startupData.linkedin)}
                    {renderReadOnlyField("City", startupData.city)}

                    <hr className="my-7 border-black/[0.06]" />

                    {/* Startup Details Section */}
                    <h2 className="font-space font-bold text-[20px] text-[#1E1E1E] mb-5 tracking-[-0.01em]">Startup Details</h2>
                    {renderField("Company Name", "company_name", startupData.company_name)}
                    {renderField("Designation", "designation", startupData.designation)}
                    {renderField("Company URL", "company_website", startupData.company_website)}
                    {renderRadioField("Profile", "profile", startupData.profile, ["B2B Founder", "B2C Founder"])}
                    {renderField("Industry", "industry", startupData.industry)}
                    {renderRadioField("Current ARR", "current_arr", startupData.current_arr, [
                        "Yet to Generate Revenue",
                        "<$10000",
                        "$10000 - $50000",
                        "$50000 - $100000",
                        "$100000 - $1Million",
                        "$1 Million+"
                    ])}
                    {renderRadioField("Looking to Raise", "looking_to_raise", startupData.looking_to_raise, [
                        "Yes - Equity Raise",
                        "Yes - Equity + Debt Raise",
                        "Yes - Debt Only",
                        "Not looking to raise now"
                    ])}
                    {renderField("Pre-Money Valuation", "pre_money_valuation", startupData.pre_money_valuation)}
                    {renderRadioField("Funding Status", "funding_status", startupData.funding_status, [
                        "Bootstrapped",
                        "Pre-Seed Funded (<$250K)",
                        "Seed Funded ($250K - $1Million)",
                        "Seed Funded ($1Million - $2million)",
                        "Series A",
                        "Series B"
                    ])}
                    {renderField("Previous Funding Amount", "previous_funding_amount", startupData.previous_funding_amount)}

                    <hr className="my-7 border-black/[0.06]" />

                    {/* Additional Information Section */}
                    <h2 className="font-space font-bold text-[20px] text-[#1E1E1E] mb-5 tracking-[-0.01em]">Additional Information</h2>
                    {renderRadioField("Referral Source", "referral_source", startupData.referral_source, [
                        "Linkedin",
                        "Twitter",
                        "Our Website",
                        "Whatsapp communities",
                        "Refer by a Friend",
                        "Discord Communities",
                        "Slack Communities",
                        "Email",
                        "Others"
                    ])}
                    {renderTextareaField("Additional Notes", "additional_notes", startupData.additional_notes)}

                    {startupData.deck_url && (
                        <div className="mb-5">
                            <label className="text-[13px] font-inter font-semibold text-[#31372B] mb-1.5 block">Pitch Deck</label>
                            <a
                                href={startupData.deck_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-[13px] font-inter text-[#31372B] bg-[#C6FF55]/20 border border-[#C6FF55]/40 px-4 py-2 rounded-full hover:bg-[#C6FF55]/30 transition"
                            >
                                View Uploaded Deck →
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
