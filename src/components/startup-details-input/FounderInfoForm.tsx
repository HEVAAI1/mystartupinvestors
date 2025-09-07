"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type FounderInfoProps = {
  data: {
    full_name?: string;
    email?: string;
    phone?: string;
    linkedin?: string;
    city?: string;
    designation?: string;
  };
  onNext: (updatedData: FounderInfoProps["data"]) => void;
};

export default function FounderInfoForm({ data, onNext }: FounderInfoProps) {
  const [form, setForm] = useState<FounderInfoProps["data"]>(data);

  const handleInputChange = (
    name: keyof FounderInfoProps["data"],
    value: string
  ) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    onNext(form);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-gray-800 text-white rounded-md shadow-md font-['Noto_Sans']">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Tell Us About Yourself
      </h1>
      <p className="text-gray-400 mb-6 text-center">
        Let&apos;s get to know the person behind the vision.
      </p>

      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          handleNext();
        }}
      >
        <div>
          <Label htmlFor="full_name" className="mb-2 block">
            What&apos;s your full name?
          </Label>
          <Input
            id="full_name"
            placeholder="e.g., Jane Doe"
            value={form.full_name ?? ""}
            onChange={(e) => handleInputChange("full_name", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="email" className="mb-2 block">
            Your email address:
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={form.email ?? ""}
            onChange={(e) => handleInputChange("email", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="phone" className="mb-2 block">
            Best phone number to reach you:
          </Label>
          <Input
            id="phone"
            placeholder="+1 (555) 123-4567"
            value={form.phone ?? ""}
            onChange={(e) => handleInputChange("phone", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="linkedin" className="mb-2 block">
            Your LinkedIn profile URL:
          </Label>
          <Input
            id="linkedin"
            type="url"
            placeholder="linkedin.com/in/yourprofile"
            value={form.linkedin ?? ""}
            onChange={(e) => handleInputChange("linkedin", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="city" className="mb-2 block">
            Which city are you based in?
          </Label>
          <Input
            id="city"
            placeholder="e.g., San Francisco"
            value={form.city ?? ""}
            onChange={(e) => handleInputChange("city", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="designation" className="mb-2 block">
            What&apos;s your role/designation at the startup?
          </Label>
          <Input
            id="designation"
            placeholder="e.g., CEO, Co-founder, CTO"
            value={form.designation ?? ""}
            onChange={(e) => handleInputChange("designation", e.target.value)}
          />
        </div>

        <div className="flex justify-end mt-6">
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
            Next Step →
          </Button>
        </div>
      </form>
    </div>
  );
}
