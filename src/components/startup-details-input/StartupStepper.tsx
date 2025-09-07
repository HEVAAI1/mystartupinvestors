"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import FounderInfoForm from "./FounderInfoForm";
import StartupInfoForm from "./StartupInfoForm";
import OtherDetailsForm from "./OtherInfo";
import { supabase } from "@/lib/supabaseClient";

export default function StartupStepper() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    founder: {},
    startup: {},
    other: {},
  });

  const steps = [
    { title: "Founder Info" },
    { title: "Startup Info" },
    { title: "Other Details" },
  ];

  const handleNext = (data: any) => {
    if (step < steps.length - 1) {
      setFormData((prev) => {
        const newData = { ...prev };
        if (step === 0) newData.founder = data;
        if (step === 1) newData.startup = data;
        return newData;
      });
      setStep(step + 1);
    } else {
      // last step: merge and submit
      const finalData = { ...formData, other: data };
      setFormData(finalData);
      handleSubmit(finalData);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSubmit = async (finalData: any) => {
    try {
      console.log("Submitting full data:", finalData);

      // Example: upload deck
      const deckFile = finalData.other.deckFile;
      let deck_url;
      if (deckFile) {
        const { data: { user } } = await supabase.auth.getUser();
        const fileExt = deckFile.name.split(".").pop();
        const filePath = `decks/${user?.id}-${Date.now()}.${fileExt}`;
        await supabase.storage.from("startup-decks").upload(filePath, deckFile, { upsert: true });
        const { data: publicUrlData } = supabase.storage.from("startup-decks").getPublicUrl(filePath);
        deck_url = publicUrlData?.publicUrl;
      }

      // Prepare payload for Supabase
      const payload = {
        ...finalData.founder,
        ...finalData.startup,
        referral_source: finalData.other.referral_source,
        additional_notes: finalData.other.additional_notes,
        deck_url,
        has_commitment: finalData.other.has_commitment,
        form_submitted: true,
      };

      const { data: insertedData, error } = await supabase.from("startup_leads").insert([payload]).select().single();
      if (error) throw error;

      alert("Startup profile submitted successfully!");
      console.log("Inserted:", insertedData);
    } catch (err) {
      console.error("Submission error:", err);
      alert("Failed to submit startup profile.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 font-[SUSE]">
      {/* Progress bar */}
      <div className="w-full bg-gray-700 rounded-full h-2 mb-8">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all"
          style={{ width: `${((step + 1) / steps.length) * 100}%` }}
        />
      </div>

      {/* Step title */}
      <h2 className="text-center text-xl font-bold text-white mb-6">{steps[step].title}</h2>

      {/* Step forms */}
      {step === 0 && <FounderInfoForm data={formData.founder} onNext={handleNext} />}
      {step === 1 && <StartupInfoForm data={formData.startup} onBack={handleBack} onNext={handleNext} />}
      {step === 2 && <OtherDetailsForm data={formData.other} onBack={handleBack} onSave={handleNext} />}
    </div>
  );
}
