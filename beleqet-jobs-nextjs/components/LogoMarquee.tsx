import type { LucideIcon } from "lucide-react";

export type BrandLogo = {
  name: string;
  icon: LucideIcon;
};

export default function LogoMarquee({ items }: { items: BrandLogo[] }) {
  // Two identical groups scroll left together; when the first is fully off
  // screen the track resets by exactly one group width for a seamless loop.
  const group = (
    <ul className="flex shrink-0 items-center gap-10 pr-10 sm:gap-16 sm:pr-16">
      {items.map(({ name, icon: Icon }) => (
        <li
          key={name}
          className="flex shrink-0 items-center gap-2.5 text-primary/40 grayscale transition-all duration-300 hover:text-primary hover:grayscale-0"
        >
          <Icon className="h-6 w-6 shrink-0" strokeWidth={2.25} />
          <span className="whitespace-nowrap text-lg font-black tracking-tight">
            {name}
          </span>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="marquee group relative flex overflow-hidden">
      <div className="marquee-track flex w-max group-hover:[animation-play-state:paused]">
        {group}
        <div aria-hidden="true">{group}</div>
      </div>
    </div>
  );
}
