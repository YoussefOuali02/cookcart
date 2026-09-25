"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRequireAdmin } from "@/lib/auth-context";
import type { ReactNode } from "react";

const NAV_ITEMS = [
  { href: "/admin/ingredients", label: "Ingredients" },
  { href: "/admin/meals", label: "Meals" },
  { href: "/admin/orders", label: "Orders" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user } = useRequireAdmin();
  const pathname = usePathname();

  if (!user || user.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black md:flex-row">
      <aside className="border-b border-black/10 px-6 py-4 md:w-48 md:shrink-0 md:border-b-0 md:border-r md:py-8 dark:border-white/10">
        <h2 className="text-xs font-semibold tracking-wide text-zinc-500 uppercase">
          Admin
        </h2>
        <nav className="mt-3 flex gap-4 md:flex-col md:gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium md:px-3 ${
                  isActive
                    ? "bg-black/[.06] text-black dark:bg-white/[.1] dark:text-white"
                    : "text-zinc-600 hover:bg-black/[.04] dark:text-zinc-400 dark:hover:bg-white/[.06]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex-1 px-6 py-8">{children}</div>
    </div>
  );
}
