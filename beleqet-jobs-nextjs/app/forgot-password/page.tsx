"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import AuthShell from "@/components/AuthShell";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(data.message || "The request could not be completed.");
      setSent(true);
      setMessage(
        data.message ||
          "If an account exists for that email, a reset link is on its way.",
      );
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : "The request could not be completed.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Reset your password" subtitle="Enter your account email and we’ll send a secure reset link.">
      {sent ? (
        <div className="space-y-4 text-center">
          <p role="status" className="rounded-xl bg-brandGreen/10 px-4 py-3 text-sm font-semibold text-brandGreen">
            {message}
          </p>
          <p className="text-sm text-muted">
            The link expires in one hour. Didn&apos;t get it? Check your spam
            folder or try again.
          </p>
          <button
            type="button"
            onClick={() => setSent(false)}
            className="text-sm font-semibold text-brandGreen hover:underline"
          >
            Use a different email
          </button>
          <Link href="/login" className="block text-center text-sm font-semibold text-brandGreen hover:underline">Back to sign in</Link>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <label className="block text-sm font-medium text-ink">
            Email address
            <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="mt-1.5 w-full rounded-xl border border-border px-3.5 py-3 text-sm outline-none focus:border-brandGreen" />
          </label>
          {message && <p role="alert" className="rounded-xl bg-redAccent/10 px-4 py-3 text-sm font-semibold text-redAccent">{message}</p>}
          <button disabled={loading} className="w-full rounded-full bg-brandGreen py-3 text-sm font-bold text-white hover:bg-darkGreen disabled:opacity-60">
            {loading ? "Sending…" : "Send reset link"}
          </button>
          <Link href="/login" className="block text-center text-sm font-semibold text-brandGreen hover:underline">Back to sign in</Link>
        </form>
      )}
    </AuthShell>
  );
}
