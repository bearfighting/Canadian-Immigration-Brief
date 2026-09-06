import Link from "next/link";

export function DiscoveryLinkGroup({
  title,
  links,
}: {
  title: string;
  links: ReadonlyArray<{ href: string; label: string }>;
}) {
  return (
    <section aria-labelledby={`discovery-${title}`}>
      <h3 id={`discovery-${title}`} className="text-base font-semibold">
        {title}
      </h3>
      <ul className="mt-2 grid gap-1 text-base">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href}>{link.label}</Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
