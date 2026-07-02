"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

export default function HeaderAuth() {
  const { user, ready, logout } = useAuth();
  const router = useRouter();

  if (!ready) return <div className="h-8 w-24" />;

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <span className="hidden sm:flex items-center gap-2 text-sm font-medium text-ink">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-brandGreen/10 text-brandGreen text-xs font-bold uppercase">
            {user.firstName.charAt(0)}
            {user.lastName.charAt(0)}
          </span>
          {user.firstName}
        </span>
        <button
          onClick={() => {
            logout();
            router.push("/");
          }}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-redAccent transition-colors"
        >
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>
    );
  }

  return (
    <Link
      href="/login"
      className="hidden sm:inline-block text-sm font-medium text-ink hover:text-brandGreen transition-colors"
    >
      Login / Sign Up
    </Link>
  );
}
