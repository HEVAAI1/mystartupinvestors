"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import AuthenticatedNavbar from "@/components/Navbar"; // ✅ your existing navbar
import Footer from "@/components/Footer"; // ✅ your existing footer

// ────────────────────────────────────────────────────────────────────────────
// Design tokens (from Figma)
// ────────────────────────────────────────────────────────────────────────────
const COLORS = {
  bg: "#FAF7EE",
  text: "#31372B",
  muted: "#717182",
  card: "#FFFFFF",
  input: "#F3F3F5",
};

type PersonalInfo = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  linkedin?: string;
};

type BusinessInfo = {
  companyName?: string;
  website?: string;
  industry?: string;
  stage?: string;
  fundingGoal?: string;
  teamSize?: string;
  description?: string;
};

type OtherInfo = {
  deckFile?: File | null;
  referralSource?: string;
  notes?: string;
};

type FormState = {
  personal: PersonalInfo;
  business: BusinessInfo;
  other: OtherInfo;
};

const STEPS = ["Personal Information", "Business Information", "Other Details"];

// ────────────────────────────────────────────────────────────────────────────
// Step Shell – wraps each step (navbar + progress + footer)
// ────────────────────────────────────────────────────────────────────────────
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
      {/* ✅ Use the imported navbar */}
      <AuthenticatedNavbar />

      {/* Content */}
      <main className="flex-1">
        <div className="mx-auto max-w-[768px] px-6 py-10 md:py-16">
          {/* Back link */}
          <button className="mb-6 flex items-center gap-2 text-sm hover:underline">
            <ArrowLeft size={16} />
            <span style={{ color: COLORS.text }}>Back to Dashboard</span>
          </button>

          {/* Page heading */}
          <h1 className="text-[40px] leading-[60px] font-bold -tracking-[1px]">
            Add Your Startup Details
          </h1>
          <p className="mt-1 text-[16px]" style={{ color: COLORS.muted }}>
            Let&apos;s get to know you better!
          </p>

          {/* Progress */}
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

          {/* Card */}
          <div className="mt-8 rounded-xl border border-[#31372B1F] bg-white shadow-sm">
            {children}
          </div>
        </div>
      </main>

      {/* ✅ Use your global Footer component */}
      <Footer />
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Step 1 – Personal Information
// ────────────────────────────────────────────────────────────────────────────
function StepPersonal({
  value,
  onNext,
}: {
  value: PersonalInfo;
  onNext: (v: PersonalInfo) => void;
}) {
  const [form, setForm] = useState<PersonalInfo>({
    firstName: value.firstName ?? "",
    lastName: value.lastName ?? "",
    email: value.email ?? "",
    phone: value.phone ?? "",
    linkedin: value.linkedin ?? "",
  });

  const update = (name: keyof PersonalInfo, val: string) =>
    setForm((p) => ({ ...p, [name]: val }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(form);
  };

  return (
    <form onSubmit={submit} className="p-8">
      <h2 className="text-[28px] font-bold mb-10">Personal Information</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-[14px]">First Name *</label>
          <input
            className="rounded-md px-3 py-2 text-[14px] outline-none"
            style={{ background: COLORS.input, color: COLORS.muted }}
            placeholder="John"
            value={form.firstName}
            onChange={(e) => update("firstName", e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[14px]">Last Name *</label>
          <input
            className="rounded-md px-3 py-2 text-[14px] outline-none"
            style={{ background: COLORS.input, color: COLORS.muted }}
            placeholder="Doe"
            value={form.lastName}
            onChange={(e) => update("lastName", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-2">
        <label className="text-[14px]">Email Address *</label>
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

      <div className="mt-6 flex flex-col gap-2">
        <label className="text-[14px]">Phone Number *</label>
        <input
          className="rounded-md px-3 py-2 text-[14px] outline-none"
          style={{ background: COLORS.input, color: COLORS.muted }}
          placeholder="+91 98765 43210"
          value={form.phone}
          onChange={(e) => update("phone", e.target.value)}
          required
        />
      </div>

      <div className="mt-6 flex flex-col gap-2">
        <label className="text-[14px]">LinkedIn Profile</label>
        <input
          className="rounded-md px-3 py-2 text-[14px] outline-none"
          style={{ background: COLORS.input, color: COLORS.muted }}
          placeholder="linkedin.com/in/yourprofile"
          value={form.linkedin}
          onChange={(e) => update("linkedin", e.target.value)}
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

// ────────────────────────────────────────────────────────────────────────────
// Placeholder Steps (to be built next)
// ────────────────────────────────────────────────────────────────────────────
function StepBusiness({
  value,
  onNext,
  onBack,
}: {
  value: BusinessInfo;
  onNext: (v: BusinessInfo) => void;
  onBack: () => void;
}) {
  const [form, setForm] = useState<BusinessInfo>({
    companyName: value.companyName ?? "",
    website: value.website ?? "",
    industry: value.industry ?? "",
    stage: value.stage ?? "",
    fundingGoal: value.fundingGoal ?? "",
    teamSize: value.teamSize ?? "",
    description: value.description ?? "",
  });

  const update = (name: keyof BusinessInfo, val: string) =>
    setForm((p) => ({ ...p, [name]: val }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(form);
  };

  const industries = [
    "Fintech",
    "HealthTech",
    "EdTech",
    "E-commerce",
    "AI/ML",
    "SaaS",
    "Other",
  ];
  const stages = ["Idea", "MVP", "Early Revenue", "Growth", "Series A+"];

  return (
    <form onSubmit={submit} className="p-8">
      <h2 className="text-[28px] font-bold mb-10">Business Information</h2>

      {/* Company Name */}
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

      {/* Website */}
      <div className="flex flex-col gap-2 mb-6">
        <label className="text-[14px]">Website</label>
        <input
          type="url"
          className="rounded-md px-3 py-2 text-[14px] outline-none"
          style={{ background: COLORS.input, color: COLORS.muted }}
          placeholder="https://yourstartup.com"
          value={form.website}
          onChange={(e) => update("website", e.target.value)}
        />
      </div>

      {/* Industry + Stage */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="flex flex-col gap-2">
          <label className="text-[14px]">Industry *</label>
          <select
            required
            className="rounded-md px-3 py-2 text-[14px] outline-none"
            style={{ background: COLORS.input, color: COLORS.muted }}
            value={form.industry}
            onChange={(e) => update("industry", e.target.value)}
          >
            <option value="">Select industry</option>
            {industries.map((ind) => (
              <option key={ind} value={ind}>
                {ind}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[14px]">Current Stage *</label>
          <select
            required
            className="rounded-md px-3 py-2 text-[14px] outline-none"
            style={{ background: COLORS.input, color: COLORS.muted }}
            value={form.stage}
            onChange={(e) => update("stage", e.target.value)}
          >
            <option value="">Select stage</option>
            {stages.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Funding Goal + Team Size */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="flex flex-col gap-2">
          <label className="text-[14px]">Funding Goal *</label>
          <input
            required
            className="rounded-md px-3 py-2 text-[14px] outline-none"
            style={{ background: COLORS.input, color: COLORS.muted }}
            placeholder="$500,000"
            value={form.fundingGoal}
            onChange={(e) => update("fundingGoal", e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[14px]">Team Size *</label>
          <input
            type="number"
            min="1"
            required
            className="rounded-md px-3 py-2 text-[14px] outline-none"
            style={{ background: COLORS.input, color: COLORS.muted }}
            placeholder="5"
            value={form.teamSize}
            onChange={(e) => update("teamSize", e.target.value)}
          />
        </div>
      </div>

      {/* Description */}
      <div className="flex flex-col gap-2 mb-8">
        <label className="text-[14px]">Business Description *</label>
        <textarea
          required
          rows={3}
          className="rounded-md px-3 py-2 text-[14px] outline-none resize-none"
          style={{ background: COLORS.input, color: COLORS.muted }}
          placeholder="Describe what your startup does..."
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
        />
      </div>

      {/* Navigation Buttons */}
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
  const [form, setForm] = useState<OtherInfo>({
    deckFile: value.deckFile ?? null,
    referralSource: value.referralSource ?? "",
    notes: value.notes ?? "",
  });

  const update = (name: keyof OtherInfo, val: any) =>
    setForm((p) => ({ ...p, [name]: val }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  const referralOptions = [
    "LinkedIn",
    "Twitter / X",
    "Google Search",
    "Friend / Colleague",
    "Event / Demo Day",
    "Other",
  ];

  return (
    <form onSubmit={handleSubmit} className="p-8">
      <h2 className="text-[28px] font-bold mb-10">Other Details</h2>

      {/* Pitch Deck Upload */}
      <div className="flex flex-col gap-2 mb-2">
        <label className="text-[14px]">Upload Pitch Deck (Optional)</label>
        <input
          type="file"
          accept=".pdf,.ppt,.pptx"
          className="rounded-md px-3 py-2 text-[14px] outline-none cursor-pointer file:cursor-pointer file:mr-3 file:px-3 file:py-1 file:rounded-md file:border-none file:bg-[#E5E5E8] file:text-[#31372B]"
          style={{ background: COLORS.input, color: COLORS.muted }}
          onChange={(e) => update("deckFile", e.target.files?.[0] ?? null)}
        />
      </div>
      <p className="text-[14px] mb-6" style={{ color: COLORS.muted }}>
        PDF or PPT format, max 10MB
      </p>

      {/* Referral Source */}
      <div className="flex flex-col gap-2 mb-6">
        <label className="text-[14px]">How did you hear about us?</label>
        <select
          className="rounded-md px-3 py-2 text-[14px] outline-none"
          style={{ background: COLORS.input, color: COLORS.muted }}
          value={form.referralSource}
          onChange={(e) => update("referralSource", e.target.value)}
        >
          <option value="">Select an option</option>
          {referralOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      {/* Additional Notes */}
      <div className="flex flex-col gap-2 mb-8">
        <label className="text-[14px]">
          Is there anything else you want to add?
        </label>
        <textarea
          rows={3}
          className="rounded-md px-3 py-2 text-[14px] outline-none resize-none"
          style={{ background: COLORS.input, color: COLORS.muted }}
          placeholder="Any additional information you'd like to share..."
          value={form.notes}
          onChange={(e) => update("notes", e.target.value)}
        />
      </div>

      {/* Buttons */}
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


// ────────────────────────────────────────────────────────────────────────────
// Root Wizard – mount this on your page (app/add-startup/page.tsx)
// ────────────────────────────────────────────────────────────────────────────
export default function StartupWizard() {
  const [step, setStep] = useState(0);
  const [state, setState] = useState<FormState>({
    personal: { firstName: "", lastName: "", email: "", phone: "", linkedin: "" },
    business: {},
    other: {},
  });

  const handleSubmit = (other: OtherInfo) => {
    setState((s) => ({ ...s, other }));
    console.log("✅ Final submission data:", { ...state, other });
    alert("Form submitted successfully!");
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
    </StepShell>
  );
}


