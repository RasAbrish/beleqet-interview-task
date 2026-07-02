"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

export default function PostJobButton() {
  const { user, ready } = useAuth();
  if (!ready) return null;

  const canPost = !user || user.role === "EMPLOYER" || user.role === "ADMIN";
  if (!canPost) return null;

  return (
    <Link
      href="/post-job"
      className="inline-flex items-center gap-1.5 rounded-full bg-brandGreen px-4 py-2 text-sm font-semibold text-white hover:bg-darkGreen transition-colors"
    >
      <Plus className="h-4 w-4" /> Post a Job
    </Link>
  );
}
