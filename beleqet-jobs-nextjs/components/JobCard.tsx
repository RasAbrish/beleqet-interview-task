import Link from "next/link";
import { MapPin, Bookmark, Building2 } from "lucide-react";
import type { Job } from "@/lib/api";

export default function JobCard({ job }: { job: Job }) {
  return (
    <Link
      href={`/jobs/${job.id}`}
      className="group flex min-h-[280px] flex-col rounded-[22px] border border-white/10 bg-white/[.07] p-5 transition-all hover:-translate-y-1 hover:border-[#d8ff3e]/60 hover:bg-white/[.1]"
    >
      <div className="flex items-start justify-between">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#d8ff3e] text-primary">
          <Building2 className="h-5 w-5" />
        </span>
        <Bookmark className="h-4 w-4 text-white/40 transition-colors group-hover:text-[#d8ff3e]" />
      </div>

      <h3 className="text-cardH3 mt-5 line-clamp-2 leading-snug text-white">
        {job.title}
      </h3>
      <p className="mt-1 text-sm text-white/55">{job.company}</p>

      <div className="mt-3 flex items-center gap-1 text-xs text-white/50">
        <MapPin className="h-3.5 w-3.5" />
        {job.location}
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-4">
        <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white">
          {job.type}
        </span>
        <span className="text-[11px] text-white/40">{job.postedAgo}</span>
      </div>
    </Link>
  );
}
