"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/", label: "Feed", icon: "◎" },
  { href: "/stashes", label: "Stashes", icon: "▤" },
  { href: "/create", label: "Create", icon: "+" },
  { href: "/review", label: "Review", icon: "↻" },
  { href: "/search", label: "Search", icon: "⌕" },
];

export function Nav({ due }: { due: number }) {
  const path = usePathname();
  const active = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));

  return (
    <>
      {/* Desktop: top bar */}
      <header className="fixed inset-x-0 top-0 z-30 hidden border-b border-line bg-bg/90 backdrop-blur md:block">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <Link href="/" className="font-serif text-lg font-bold tracking-tight">
            Deep<span className="text-accent">Knowledge</span>
          </Link>
          <nav className="flex gap-1">
            {ITEMS.map((i) => (
              <Link
                key={i.href}
                href={i.href}
                className={`relative rounded-full px-3 py-1.5 text-sm ${active(i.href) ? "bg-surface-2 font-semibold" : "text-muted hover:text-ink"}`}
              >
                {i.label}
                {i.href === "/review" && due > 0 && <Badge n={due} />}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Mobile: bottom tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5">
          {ITEMS.map((i) => (
            <Link
              key={i.href}
              href={i.href}
              className={`relative flex flex-col items-center gap-0.5 py-2 text-[11px] ${active(i.href) ? "text-accent" : "text-muted"}`}
            >
              <span
                className={`flex h-7 w-7 items-center justify-center text-lg leading-none ${i.href === "/create" ? "rounded-full bg-accent text-white" : ""}`}
              >
                {i.icon}
              </span>
              {i.label}
              {i.href === "/review" && due > 0 && <Badge n={due} />}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}

function Badge({ n }: { n: number }) {
  return (
    <span className="absolute right-1/4 top-1 min-w-4 rounded-full bg-accent px-1 text-center text-[10px] font-bold leading-4 text-white md:-right-1 md:-top-1">
      {n > 99 ? "99+" : n}
    </span>
  );
}
