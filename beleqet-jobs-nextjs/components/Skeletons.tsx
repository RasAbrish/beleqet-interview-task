export function JobCardSkeleton() {
  return (
    <div className="flex min-h-[280px] flex-col rounded-[22px] border border-border bg-white p-5 animate-pulse" aria-hidden="true">
      <div className="flex items-start justify-between">
        <div className="h-10 w-10 rounded-lg bg-pageBg" />
        <div className="h-4 w-4 rounded bg-pageBg" />
      </div>
      <div className="h-4 w-3/4 rounded bg-pageBg mt-4" />
      <div className="h-3 w-1/2 rounded bg-pageBg mt-3" />
      <div className="h-3 w-2/5 rounded bg-pageBg mt-3" />
      <div className="flex items-center justify-between mt-5 pt-4 border-t border-border">
        <div className="h-5 w-20 rounded-full bg-pageBg" />
        <div className="h-3 w-12 rounded bg-pageBg" />
      </div>
    </div>
  );
}

export function FeaturedJobsSkeleton() {
  return (
    <section className="bg-white border-y border-border">
      <div className="container-page py-14">
        <div className="h-6 w-48 rounded bg-pageBg mb-6 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <JobCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function CategoryGridSkeleton() {
  return (
    <section className="container-page py-14">
      <div className="h-6 w-56 rounded bg-pageBg mb-6 animate-pulse" />
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2 rounded-xl border border-border bg-white px-3 py-5 animate-pulse">
            <div className="h-9 w-9 rounded-lg bg-pageBg" />
            <div className="h-3 w-16 rounded bg-pageBg" />
            <div className="h-2.5 w-10 rounded bg-pageBg" />
          </div>
        ))}
      </div>
    </section>
  );
}

export function JobsListingSkeleton() {
  return (
    <div className="container-page py-10" role="status" aria-label="Loading jobs">
      <div className="animate-pulse">
        <div className="h-12 w-full max-w-4xl rounded-xl bg-primary/10 sm:h-16" />
        <div className="mt-3 h-4 w-24 rounded bg-primary/10" />
        <div className="mt-6 flex h-[68px] items-center gap-3 rounded-2xl border border-border bg-white p-3 shadow-card">
          <div className="h-10 flex-1 rounded-xl bg-pageBg" />
          <div className="hidden h-10 flex-1 rounded-xl bg-pageBg sm:block" />
          <div className="h-11 w-28 rounded-xl bg-brandGreen/20" />
        </div>
      </div>
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
        <div className="space-y-6" aria-hidden="true">
          <div className="rounded-xl border border-border bg-white p-5">
            <div className="h-5 w-28 animate-pulse rounded bg-pageBg" />
            <div className="mt-5 space-y-3">{Array.from({ length: 7 }).map((_, i) => <div key={i} className="h-8 animate-pulse rounded-lg bg-pageBg" />)}</div>
          </div>
          <div className="rounded-xl border border-border bg-white p-5">
            <div className="h-5 w-24 animate-pulse rounded bg-pageBg" />
            <div className="mt-5 space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-8 animate-pulse rounded-lg bg-pageBg" />)}</div>
          </div>
        </div>
        <div>
          <div className="mb-4 flex justify-between" aria-hidden="true"><div className="h-4 w-40 animate-pulse rounded bg-pageBg" /><div className="h-4 w-20 animate-pulse rounded bg-pageBg" /></div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <JobCardSkeleton key={i} />
          ))}
          </div>
          <div className="mx-auto mt-8 h-10 w-72 max-w-full animate-pulse rounded-full bg-pageBg" aria-hidden="true" />
        </div>
      </div>
      <span className="sr-only">Loading job results…</span>
    </div>
  );
}

export function JobDetailSkeleton() {
  return (
    <div className="container-page py-10">
      <div className="h-4 w-32 rounded bg-pageBg animate-pulse mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
        <div className="rounded-2xl border border-border bg-white p-7 animate-pulse">
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 rounded-xl bg-pageBg" />
            <div className="flex-1">
              <div className="h-6 w-2/3 rounded bg-pageBg" />
              <div className="h-4 w-1/3 rounded bg-pageBg mt-3" />
            </div>
          </div>
          <div className="h-40 rounded bg-pageBg mt-7" />
        </div>
        <div className="h-40 rounded-2xl border border-border bg-white animate-pulse" />
      </div>
    </div>
  );
}
