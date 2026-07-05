import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Clock, Building2, ArrowLeft } from "lucide-react";
import { fetchJob, fetchJobs } from "@/lib/api";
import JobActions from "@/components/JobActions";

export const revalidate = 300;

export default async function JobDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const job = await fetchJob(params.id);
  if (!job) notFound();

  const all = await fetchJobs();
  const related = all
    .filter((j) => j.category === job.category && j.id !== job.id)
    .slice(0, 3);

  return (
    <div className="container-page py-10">
      <Link
        href="/jobs"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-brandGreen mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Back to all jobs
      </Link>

      <div className="grid min-w-0 grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          <div className="min-w-0 overflow-hidden rounded-2xl border border-border bg-white p-7">
            <div className="flex items-start gap-4">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-pageBg text-muted shrink-0">
                <Building2 className="h-6 w-6" />
              </span>
              <div className="min-w-0">
                <h1 className="break-words text-xl font-extrabold leading-snug text-ink [overflow-wrap:anywhere] sm:text-2xl">
                  {job.title}
                </h1>
                <p className="mt-1 break-words text-muted [overflow-wrap:anywhere]">{job.company}</p>
                <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-muted">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> {job.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {job.postedAgo}
                  </span>
                  <span className="rounded-full bg-brandGreen/10 text-brandGreen font-semibold px-2.5 py-1">
                    {job.type}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-7 pt-7 border-t border-border">
              <h2 className="text-sm font-semibold text-ink mb-3">
                Job Description
              </h2>
              <p className="max-w-full whitespace-pre-wrap break-words text-sm leading-relaxed text-muted [overflow-wrap:anywhere]">
                {job.description}
              </p>
            </div>

            {job.tags && job.tags.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {job.tags.map((tag) => (
                  <span
                    key={tag}
                    className="max-w-full break-words rounded-full border border-border bg-pageBg px-3 py-1 text-xs font-medium text-muted [overflow-wrap:anywhere]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <aside className="min-w-0 space-y-6">
          <JobActions jobId={job.id} />

          {related.length > 0 && (
            <div className="rounded-2xl border border-border bg-white p-6">
              <h3 className="text-sm font-semibold text-ink mb-4">
                Similar Jobs
              </h3>
              <div className="space-y-3">
                {related.map((r) => (
                  <Link
                    key={r.id}
                    href={`/jobs/${r.id}`}
                    className="block rounded-lg hover:bg-pageBg p-2 -mx-2 transition-colors"
                  >
                    <p className="text-sm font-semibold text-ink line-clamp-1">
                      {r.title}
                    </p>
                    <p className="text-xs text-muted mt-0.5">
                      {r.company} · {r.location}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
