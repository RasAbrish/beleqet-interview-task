export default function LogoMarquee({ items }: { items: string[] }) {
  // Two identical groups scroll left together; when the first is fully off
  // screen the track resets by exactly one group width for a seamless loop.
  const group = (
    <ul
      className="flex shrink-0 items-center gap-8 pr-8 sm:gap-14 sm:pr-14"
      aria-hidden="false"
    >
      {items.map((name) => (
        <li
          key={name}
          className="whitespace-nowrap text-sm font-extrabold text-primary/40 transition-colors hover:text-primary/70"
        >
          {name}
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
