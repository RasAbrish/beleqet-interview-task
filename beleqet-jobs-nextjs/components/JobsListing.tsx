"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Search, MapPin, SlidersHorizontal, X } from "lucide-react";
import type { Job, Category } from "@/lib/api";
import JobCard from "@/components/JobCard";

const jobTypes = ["Full Time", "Part Time", "Remote", "Hybrid", "Contract"];
const JOBS_PER_PAGE = 8;

export default function JobsListing({
  initialJobs,
  categories,
}: {
  initialJobs: Job[];
  categories: Category[];
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const resultsRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [location, setLocation] = useState(searchParams.get("loc") ?? "");
  const [category, setCategory] = useState(searchParams.get("category") ?? "");
  const [type, setType] = useState<string>("");
  const requestedPage = Number(searchParams.get("page"));
  const [page, setPage] = useState(
    Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1,
  );

  const filtered = useMemo(() => {
    return initialJobs.filter((job) => {
      const matchesQuery =
        !query ||
        job.title.toLowerCase().includes(query.toLowerCase()) ||
        job.company.toLowerCase().includes(query.toLowerCase());
      const matchesLocation = !location || job.location.toLowerCase().includes(location.toLowerCase());
      const matchesCategory = !category || job.category === category;
      const matchesType = !type || job.type === type;
      return matchesQuery && matchesLocation && matchesCategory && matchesType;
    });
  }, [initialJobs, query, location, category, type]);

  const categoryLabel = categories.find((c) => c.id === category)?.label;
  const hasFilters = Boolean(query || location || category || type);
  const totalPages = Math.max(1, Math.ceil(filtered.length / JOBS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const visibleJobs = filtered.slice(
    (currentPage - 1) * JOBS_PER_PAGE,
    currentPage * JOBS_PER_PAGE,
  );
  const firstResult = filtered.length ? (currentPage - 1) * JOBS_PER_PAGE + 1 : 0;
  const lastResult = Math.min(currentPage * JOBS_PER_PAGE, filtered.length);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (currentPage > 1) params.set("page", String(currentPage));
    else params.delete("page");
    const next = params.toString();
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
  }, [currentPage, pathname, router, searchParams]);

  function changePage(nextPage: number) {
    setPage(Math.min(Math.max(nextPage, 1), totalPages));
    requestAnimationFrame(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function clearAll() {
    setQuery("");
    setLocation("");
    setCategory("");
    setType("");
    setPage(1);
  }

  return (
    <div className="container-page py-10">
      <div className="mb-6 shrink-0">
        <h1 className="text-pageH1">Search verified jobs from trusted employers.</h1>
        <p className="text-muted text-sm mt-2">
          <span className="font-semibold text-ink">{filtered.length}</span> job{filtered.length === 1 ? "" : "s"} found
        </p>
      </div>

      <form
        onSubmit={(e) => e.preventDefault()}
        className="mb-4 flex shrink-0 flex-col gap-2 rounded-2xl border border-border bg-white p-2 shadow-card sm:flex-row"
      >
        <div className="flex items-center flex-1 gap-2 px-3 py-2.5 rounded-xl">
          <Search className="h-4 w-4 text-muted shrink-0" />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            placeholder="Job title, keyword or company"
            className="w-full text-sm text-ink placeholder:text-muted outline-none"
          />
        </div>
        <div className="hidden sm:block w-px bg-border my-1" />
        <div className="flex items-center flex-1 gap-2 px-3 py-2.5 rounded-xl">
          <MapPin className="h-4 w-4 text-muted shrink-0" />
          <input
            value={location}
            onChange={(e) => { setLocation(e.target.value); setPage(1); }}
            placeholder="Location e.g. Addis Ababa"
            className="w-full text-sm text-ink placeholder:text-muted outline-none"
          />
        </div>
        <button
          type="submit"
          className="shrink-0 inline-flex items-center justify-center gap-2 rounded-xl bg-brandGreen px-6 py-3 text-sm font-semibold text-white hover:bg-darkGreen transition-colors"
        >
          <Search className="h-4 w-4" /> Search
        </button>
      </form>

      {hasFilters && (
        <div className="mb-4 flex shrink-0 flex-wrap items-center gap-2">
          {query && <FilterChip label={`“${query}”`} onClear={() => { setQuery(""); setPage(1); }} />}
          {location && <FilterChip label={location} onClear={() => { setLocation(""); setPage(1); }} />}
          {category && <FilterChip label={categoryLabel ?? category} onClear={() => { setCategory(""); setPage(1); }} />}
          {type && <FilterChip label={type} onClear={() => { setType(""); setPage(1); }} />}
          <button onClick={clearAll} className="text-xs font-semibold text-brandGreen hover:underline ml-1">
            Clear all
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="space-y-6 lg:sticky lg:top-24 lg:h-fit lg:self-start">
          <div className="rounded-xl border border-border bg-white p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-ink mb-4">
              <SlidersHorizontal className="h-4 w-4" /> Category
            </h3>
            <div className="max-h-80 space-y-1 overflow-y-auto pr-1">
              <FilterButton active={category === ""} onClick={() => { setCategory(""); setPage(1); }}>
                All Categories
              </FilterButton>
              {categories.map((cat) => (
                <FilterButton key={cat.id} active={category === cat.id} onClick={() => { setCategory(cat.id); setPage(1); }}>
                  <span className="flex w-full items-center justify-between">
                    <span>{cat.label}</span>
                    {cat.count ? <span className="text-xs text-muted">{cat.count}</span> : null}
                  </span>
                </FilterButton>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-white p-5">
            <h3 className="text-sm font-semibold text-ink mb-4">Job Type</h3>
            <div className="space-y-1">
              <FilterButton active={type === ""} onClick={() => { setType(""); setPage(1); }}>
                All Types
              </FilterButton>
              {jobTypes.map((t) => (
                <FilterButton key={t} active={type === t} onClick={() => { setType(t); setPage(1); }}>
                  {t}
                </FilterButton>
              ))}
            </div>
          </div>
        </aside>

        <div ref={resultsRef} className="min-w-0 scroll-mt-28">
          {filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-white p-12 text-center">
              <p className="text-ink font-semibold">No jobs match your filters</p>
              <p className="text-sm text-muted mt-1">Try adjusting your search or clearing filters.</p>
              {hasFilters && (
                <button
                  onClick={clearAll}
                  className="mt-4 inline-flex rounded-full border border-border px-5 py-2 text-sm font-semibold text-ink hover:bg-pageBg transition-colors"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between gap-4 text-sm text-muted">
                <p>Showing <span className="font-semibold text-ink">{firstResult}–{lastResult}</span> of <span className="font-semibold text-ink">{filtered.length}</span> jobs</p>
                <p className="hidden sm:block">Page {currentPage} of {totalPages}</p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {visibleJobs.map((job) => (
                  <JobCard key={job.id} job={job} variant="light" />
                ))}
              </div>
              {totalPages > 1 && (
                <Pagination page={currentPage} totalPages={totalPages} onChange={changePage} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (page: number) => void }) {
  const pages = paginationItems(page, totalPages);
  return (
    <nav className="mt-8 flex items-center justify-center gap-1.5" aria-label="Job results pagination">
      <PageButton label="Previous page" disabled={page === 1} onClick={() => onChange(page - 1)}><ChevronLeft className="h-4 w-4" /></PageButton>
      {pages.map((item, index) => item === "…"
        ? <span key={`ellipsis-${index}`} className="px-2 text-muted" aria-hidden="true">…</span>
        : <button key={item} type="button" onClick={() => onChange(item)} aria-label={`Page ${item}`} aria-current={item === page ? "page" : undefined} className={`h-10 min-w-10 rounded-full px-3 text-sm font-bold transition ${item === page ? "bg-primary text-white" : "border border-border bg-white text-ink hover:border-brandGreen hover:text-brandGreen"}`}>{item}</button>
      )}
      <PageButton label="Next page" disabled={page === totalPages} onClick={() => onChange(page + 1)}><ChevronRight className="h-4 w-4" /></PageButton>
    </nav>
  );
}

function PageButton({ label, disabled, onClick, children }: { label: string; disabled: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" aria-label={label} disabled={disabled} onClick={onClick} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-ink transition hover:border-brandGreen hover:text-brandGreen disabled:cursor-not-allowed disabled:opacity-40">{children}</button>;
}

function paginationItems(page: number, total: number): Array<number | "…"> {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
  if (page <= 4) return [1, 2, 3, 4, 5, "…", total];
  if (page >= total - 3) return [1, "…", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "…", page - 1, page, page + 1, "…", total];
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`block w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
        active ? "bg-brandGreen/10 text-brandGreen font-semibold" : "text-muted hover:bg-pageBg"
      }`}
    >
      {children}
    </button>
  );
}

function FilterChip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-brandGreen/10 text-brandGreen text-xs font-medium pl-3 pr-2 py-1.5">
      {label}
      <button onClick={onClear} aria-label={`Remove ${label} filter`} className="hover:text-darkGreen">
        <X className="h-3.5 w-3.5" />
      </button>
    </span>
  );
}
