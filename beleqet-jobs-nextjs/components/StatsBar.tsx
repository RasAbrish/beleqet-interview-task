import { Briefcase, Building2, Users, Smile, type LucideIcon } from "lucide-react";
import { stats } from "@/lib/mockData";

const iconMap: Record<string, LucideIcon> = {
  briefcase: Briefcase,
  "building-2": Building2,
  users: Users,
  smile: Smile,
};

export default function StatsBar() {
  return (
    <div className="container-page -mt-8 relative z-10">
      <div className="rounded-2xl bg-white border border-border shadow-card grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border">
        {stats.map((stat) => {
          const Icon = iconMap[stat.icon] ?? Briefcase;
          return (
            <div key={stat.label} className="flex items-center gap-3.5 px-5 py-6">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brandGreen/10 text-brandGreen">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xl font-extrabold text-ink leading-none">{stat.value}</p>
                <p className="text-[11px] text-muted mt-1.5">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
