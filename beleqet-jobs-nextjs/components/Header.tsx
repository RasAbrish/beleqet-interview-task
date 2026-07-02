"use client";

import Link from "next/link";
import { useState } from "react";
import { BriefcaseBusiness, Menu, X } from "lucide-react";
import HeaderAuth from "@/components/HeaderAuth";
import PostJobButton from "@/components/PostJobButton";
import NotificationBell from "@/components/NotificationBell";

const navItems = [
  { label: "Find jobs", href: "/jobs" },
  { label: "For employers", href: "/post-job" },
  { label: "CV maker", href: "/cv-maker" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-primary/10 bg-[#fffdf8]/90 backdrop-blur-xl">
      <div className="container-page flex h-[72px] items-center justify-between">
        <Link
          href="/"
          className="group flex items-center gap-2.5"
          aria-label="Beleqet Jobs home"
        >
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-[14px] bg-primary text-[#d8ff3e] shadow-sm transition-transform group-hover:-rotate-3">
            <BriefcaseBusiness className="h-5 w-5" />
          </span>
          <span className="text-[19px] font-extrabold tracking-[-0.04em] text-primary">
            Beleqet<span className="text-brandGreen">.</span>
          </span>
        </Link>

        <nav
          className="hidden items-center gap-1 lg:flex"
          aria-label="Main navigation"
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-2 text-sm font-semibold text-ink/75 transition-colors hover:bg-primary/5 hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <NotificationBell />
          <HeaderAuth />
          <PostJobButton />
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-primary/10 text-primary md:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-primary/10 bg-[#fffdf8] px-5 pb-6 pt-3 md:hidden">
          <nav className="flex flex-col" aria-label="Mobile navigation">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="border-b border-primary/10 py-3.5 text-sm font-semibold text-primary"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-5 flex items-center justify-between gap-3">
            <NotificationBell />
            <HeaderAuth />
            <PostJobButton />
          </div>
        </div>
      )}
    </header>
  );
}
