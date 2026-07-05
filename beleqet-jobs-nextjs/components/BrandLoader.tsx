export default function BrandLoader({ fullScreen = true }: { fullScreen?: boolean }) {
  return (
    <div
      className={`${fullScreen ? "fixed inset-0 z-[100]" : "min-h-[50vh]"} flex items-center justify-center bg-[#fffdf8]`}
      role="status"
      aria-live="polite"
      aria-label="Loading Beleqet"
    >
      <div className="flex flex-col items-center">
        <div className="brand-loader-mark relative flex h-20 w-20 items-center justify-center rounded-[24px] bg-primary shadow-[0_20px_50px_-16px_rgba(4,22,3,.55)]">
          <svg
            viewBox="0 0 40 40"
            className="h-11 w-11 text-[#d8ff3e]"
            fill="none"
            aria-hidden="true"
          >
            <rect x="5" y="12" width="30" height="22" rx="6" stroke="currentColor" strokeWidth="2.6" />
            <path d="M14 12V9.5A3.5 3.5 0 0 1 17.5 6h5A3.5 3.5 0 0 1 26 9.5V12M5 21h30M17 21v3h6v-3" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="brand-loader-orbit absolute inset-[-8px] rounded-[30px] border-2 border-brandGreen/20">
            <span className="absolute -top-1 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-brandGreen" />
          </span>
        </div>
        <p className="mt-5 text-xl font-extrabold tracking-[-.04em] text-primary">
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
