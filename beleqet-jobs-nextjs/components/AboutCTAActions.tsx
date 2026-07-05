"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

export default function AboutCTAActions() {
  const { user } = useAuth();

  return (
    <div className="flex flex-wrap gap-3">
      <Link
        href="/jobs"
        className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-white"
      >
        Find jobs <ArrowRight className="h-4 w-4" />
      </Link>
      <Link
        href={user ? "/profile" : "/register"}
        className="rounded-full border border-primary/20 px-5 py-3 text-sm font-bold text-primary"
      >
        {user ? "Your profile" : "Create account"}
      </Link>
    </div>
  );
}
