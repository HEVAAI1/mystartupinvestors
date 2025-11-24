"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import AuthenticatedNavbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import { useRouter } from "next/navigation";

const COLORS = {
  bg: "#FAF7EE",
  text: "#31372B",
  muted: "#717182",
  card: "#FFFFFF",
  input: "#F3F3F5",
};

type PersonalInfo = {
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  city: string;
};

type BusinessInfo = {
  companyName: string;
  designation: string;
  companyWebsite: string;
  profile: string;
  industry: string;
  currentArr: string;
  lookingToRaise: string;
  preMoneyValuation: string;
  fundingStatus: string;
  previousFundingAmount: string;
};

type OtherInfo = {
  referralSource: string;
  additionalNotes: string;
  deckFile: File | null;
};

type FormState = {
  personal: PersonalInfo;
  business: BusinessInfo;
  other: OtherInfo;
};

const STEPS = ["Personal Details", "Startup Details", "Additional Information"];

function StepShell({
  stepIndex,
  children,
}: {
  stepIndex: number;
  children: React.ReactNode;
}) {
  const pct = Math.round(((stepIndex + 1) / STEPS.length) * 100);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundColor: COLORS.bg,
        color: COLORS.text,
        fontFamily: "Arial, ui-sans-serif",
      }}
    >
      <AuthenticatedNavbar />

      <main className="flex-1">
        <div className="mx-auto max-w-[768px] px-6 py-10 md:py-16">
          <button className="mb-6 flex items-center gap-2 text-sm hover:underline">
            <ArrowLeft size={16} />
            <span style={{ color: COLORS.text }}>Back to Dashboard</span>
          </button>

          <h1 className="text-[40px] leading-[60px] font-bold -tracking-[1px]">
            Add Your Startup Details
          </h1>
          <p className="mt-1 text-[16px]" style={{ color: COLORS.muted }}>
            Let&apos;s get to know you better!
          </p>

          <div
            className="mt-8 mb-2 flex items-center justify-between text-[16px]"
            style={{ color: COLORS.muted }}
          >
            <span>
              Step {stepIndex + 1} of {STEPS.length}
            </span>
            <span>{pct}% Complete</span>
          </div>
          <div
            className="h-2 w-full rounded-full overflow-hidden"
            style={{ background: "#31372B33" }}
          >
            <div
              className="h-full"
              style={{ width: `${pct}%`, background: COLORS.text }}
            />
          </div>

          <div className="mt-8 rounded-xl border border-[#31372B1F] bg-white shadow-sm">
            {children}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function StepPersonal({
  value,
  onNext,
}: {
  value: PersonalInfo;
  onNext: (v: PersonalInfo) => void;
}) {
  const [form, setForm] = useState<PersonalInfo>(value);

  const update = (name: keyof PersonalInfo, val: string) =>
    setForm((p) => ({ ...p, [name]: val }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(form);
  };

  return (
    <form onSubmit={submit} className="p-8">
      <h2 className="text-[28px] font-bold mb-10">Your Personal Details</h2>

      <div className="flex flex-col gap-2 mb-6">
        <label className="text-[14px]">Name *</label>
        <input
          className="rounded-md px-3 py-2 text-[14px] outline-none"
          style={{ background: COLORS.input, color: COLORS.muted }}
          placeholder="John Doe"
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          required
        />
      </div>

      <div className="flex flex-col gap-2 mb-6">
        <label className="text-[14px]">Email *</label>
        <input
          type="email"
          className="rounded-md px-3 py-2 text-[14px] outline-none"
          style={{ background: COLORS.input, color: COLORS.muted }}
          placeholder="john@startup.com"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          required
        />
      </div>

      <div className="flex flex-col gap-2 mb-6">
        <label className="text-[14px]">Phone Number *</label>
        <input
          type="tel"
          className="rounded-md px-3 py-2 text-[14px] outline-none"
          style={{ background: COLORS.input, color: COLORS.muted }}
          placeholder="+91 98765 43210"
          value={form.phone}
          onChange={(e) => update("phone", e.target.value)}
          required
        />
      </div>

      <div className="flex flex-col gap-2 mb-6">
        <label className="text-[14px]">LinkedIn URL *</label>
        <input
          type="url"
          className="rounded-md px-3 py-2 text-[14px] outline-none"
          style={{ background: COLORS.input, color: COLORS.muted }}
          placeholder="https://linkedin.com/in/yourprofile"
          value={form.linkedin}
          onChange={(e) => update("linkedin", e.target.value)}
          required
        />
      </div>

      <div className="flex flex-col gap-2 mb-6">
        <label className="text-[14px]">City You Live In *</label>
        <input
          className="rounded-md px-3 py-2 text-[14px] outline-none"
          style={{ background: COLORS.input, color: COLORS.muted }}
          placeholder="Bangalore"
          value={form.city}
          onChange={(e) => update("city", e.target.value)}
          required
        />
      </div>

      <div className="mt-8 border-t border-[#31372B1F] pt-6">
        <button
          type="submit"
          className="w-full inline-flex items-center justify-center gap-2 rounded-md py-2 text-[14px] text-[#FAF7EE] hover:opacity-90 transition"
          style={{ background: COLORS.text }}
        >
          Next
          <ArrowRight size={16} />
        </button>
      </div>
    </form>
  );
}

function StepBusiness({
  value,
  onNext,
  onBack,
}: {
  value: BusinessInfo;
  onNext: (v: BusinessInfo) => void;
  onBack: () => void;
}) {
  const [form, setForm] = useState<BusinessInfo>(value);

  const update = (name: keyof BusinessInfo, val: string) =>
    setForm((p) => ({ ...p, [name]: val }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(form);
  };

  return (
    <form onSubmit={submit} className="p-8">
      <h2 className="text-[28px] font-bold mb-10">Startup Details</h2>

      <div className="flex flex-col gap-2 mb-6">
        <label className="text-[14px]">Company Name *</label>
        <input
          required
          className="rounded-md px-3 py-2 text-[14px] outline-none"
          style={{ background: COLORS.input, color: COLORS.muted }}
          placeholder="Your Startup Inc."
          value={form.companyName}
          onChange={(e) => update("companyName", e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2 mb-6">
        <label className="text-[14px]">Designation *</label>
        <input
          required
          className="rounded-md px-3 py-2 text-[14px] outline-none"
          style={{ background: COLORS.input, color: COLORS.muted }}
          placeholder="Founder & CEO"
          value={form.designation}
          onChange={(e) => update("designation", e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2 mb-6">
        <label className="text-[14px]">Company URL *</label>
        <input
          type="url"
          required
          className="rounded-md px-3 py-2 text-[14px] outline-none"
          style={{ background: COLORS.input, color: COLORS.muted }}
          placeholder="https://yourstartup.com"
          value={form.companyWebsite}
          onChange={(e) => update("companyWebsite", e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2 mb-6">
        <label className="text-[14px]">What is your Profile? *</label>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="profile"
              value="B2B Founder"
              checked={form.profile === "B2B Founder"}
              onChange={(e) => update("profile", e.target.value)}
              required
            />
            <span className="text-[14px]">B2B Founder</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="profile"
              value="B2C Founder"
              checked={form.profile === "B2C Founder"}
              onChange={(e) => update("profile", e.target.value)}
              required
            />
            <span className="text-[14px]">B2C Founder</span>
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-2 mb-6">
        <label className="text-[14px]">Which Industry you operate in? *</label>
        <input
          required
          className="rounded-md px-3 py-2 text-[14px] outline-none"
          style={{ background: COLORS.input, color: COLORS.muted }}
          placeholder="e.g., Fintech, HealthTech, EdTech"
          value={form.industry}
          onChange={(e) => update("industry", e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2 mb-6">
        <label className="text-[14px]">What is your current ARR? *</label>
        <select
          required
          className="rounded-md px-3 py-2 text-[14px] outline-none"
          style={{ background: COLORS.input, color: COLORS.muted }}
          value={form.currentArr}
          onChange={(e) => update("currentArr", e.target.value)}
        >
          <option value="">Select ARR range</option>
          <option value="Yet to Generate Revenue">Yet to Generate Revenue</option>
          <option value="<$10000">&lt;$10,000</option>
          <option value="$10000 - $50000">$10,000 - $50,000</option>
          <option value="$50000 - $100000">$50,000 - $100,000</option>
          <option value="$100000 - $1Million">$100,000 - $1 Million</option>
          <option value="$1 Million+">$1 Million+</option>
        </select>
      </div>

      <div className="flex flex-col gap-2 mb-6">
        <label className="text-[14px]">Are you looking to raise Funds? *</label>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="lookingToRaise"
              value="Yes - Equity Raise"
              checked={form.lookingToRaise === "Yes - Equity Raise"}
              onChange={(e) => update("lookingToRaise", e.target.value)}
              required
            />
            <span className="text-[14px]">Yes - Equity Raise</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="lookingToRaise"
              value="Yes - Equity + Debt Raise"
              checked={form.lookingToRaise === "Yes - Equity + Debt Raise"}
              onChange={(e) => update("lookingToRaise", e.target.value)}
              required
            />
            <span className="text-[14px]">Yes - Equity + Debt Raise</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="lookingToRaise"
              value="Yes - Debt Only"
              checked={form.lookingToRaise === "Yes - Debt Only"}
              onChange={(e) => update("lookingToRaise", e.target.value)}
              required
            />
            <span className="text-[14px]">Yes - Debt Only</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="lookingToRaise"
              value="Not looking to raise now"
              checked={form.lookingToRaise === "Not looking to raise now"}
              onChange={(e) => update("lookingToRaise", e.target.value)}
              required
            />
            <span className="text-[14px]">Not looking to raise now</span>
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-2 mb-6">
        <label className="text-[14px]">What is your Pre-Money Valuation? *</label>
        <input
          required
          className="rounded-md px-3 py-2 text-[14px] outline-none"
          style={{ background: COLORS.input, color: COLORS.muted }}
          placeholder="e.g., $5 Million"
          value={form.preMoneyValuation}
          onChange={(e) => update("preMoneyValuation", e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2 mb-6">
        <label className="text-[14px]">What is your current Funding Status? *</label>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="fundingStatus"
              value="Bootstrapped"
              checked={form.fundingStatus === "Bootstrapped"}
              onChange={(e) => update("fundingStatus", e.target.value)}
              required
            />
            <span className="text-[14px]">Bootstrapped</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="fundingStatus"
              value="Pre-Seed Funded (<$250K)"
              checked={form.fundingStatus === "Pre-Seed Funded (<$250K)"}
              onChange={(e) => update("fundingStatus", e.target.value)}
              required
            />
            <span className="text-[14px]">Pre-Seed Funded (&lt;$250K)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="fundingStatus"
              value="Seed Funded ($250K - $1Million)"
              checked={form.fundingStatus === "Seed Funded ($250K - $1Million)"}
              onChange={(e) => update("fundingStatus", e.target.value)}
              required
            />
            <span className="text-[14px]">Seed Funded ($250K - $1 Million)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="fundingStatus"
              value="Seed Funded ($1Million - $2million)"
              checked={form.fundingStatus === "Seed Funded ($1Million - $2million)"}
              onChange={(e) => update("fundingStatus", e.target.value)}
              required
            />
            <span className="text-[14px]">Seed Funded ($1 Million - $2 Million)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="fundingStatus"
              value="Series A"
              checked={form.fundingStatus === "Series A"}
              onChange={(e) => update("fundingStatus", e.target.value)}
              required
            />
            <span className="text-[14px]">Series A</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="fundingStatus"
              value="Series B"
              checked={form.fundingStatus === "Series B"}
              onChange={(e) => update("fundingStatus", e.target.value)}
              required
            />
            <span className="text-[14px]">Series B</span>
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-2 mb-8">
        <label className="text-[14px]">If you have raised funding: *</label>
        <input
          required
          className="rounded-md px-3 py-2 text-[14px] outline-none"
          style={{ background: COLORS.input, color: COLORS.muted }}
          placeholder="e.g., $500K from Angel Investors"
          value={form.previousFundingAmount}
          onChange={(e) => update("previousFundingAmount", e.target.value)}
        />
      </div>

      <div className="mt-8 border-t border-[#31372B1F] pt-6 flex gap-4">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 rounded-md py-2 border border-[#31372B1F] text-[14px]"
          style={{ background: COLORS.bg, color: COLORS.text }}
        >
          <span className="inline-flex items-center gap-2">
            <ArrowLeft size={16} /> Back
          </span>
        </button>

        <button
          type="submit"
          className="flex-1 rounded-md py-2 text-[14px] text-[#FAF7EE] inline-flex items-center justify-center gap-2 hover:opacity-90 transition"
          style={{ background: COLORS.text }}
        >
          Next
          <ArrowRight size={16} />
        </button>
      </div>
    </form>
  );
}

function StepOther({
  value,
  onBack,
  onSubmit,
}: {
  value: OtherInfo;
  onBack: () => void;
  onSubmit: (v: OtherInfo) => void;
}) {
  const [form, setForm] = useState<OtherInfo>(value);

  const update = (name: keyof OtherInfo, val: string | File | null) =>
    setForm((p) => ({ ...p, [name]: val }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="p-8">
      <h2 className="text-[28px] font-bold mb-10">Additional Information</h2>

      <div className="flex flex-col gap-2 mb-6">
        <label className="text-[14px]">How did you hear about us? *</label>
        <div className="flex flex-col gap-2">
          {[
            "Linkedin",
            "Twitter",
            "Our Website",
            "Whatsapp communities",
            "Refer by a Friend",
            "Discord Communities",
            "Slack Communities",
            "Email",
            "Others",
          ].map((option) => (
            <label key={option} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="referralSource"
                value={option}
                checked={form.referralSource === option}
                onChange={(e) => update("referralSource", e.target.value)}
                required
              />
              <span className="text-[14px]">{option}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2 mb-6">
        <label className="text-[14px]">Anything you would like to add? *</label>
        <textarea
          required
          rows={4}
          className="rounded-md px-3 py-2 text-[14px] outline-none resize-none"
          style={{ background: COLORS.input, color: COLORS.muted }}
          placeholder="Any additional information you'd like to share..."
          value={form.additionalNotes}
          onChange={(e) => update("additionalNotes", e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2 mb-2">
        <label className="text-[14px]">Deck Upload (Optional)</label>
        <input
          type="file"
          accept=".pdf,.ppt,.pptx"
          className="rounded-md px-3 py-2 text-[14px] outline-none cursor-pointer file:cursor-pointer file:mr-3 file:px-3 file:py-1 file:rounded-md file:border-none file:bg-[#E5E5E8] file:text-[#31372B]"
          style={{ background: COLORS.input, color: COLORS.muted }}
          onChange={(e) => update("deckFile", e.target.files?.[0] ?? null)}
        />
      </div>
      <p className="text-[14px] mb-8" style={{ color: COLORS.muted }}>
        PDF or PPT format, max 10MB
      </p>

      <div className="mt-8 border-t border-[#31372B1F] pt-6 flex gap-4">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 rounded-md py-2 border border-[#31372B1F] text-[14px]"
          style={{ background: COLORS.bg, color: COLORS.text }}
        >
          <span className="inline-flex items-center gap-2">
            <ArrowLeft size={16} /> Back
          </span>
        </button>

        <button
          type="submit"
          className="flex-1 rounded-md py-2 text-[14px] text-[#FAF7EE] inline-flex items-center justify-center gap-2 hover:opacity-90 transition"
          style={{ background: COLORS.text }}
        >
          <Check size={16} /> Submit
        </button>
      </div>
    </form>
  );
}

export default function StartupWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [state, setState] = useState<FormState>({
    personal: { name: "", email: "", phone: "", linkedin: "", city: "" },
    business: {
      companyName: "",
      designation: "",
      companyWebsite: "",
      profile: "",
      industry: "",
      currentArr: "",
      lookingToRaise: "",
      preMoneyValuation: "",
      fundingStatus: "",
      previousFundingAmount: "",
    },
    other: { referralSource: "", additionalNotes: "", deckFile: null },
  });

  const handleSubmit = async (other: OtherInfo) => {
    console.log("=== FORM SUBMISSION STARTED ===");
    console.log("Other info received:", other);

    setState((s) => ({ ...s, other }));
    setSubmitting(true);

    try {
      console.log("Creating Supabase browser client...");
      const supabase = createSupabaseBrowserClient();

      console.log("Attempting to get user from Supabase...");

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      console.log("Supabase auth response:", { user, userError });
      console.log("User object:", user);
      console.log("User ID:", user?.id);
      console.log("User email:", user?.email);

      if (userError) {
        console.error("Error getting user:", userError);
        alert("Authentication error. Please try logging in again.");
        return;
      }

      if (!user) {
        console.error("No user found in session");
        console.log("Attempting to check session...");
        const { data: sessionData } = await supabase.auth.getSession();
        console.log("Session data:", sessionData);
        alert("You must be logged in to submit the form");
        return;
      }

      console.log("User authenticated successfully:", user.id);

      // Upload deck if provided
      let deckUrl = null;
      if (other.deckFile) {
        console.log("Uploading deck file:", other.deckFile.name);
        const fileName = `${user.id}/${Date.now()}_${other.deckFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("startup-decks")
          .upload(fileName, other.deckFile);

        if (uploadError) {
          console.error("Deck upload error:", uploadError);
        } else {
          console.log("Deck uploaded successfully:", uploadData);
          const { data: { publicUrl } } = supabase.storage
            .from("startup-decks")
            .getPublicUrl(fileName);
          deckUrl = publicUrl;
          console.log("Deck public URL:", deckUrl);
        }
      }

      console.log("Preparing to insert startup lead data...");
      const insertData = {
        user_id: user.id,
        full_name: state.personal.name,
        email: state.personal.email,
        phone: state.personal.phone,
        linkedin: state.personal.linkedin,
        city: state.personal.city,
        company_name: state.business.companyName,
        designation: state.business.designation,
        company_website: state.business.companyWebsite,
        profile: state.business.profile,
        industry: state.business.industry,
        current_arr: state.business.currentArr,
        looking_to_raise: state.business.lookingToRaise,
        pre_money_valuation: state.business.preMoneyValuation,
        funding_status: state.business.fundingStatus,
        previous_funding_amount: state.business.previousFundingAmount,
        referral_source: other.referralSource,
        additional_notes: other.additionalNotes,
        deck_url: deckUrl,
        form_submitted: true,
      };

      console.log("Insert data:", insertData);

      // Insert into startup_leads
      const { error: insertError } = await supabase.from("startup_leads").insert(insertData);

      if (insertError) {
        console.error("Insert error:", insertError);
        console.error("Insert error details:", JSON.stringify(insertError, null, 2));
        alert("Error submitting form. Please try again.");
        return;
      }

      console.log("Startup lead inserted successfully");

      // Update user's startup_form_submitted flag
      console.log("Updating user startup_form_submitted flag...");
      const { error: updateError } = await supabase
        .from("users")
        .update({ startup_form_submitted: true })
        .eq("id", user.id);

      if (updateError) {
        console.error("Error updating user flag:", updateError);
      } else {
        console.log("User flag updated successfully");
      }

      console.log("=== FORM SUBMISSION COMPLETED SUCCESSFULLY ===");
      alert("Form submitted successfully!");
      router.push("/dashboard");
    } catch (err) {
      console.error("=== SUBMISSION ERROR ===");
      console.error("Submission error:", err);
      console.error("Error stack:", err instanceof Error ? err.stack : "No stack trace");
      alert("An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
      console.log("Submission process ended, submitting set to false");
    }
  };

  return (
    <StepShell stepIndex={step}>
      {step === 0 && (
        <StepPersonal
          value={state.personal}
          onNext={(personal) => {
            setState((s) => ({ ...s, personal }));
            setStep(1);
          }}
        />
      )}
      {step === 1 && (
        <StepBusiness
          value={state.business}
          onNext={(business) => {
            setState((s) => ({ ...s, business }));
            setStep(2);
          }}
          onBack={() => setStep(0)}
        />
      )}
      {step === 2 && (
        <StepOther
          value={state.other}
          onBack={() => setStep(1)}
          onSubmit={handleSubmit}
        />
      )}
      {submitting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <p>Submitting your form...</p>
          </div>
        </div>
      )}
    </StepShell>
  );
}
