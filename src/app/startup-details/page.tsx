"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { FiEdit2 } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import StartupStepper from "../../components/startup-details-input/StartupStepper";

type StartupLead = {
  id: number;
  user_id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  company_name: string | null;
  company_website: string | null;
  profile: string | null;
  industry: string | null;
  current_arr: string | null;
  looking_to_raise: string | null;
  pre_money_valuation: string | null;
  funding_status: string | null;
  previous_funding_amount: string | null;
  referral_source: string | null;
  form_submitted: boolean;
  linkedin: string | null;
  city: string | null;
  designation: string | null;
  deck_url: string | null;
  additional_notes: string | null;
  has_commitment: boolean | null;
  created_at?: string | null;
};

export default function StartupDetailsPage() {
  const [loading, setLoading] = useState(true);
  const [lead, setLead] = useState<StartupLead | null>(null);
  const [showStepper, setShowStepper] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchLead = async () => {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data } = await supabase
        .from("startup_leads")
        .select("*")
        .eq("user_id", user.id)
        .single();

      setLead(data as StartupLead | null);
      setLoading(false);
    };

    fetchLead();
  }, [router]);

  // ✅ Always keep dark background on whole page
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-gray-400">
        Loading...
      </div>
    );
  }

  // ✅ No lead yet → show message
  if (!lead && !showStepper) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-8">
        <Card className="bg-gray-800 text-gray-200 max-w-3xl w-full">
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Startup Details</h1>
            <p className="text-gray-400 mb-6">
              You have not submitted your startup details yet! <br />
              Submit to let us get to know you better!
            </p>
            <Button
              onClick={() => setShowStepper(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Submit Startup Details
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ✅ Show stepper
  if (showStepper) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <StartupStepper />
      </div>
    );
  }

  // ✅ Safe to assert lead is non-null now
  const safeLead = lead!;

  return (
    <div className="min-h-screen bg-gray-900 p-6 font-[SUSE] text-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Startup Details</h1>

        <Card className="bg-gray-800 text-gray-200">
          <CardContent className="p-6 relative">
            <button
              onClick={() => setShowStepper(true)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <FiEdit2 size={20} />
            </button>

            {Object.entries({
              "Full Name": safeLead.full_name,
              Email: safeLead.email,
              Phone: safeLead.phone,
              LinkedIn: safeLead.linkedin,
              City: safeLead.city,
              Designation: safeLead.designation,
              "Company Name": safeLead.company_name,
              "Company Website": safeLead.company_website,
              Profile: safeLead.profile,
              Industry: safeLead.industry,
              ARR: safeLead.current_arr,
              "Looking to Raise": safeLead.looking_to_raise,
              "Pre-Money Valuation": safeLead.pre_money_valuation,
              "Funding Status": safeLead.funding_status,
              "Previous Funding Amount": safeLead.previous_funding_amount,
              "Referral Source": safeLead.referral_source,
              Notes: safeLead.additional_notes,
              Commitment: safeLead.has_commitment ? "Yes" : "No",
            }).map(([label, value]) => (
              <p key={label} className="mb-2">
                <span className="font-semibold">{label}:</span> {value || "-"}
              </p>
            ))}

            <p className="mb-2">
              <span className="font-semibold">Deck:</span>{" "}
              {safeLead.deck_url ? (
                <a
                  href={safeLead.deck_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400"
                >
                  View Deck
                </a>
              ) : (
                "No deck uploaded"
              )}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
