import { Suspense } from "react";
import JobsListing from "@/components/JobsListing";
import { fetchCategories, fetchJobs } from "@/lib/api";
import { JobsListingSkeleton } from "@/components/Skeletons";

export const revalidate = 60;

export const metadata = {
  title: "Find Jobs | Beleqet Jobs",
};

export default async function JobsPage() {
  const [jobs, categories] = await Promise.all([fetchJobs(), fetchCategories()]);

  return (
    <Suspense fallback={<JobsListingSkeleton />}>
      <JobsListing initialJobs={jobs} categories={categories} />
    </Suspense>
  );
}
