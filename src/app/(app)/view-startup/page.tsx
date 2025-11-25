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

    const renderField = (label: string, field: keyof StartupData, value: string) => {
        const isEditing = editingField === field;

        return (
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <label className="text-[14px] font-semibold text-[#31372B]">{label}</label>
                    {!isEditing && (
                        <button
                            onClick={() => handleEdit(field, value)}
                            className="text-[#31372B] hover:text-[#717182] transition"
                        >
                            <Edit2 size={16} />
                        </button>
                    )}
                </div>

                {isEditing ? (
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="flex-1 rounded-md px-3 py-2 text-[14px] border border-[#31372B1F] outline-none focus:ring-1 focus:ring-[#31372B]"
                            autoFocus
                        />
                        <button
                            onClick={() => handleSave(field)}
                            disabled={saving}
                            className="px-3 py-2 bg-[#31372B] text-white rounded-md hover:opacity-90 transition"
                        >
                            <Save size={16} />
                        </button>
                        <button
                            onClick={handleCancel}
                            className="px-3 py-2 border border-[#31372B1F] rounded-md hover:bg-[#F5F5F5] transition"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ) : (
                    <p className="text-[14px] text-[#717182] bg-[#F3F3F5] px-3 py-2 rounded-md">
                        {value || "Not provided"}
                    </p>
                )}
            </div>
        );
    };

    const renderRadioField = (label: string, field: keyof StartupData, value: string, options: string[]) => {
        const isEditing = editingField === field;

        return (
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <label className="text-[14px] font-semibold text-[#31372B]">{label}</label>
                    {!isEditing && (
                        <button
                            onClick={() => handleEdit(field, value)}
                            className="text-[#31372B] hover:text-[#717182] transition"
                        >
                            <Edit2 size={16} />
                        </button>
                    )}
                </div>

                {isEditing ? (
                    <div>
                        <div className="flex flex-col gap-2 mb-2">
                            {options.map((option) => (
                                <label key={option} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name={field}
                                        value={option}
                                        checked={editValue === option}
                                        onChange={(e) => setEditValue(e.target.value)}
                                    />
                                    <span className="text-[14px]">{option}</span>
                                </label>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleSave(field)}
                                disabled={saving}
                                className="px-3 py-2 bg-[#31372B] text-white rounded-md hover:opacity-90 transition text-[14px]"
                            >
                                Save
                            </button>
                            <button
                                onClick={handleCancel}
                                className="px-3 py-2 border border-[#31372B1F] rounded-md hover:bg-[#F5F5F5] transition text-[14px]"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="text-[14px] text-[#717182] bg-[#F3F3F5] px-3 py-2 rounded-md">
                        {value || "Not provided"}
                    </p>
                )}
            </div>
        );
    };

    const renderTextareaField = (label: string, field: keyof StartupData, value: string) => {
        const isEditing = editingField === field;

        return (
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <label className="text-[14px] font-semibold text-[#31372B]">{label}</label>
                    {!isEditing && (
                        <button
                            onClick={() => handleEdit(field, value)}
                            className="text-[#31372B] hover:text-[#717182] transition"
                        >
                            <Edit2 size={16} />
                        </button>
                    )}
                </div>

                {isEditing ? (
                    <div>
                        <textarea
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            rows={4}
                            className="w-full rounded-md px-3 py-2 text-[14px] border border-[#31372B1F] outline-none focus:ring-1 focus:ring-[#31372B] resize-none mb-2"
                            autoFocus
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleSave(field)}
                                disabled={saving}
                                className="px-3 py-2 bg-[#31372B] text-white rounded-md hover:opacity-90 transition text-[14px]"
                            >
                                Save
                            </button>
                            <button
                                onClick={handleCancel}
                                className="px-3 py-2 border border-[#31372B1F] rounded-md hover:bg-[#F5F5F5] transition text-[14px]"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="text-[14px] text-[#717182] bg-[#F3F3F5] px-3 py-2 rounded-md whitespace-pre-wrap">
                        {value || "Not provided"}
                    </p>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FAF7EE] flex items-center justify-center">
                <p className="text-[#717182]">Loading...</p>
            </div>
        );
    }

    if (!startupData) {
        return (
            <div className="min-h-screen bg-[#FAF7EE] flex items-center justify-center">
                <div className="text-center">
                    <p className="text-[#717182] mb-4">No startup details found.</p>
                    <button
                        onClick={() => router.push("/add-startup")}
                        className="px-4 py-2 bg-[#31372B] text-white rounded-md hover:opacity-90"
                    >
                        Add Your Startup
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FAF7EE] pt-[92px] pb-20">
            <div className="max-w-[900px] mx-auto px-6">
                <h1 className="text-[32px] font-bold text-[#31372B] mb-2">My Startup Details</h1>
                <p className="text-[16px] text-[#717182] mb-8">
                    View and edit your startup information
                </p>

                <div className="bg-white rounded-xl border border-[#31372B1F] shadow-sm p-8">
                    {/* Personal Details Section */}
                    <h2 className="text-[24px] font-bold text-[#31372B] mb-6">Personal Details</h2>
                    {renderField("Name", "full_name", startupData.full_name)}
                    {renderField("Email", "email", startupData.email)}
                    {renderField("Phone Number", "phone", startupData.phone)}
                    {renderField("LinkedIn URL", "linkedin", startupData.linkedin)}
                    {renderField("City", "city", startupData.city)}

                    <hr className="my-8 border-[#31372B1F]" />

                    {/* Startup Details Section */}
                    <h2 className="text-[24px] font-bold text-[#31372B] mb-6">Startup Details</h2>
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

                    <hr className="my-8 border-[#31372B1F]" />

                    {/* Additional Information Section */}
                    <h2 className="text-[24px] font-bold text-[#31372B] mb-6">Additional Information</h2>
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
                        <div className="mb-6">
                            <label className="text-[14px] font-semibold text-[#31372B] mb-2 block">Pitch Deck</label>
                            <a
                                href={startupData.deck_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[14px] text-[#31372B] hover:underline bg-[#F3F3F5] px-3 py-2 rounded-md inline-block"
                            >
                                View Uploaded Deck
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
