"use client";

import { FormEvent, useEffect, useState } from "react";
import { Loader2, Save, X } from "lucide-react";
import { authenticatedFetch } from "@/lib/auth";
import { toast } from "sonner";
import type { EmployerJob } from "@/types/applications";
import type { JobFormCategory } from "@/types/jobs";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

const jobTypes = [
  { value: "FULL_TIME", label: "Full time" },
  { value: "PART_TIME", label: "Part time" },
  { value: "REMOTE", label: "Remote" },
  { value: "HYBRID", label: "Hybrid" },
  { value: "CONTRACT", label: "Contract" },
];

export default function EditJobModal({
  job,
  onClose,
  onSaved,
}: {
  job: EmployerJob;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [categories, setCategories] = useState<JobFormCategory[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/jobs/categories`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setCategories)
      .catch(() => {});
  }, []);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const number = (key: string) => {
      const value = form.get(key)?.toString();
      return value ? Number(value) : undefined;
    };
    const payload = {
      title: form.get("title"),
      location: form.get("location"),
      type: form.get("type"),
      categoryId: form.get("categoryId"),
      salaryMin: number("salaryMin"),
      salaryMax: number("salaryMax"),
      deadline: form.get("deadline") || undefined,
      description: form.get("description"),
      requirements: form.get("requirements") || undefined,
    };
    try {
      const response = await authenticatedFetch(`${API_URL}/jobs/${job.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(
          Array.isArray(data.message)
            ? data.message.join(", ")
            : data.message || "Job could not be updated.",
        );
      toast.success("Job updated");
      onSaved();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Job could not be updated.";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  const deadlineValue = job.deadline
    ? new Date(job.deadline).toISOString().slice(0, 10)
    : "";

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-primary/70 p-4 backdrop-blur-sm sm:items-center sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-job-title"
    >
      <div className="max-h-[calc(100dvh-2rem)] w-full max-w-2xl overflow-y-auto rounded-[28px] bg-[#f7f5ef] shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-primary/10 bg-white px-6 py-5">
          <div className="min-w-0 pr-3">
            <p className="text-xs font-extrabold uppercase tracking-wider text-brandGreen">
              Edit job
            </p>
            <h2
              id="edit-job-title"
              className="mt-1 truncate text-xl font-black text-primary"
            >
              {job.title}
            </h2>
          </div>
          <button
            onClick={() => !saving && onClose()}
            aria-label="Close editor"
            className="rounded-full p-2 text-muted hover:bg-pageBg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-5 p-4 sm:p-6">
          <Field label="Job title">
            <input
              name="title"
              required
              defaultValue={job.title}
              className={inputClass}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Location">
              <input
                name="location"
                required
                defaultValue={job.location}
                className={inputClass}
              />
            </Field>
            <Field label="Work type">
              <select name="type" defaultValue={job.type} className={inputClass}>
                {jobTypes.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Category">
            <select
              name="categoryId"
              required
              defaultValue={job.categoryId}
              className={inputClass}
            >
              {categories.length === 0 && (
                <option value={job.categoryId}>Current category</option>
              )}
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Salary min">
              <input
                name="salaryMin"
                type="number"
                min="0"
                defaultValue={job.salaryMin ?? ""}
                className={inputClass}
              />
            </Field>
            <Field label="Salary max">
              <input
                name="salaryMax"
                type="number"
                min="0"
                defaultValue={job.salaryMax ?? ""}
                className={inputClass}
              />
            </Field>
            <Field label="Deadline">
              <input
                name="deadline"
                type="date"
                defaultValue={deadlineValue}
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Description">
            <textarea
              name="description"
              required
              rows={6}
              defaultValue={job.description}
              className={`${inputClass} leading-6`}
            />
          </Field>

          <Field label="Requirements">
            <textarea
              name="requirements"
              rows={4}
              defaultValue={job.requirements ?? ""}
              className={`${inputClass} leading-6`}
            />
          </Field>

          {error && (
            <p
              role="alert"
              className="rounded-xl bg-redAccent/10 px-4 py-3 text-sm font-semibold text-redAccent"
            >
              {error}
            </p>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-full border border-primary/15 px-5 py-3 text-sm font-bold text-primary"
            >
              Cancel
            </button>
            <button
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white hover:bg-brandGreen disabled:opacity-60"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputClass =
  "mt-1.5 w-full rounded-xl border border-primary/10 bg-white px-3.5 py-3 text-sm outline-none focus:border-brandGreen";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-xs font-bold text-ink">
      {label}
      {children}
    </label>
  );
}
