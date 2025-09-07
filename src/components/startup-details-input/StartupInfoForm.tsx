"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type StartupInfoProps = {
  data: {
    company_name?: string;
    company_website?: string;
    profile?: string;
    industry?: string;
    current_arr?: string;
    looking_to_raise?: string;
    pre_money_valuation?: string;
    funding_status?: string;
    previous_funding_amount?: string;
  };
  onNext: (updatedData: StartupInfoProps["data"]) => void;
  onBack: () => void;
};

const ARR_OPTIONS = ["$0 - $500K", "$500K - $1M", "$1M - $5M", "$5M+"];
const FUNDING_STATUS_OPTIONS = [
  "Bootstrapped",
  "Pre-Seed",
  "Seed",
  "Series A",
  "Series B+",
];

export default function StartupInfoForm({ data, onNext, onBack }: StartupInfoProps) {
  const [form, setForm] = useState<StartupInfoProps["data"]>(data);

  const handleInputChange = (name: keyof StartupInfoProps["data"], value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    onNext(form);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gray-800 text-white rounded-md shadow-md font-['Noto_Sans']">
      <h1 className="text-2xl font-bold mb-2 text-center">Tell us about your startup</h1>
      <p className="text-gray-400 mb-6 text-center">
        Let&apos;s get to know your business.
      </p>

      <form
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        onSubmit={(e) => {
          e.preventDefault();
          handleNext();
        }}
      >
        {/* Company Name */}
        <div>
          <Label htmlFor="company_name" className="mb-2 block">Company Name</Label>
          <Input
            id="company_name"
            placeholder="e.g., Acme Corporation"
            value={form.company_name ?? ""}
            onChange={(e) => handleInputChange("company_name", e.target.value)}
          />
        </div>

        {/* Company Website */}
        <div>
          <Label htmlFor="company_website" className="mb-2 block">Company Website</Label>
          <Input
            id="company_website"
            type="url"
            placeholder="https://acme.com"
            value={form.company_website ?? ""}
            onChange={(e) => handleInputChange("company_website", e.target.value)}
          />
        </div>

        {/* Profile */}
        <div className="col-span-2">
          <Label className="mb-2 block">Profile</Label>
          <RadioGroup
            value={form.profile ?? ""}
            onValueChange={(val) => handleInputChange("profile", val)}
            className="flex space-x-6 mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="B2B Founder" id="b2b" />
              <Label htmlFor="b2b">B2B Founder</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="B2C Founder" id="b2c" />
              <Label htmlFor="b2c">B2C Founder</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Industry */}
        <div>
          <Label htmlFor="industry" className="mb-2 block">Industry</Label>
          <Input
            id="industry"
            placeholder="e.g., SaaS, E-commerce"
            value={form.industry ?? ""}
            onChange={(e) => handleInputChange("industry", e.target.value)}
          />
        </div>

        {/* ARR */}
        <div>
          <Label className="mb-2 block">Funding Details (ARR)</Label>
          <Select
            value={form.current_arr ?? ""}
            onValueChange={(val) => handleInputChange("current_arr", val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select funding details" />
            </SelectTrigger>
            <SelectContent>
              {ARR_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Looking to Raise */}
        <div className="col-span-2">
          <Label className="mb-2 block">Looking to Raise</Label>
          <RadioGroup
            value={form.looking_to_raise ?? ""}
            onValueChange={(val) => handleInputChange("looking_to_raise", val)}
            className="flex flex-wrap gap-6 mt-2"
          >
            {ARR_OPTIONS.map((opt) => (
              <div key={opt} className="flex items-center space-x-2">
                <RadioGroupItem value={opt} id={opt} />
                <Label htmlFor={opt}>{opt}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Pre-Money Valuation */}
        <div>
          <Label htmlFor="pre_money_valuation" className="mb-2 block">Pre-Money Valuation (USD)</Label>
          <Input
            id="pre_money_valuation"
            placeholder="Enter amount"
            value={form.pre_money_valuation ?? ""}
            onChange={(e) => handleInputChange("pre_money_valuation", e.target.value)}
          />
        </div>

        {/* Funding Status */}
        <div>
          <Label className="mb-2 block">Funding Status</Label>
          <Select
            value={form.funding_status ?? ""}
            onValueChange={(val) => handleInputChange("funding_status", val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select funding status" />
            </SelectTrigger>
            <SelectContent>
              {FUNDING_STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Previous Funding */}
        <div className="col-span-2">
          <Label htmlFor="previous_funding_amount" className="mb-2 block">
            Previous Funding Amount (USD)
          </Label>
          <Input
            id="previous_funding_amount"
            placeholder="Enter amount"
            value={form.previous_funding_amount ?? ""}
            onChange={(e) => handleInputChange("previous_funding_amount", e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="col-span-2 flex justify-between mt-8">
          <Button type="button" variant="secondary" onClick={onBack}>
            ← Back
          </Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
            Next →
          </Button>
        </div>
      </form>
    </div>
  );
}
