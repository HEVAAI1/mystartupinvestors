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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { UploadCloud } from "lucide-react";

type StartupLead = {
  referral_source?: string;
  deckFile?: File | null;
  additional_notes?: string;
  has_commitment?: boolean;
};

type OtherDetailsProps = {
  data: Partial<StartupLead>;
  onBack: () => void;
  onSave: (data: Partial<StartupLead>) => void;
};

const REFERRAL_SOURCES = ["Friend", "Accelerator", "Investor", "Other"];

export default function OtherDetailsForm({ data, onBack, onSave }: OtherDetailsProps) {
  const [form, setForm] = useState<Partial<StartupLead>>({
    referral_source: data.referral_source ?? "",
    additional_notes: data.additional_notes ?? "",
    has_commitment: data.has_commitment ?? false,
  });
  const [deckFile, setDeckFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setDeckFile(e.target.files[0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...form, deckFile }); // Pass the file and other data to parent
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-gray-800 text-white rounded-lg shadow-md font-['Noto_Sans']">
      <h1 className="text-2xl font-bold mb-3 text-center">Other Details</h1>
      <p className="text-gray-400 mb-8 text-center">
        Complete the final step of your startup profile.
      </p>

      <form className="grid gap-8" onSubmit={handleSubmit}>
        {/* Referral Source */}
        <div className="space-y-2">
          <Label htmlFor="referral_source">Referral Source</Label>
          <Select
            value={form.referral_source ?? ""}
            onValueChange={(val) => setForm((prev) => ({ ...prev, referral_source: val }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a source" />
            </SelectTrigger>
            <SelectContent>
              {REFERRAL_SOURCES.map((src) => (
                <SelectItem key={src} value={src}>
                  {src}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Pitch Deck Upload */}
        <div className="space-y-2">
          <Label htmlFor="pitch_deck">Pitch Deck</Label>
          <label
            htmlFor="pitch_deck"
            className="mt-2 flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 transition-colors"
          >
            <UploadCloud className="w-7 h-7 mb-2 text-gray-400" />
            <span className="text-sm text-gray-300">
              {deckFile ? deckFile.name : "Click to upload or drag and drop"}
            </span>
            <span className="text-xs text-gray-500">
              PDF, PPT, or Keynote (MAX. 10MB)
            </span>
            <Input
              id="pitch_deck"
              type="file"
              accept=".pdf,.ppt,.pptx,.key"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        </div>

        {/* Additional Notes */}
        <div className="space-y-2">
          <Label htmlFor="additional_notes">Additional Notes</Label>
          <Textarea
            id="additional_notes"
            placeholder="Is there anything else you'd like to share?"
            value={form.additional_notes ?? ""}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, additional_notes: e.target.value }))
            }
          />
        </div>

        {/* Commitment */}
        <div className="flex items-start space-x-3">
          <Checkbox
            id="has_commitment"
            checked={form.has_commitment}
            onCheckedChange={(checked) =>
              setForm((prev) => ({ ...prev, has_commitment: checked as boolean }))
            }
          />
          <Label htmlFor="has_commitment" className="leading-relaxed">
            Do you have any Commitment?
          </Label>
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-4">
          <Button type="button" variant="secondary" onClick={onBack}>
            ← Back
          </Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
            Save & Continue →
          </Button>
        </div>
      </form>
    </div>
  );
}
