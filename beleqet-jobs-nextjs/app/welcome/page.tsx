"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  FileText,
  MailCheck,
  Search,
  Sparkles,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { roleMeta } from "@/components/HeaderAuth";
import BrandLoader from "@/components/BrandLoader";

type Step = { icon: LucideIcon; title: string; text: string; href: string; cta: string };

const stepsByRole: Record<string, { tagline: string; primary: Step; steps: Step[] }> = {
  JOB_SEEKER: {
    tagline: "Your next opportunity starts here. Let's set you up to get hired.",
    primary: {
      icon: Search,
      title: "Browse open jobs",
      text: "Explore verified roles from trusted Ethiopian employers.",
      href: "/jobs",
      cta: "Find jobs",
    },
    steps: [
      { icon: UserRound, title: "Complete your profile", text: "Add your experience so employers can find you.", href: "/profile", cta: "Edit profile" },
      { icon: FileText, title: "Build your CV", text: "Create a standout CV with our free CV maker.", href: "/cv-maker", cta: "Open CV maker" },
    ],
  },
  EMPLOYER: {
    tagline: "Welcome aboard. Let's get your first role in front of great candidates.",
    primary: {
      icon: BriefcaseBusiness,
      title: "Post your first job",
      text: "Publish a listing and start receiving applications today.",
      href: "/post-job",
      cta: "Post a job",
    },
    steps: [
      { icon: Building2, title: "Set up your company", text: "Add your company profile so candidates trust your brand.", href: "/profile", cta: "Company profile" },
      { icon: Search, title: "Explore the marketplace", text: "See how candidates browse and discover roles.", href: "/jobs", cta: "Browse jobs" },
    ],
  },
  FREELANCER: {
    tagline: "Welcome aboard. Let's showcase your skills and win your first project.",
    primary: {
      icon: UserRound,
      title: "Complete your profile",
      text: "Highlight your skills and portfolio to stand out to clients.",
      href: "/profile",
      cta: "Edit profile",
    },
    steps: [
      { icon: Search, title: "Find opportunities", text: "Browse jobs and projects that match your skills.", href: "/jobs", cta: "Browse jobs" },
      { icon: FileText, title: "Build your CV", text: "Create a polished CV to share with clients.", href: "/cv-maker", cta: "Open CV maker" },
    ],
  },
};

export default function WelcomePage() {
  const { user, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && !user) router.replace("/register");
  }, [ready, user, router]);

  if (!ready || !user) return <BrandLoader fullScreen={false} />;

  const config = stepsByRole[user.role] ?? stepsByRole.JOB_SEEKER;
  const role = roleMeta[user.role] ?? { label: user.role, className: "bg-muted/10 text-muted" };

  return (
    <div className="min-h-screen bg-[#f7f5ef]">
      {/* Hero */}
      <section className="bg-primary px-4 py-16 text-white sm:py-20">
        <div className="container-page text-center">
          <span className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-[20px] bg-[#d8ff3e] text-primary shadow-lg">
            <BriefcaseBusiness className="h-8 w-8" />
          </span>
          <span
            className={`mt-6 inline-block rounded-full px-3 py-1 text-[11px] font-bold ${role.className}`}
          >
            {role.label}
          </span>
          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
            Welcome to Beleqet, {user.firstName}
            <span className="text-[#d8ff3e]">.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-white/70 sm:text-base">
            {config.tagline}
          </p>
        </div>
      </section>

      <div className="container-page -mt-10 pb-20">
        {/* Verify email notice */}
        <div className="mx-auto flex max-w-3xl items-start gap-3 rounded-2xl border border-brandGreen/20 bg-white p-5 shadow-card">
          <MailCheck className="h-5 w-5 shrink-0 text-brandGreen" />
          <div>
            <p className="text-sm font-bold text-primary">
              Verify your email to unlock everything
            </p>
            <p className="mt-1 text-sm text-muted">
              We&apos;ve sent a verification link to{" "}
              <span className="font-semibold text-ink">{user.email}</span>. Check
              your inbox to confirm your account.
            </p>
          </div>
        </div>

        {/* Primary next step */}
        <div className="mx-auto mt-6 max-w-3xl">
          <div className="flex flex-col items-start justify-between gap-5 rounded-[26px] bg-[#d8ff3e] p-7 sm:flex-row sm:items-center">
            <div className="flex items-start gap-4">
              <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-[#d8ff3e]">
                <config.primary.icon className="h-6 w-6" />
              </span>
              <div>
                <p className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-primary/60">
                  <Sparkles className="h-3.5 w-3.5" /> Recommended first step
                </p>
                <h2 className="mt-1 text-xl font-black text-primary">
                  {config.primary.title}
                </h2>
                <p className="mt-1 text-sm text-primary/70">{config.primary.text}</p>
              </div>
            </div>
            <Link
              href={config.primary.href}
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white transition hover:bg-brandGreen"
            >
              {config.primary.cta} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Secondary steps */}
        <div className="mx-auto mt-5 grid max-w-3xl gap-4 sm:grid-cols-2">
          {config.steps.map((step) => (
            <Link
              key={step.title}
              href={step.href}
              className="group flex flex-col rounded-2xl border border-border bg-white p-6 transition hover:-translate-y-0.5 hover:border-brandGreen/50 hover:shadow-lg"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brandGreen/10 text-brandGreen">
                <step.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-extrabold text-primary">{step.title}</h3>
              <p className="mt-1 text-sm leading-6 text-muted">{step.text}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-brandGreen">
                {step.cta}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>

        <p className="mx-auto mt-8 max-w-3xl text-center text-sm text-muted">
          Or head straight to your{" "}
          <Link href="/" className="font-bold text-primary hover:text-brandGreen">
            home dashboard
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
