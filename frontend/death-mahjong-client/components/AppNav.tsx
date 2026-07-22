"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed left-0 top-0 z-50 w-full border-b border-slate-200 bg-white/90 px-4 py-3 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
        <Link href="/" className="font-bold tracking-wide text-slate-950 dark:text-slate-100">
          Death Mahjong
        </Link>

        <div className="flex items-center gap-2 text-sm">
          <NavLink href="/" active={pathname === "/"}>
            Play
          </NavLink>

          <NavLink href="/stats" active={pathname === "/stats"}>
            Statistics
          </NavLink>

          <span className="cursor-not-allowed rounded-full px-3 py-1.5 text-slate-400 dark:text-slate-500">
            Profile
          </span>
        </div>
      </div>
    </nav>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={[
        "rounded-full px-3 py-1.5 font-medium transition",
        active
          ? "bg-red-700 text-white dark:bg-red-600"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white",
      ].join(" ")}
    >
      {children}
    </Link>
  );
}