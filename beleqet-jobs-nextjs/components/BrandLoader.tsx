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
        <div className="relative flex h-[76px] w-[76px] items-center justify-center">
          {/* Spinning progress ring */}
          <span
            className="brand-loader-ring absolute inset-0 rounded-[20px]"
            aria-hidden="true"
          />
          {/* Logo tile */}
          <span className="brand-loader-mark relative flex h-16 w-16 items-center justify-center rounded-[18px] bg-primary text-[#d8ff3e] shadow-[0_20px_50px_-16px_rgba(4,22,3,.55)]">
            <BriefcaseBusiness className="h-7 w-7" strokeWidth={2} aria-hidden="true" />
          </span>
        </div>

        <p className="mt-5 text-lg font-extrabold tracking-[-.04em] text-primary">
          Beleqet<span className="text-brandGreen">.</span>
        </p>

        <div className="mt-3 h-1 w-20 overflow-hidden rounded-full bg-primary/10">
          <span className="brand-loader-progress block h-full rounded-full bg-brandGreen" />
        </div>
        <span className="sr-only">Loading…</span>
      </div>
    </div>
  );
}
