"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";
import { toast } from "sonner";

export default function ShareJobButton({
  jobId,
  title,
  company,
  light = true,
}: {
  jobId: string;
  title?: string;
  company?: string;
  light?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/jobs/${jobId}`
        : `/jobs/${jobId}`;
    const shareData: ShareData = {
      title: title ? `${title}${company ? ` at ${company}` : ""}` : "Beleqet job",
      text: title
        ? `Check out this job on Beleqet: ${title}${company ? ` at ${company}` : ""}`
        : "Check out this job on Beleqet",
      url,
    };

    // Native share sheet where available (mobile, some desktops)
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        // User dismissed the sheet — not an error worth surfacing
        if (err instanceof DOMException && err.name === "AbortError") return;
      }
    }

    // Fallback: copy the link to the clipboard
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Job link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy the job link");
    }
  }

  return (
    <button
      type="button"
      onClick={(event) => {
        // Keep clicks inside a card link from navigating
        event.preventDefault();
        event.stopPropagation();
        void share();
      }}
      aria-label="Share job"
      title="Share job"
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
        light
          ? "bg-pageBg text-muted hover:bg-brandGreen/10 hover:text-brandGreen"
          : "bg-white/10 text-white/60 hover:text-[#d8ff3e]"
      }`}
    >
      {copied ? (
        <Check className="h-4 w-4 text-brandGreen" />
      ) : (
        <Share2 className="h-4 w-4" />
      )}
    </button>
  );
}
