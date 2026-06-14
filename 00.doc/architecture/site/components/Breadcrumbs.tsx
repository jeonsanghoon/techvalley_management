import Link from "next/link";

type Crumb = { label: string; href?: string };

type Props = { items: Crumb[] };

export function Breadcrumbs({ items }: Props) {
  return (
    <ol className="mb-4 flex flex-wrap items-center gap-1 text-xs text-muted">
      {items.map((item, i) => (
        <li key={item.label + i} className="flex items-center gap-1">
          {i > 0 && <span>/</span>}
          {item.href ? (
            <Link href={item.href} className="hover:text-accent">
              {item.label}
            </Link>
          ) : (
            <span className="text-navy">{item.label}</span>
          )}
        </li>
      ))}
    </ol>
  );
}
