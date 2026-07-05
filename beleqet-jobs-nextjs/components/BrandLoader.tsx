import { BriefcaseBusiness } from "lucide-react";

export default function BrandLoader({ fullScreen = true }: { fullScreen?: boolean }) {
  return (
    <div
      className={`${fullScreen ? "fixed inset-0 z-[100]" : "min-h-[50vh]"} flex items-center justify-center bg-[#fffdf8]`}
      role="status"
      aria-live="polite"
      aria-label="Loading Beleqet"
    >
      <div className="flex flex-col items-center">
        {/* Brand mark — identical to the header logo, scaled up */}
        <div className="relative flex h-24 w-24 items-center justify-center">
          {/* Spinning progress ring */}
          <span
            className="brand-loader-ring absolute inset-0 rounded-[26px]"
            aria-hidden="true"
          />
          {/* Logo tile */}
          <span className="brand-loader-mark relative flex h-20 w-20 items-center justify-center rounded-[22px] bg-primary text-[#d8ff3e] shadow-[0_20px_50px_-16px_rgba(4,22,3,.55)]">
            <BriefcaseBusiness className="h-9 w-9" strokeWidth={2} aria-hidden="true" />
          </span>
        </div>

        <p className="mt-6 text-xl font-extrabold tracking-[-.04em] text-primary">
          Beleqet<span className="text-brandGreen">.</span>
        </p>

        <div className="mt-3 h-1 w-24 overflow-hidden rounded-full bg-primary/10">
          <span className="brand-loader-progress block h-full rounded-full bg-brandGreen" />
        </div>
        <span className="sr-only">Loading…</span>
      </div>
    </div>
  );
}
