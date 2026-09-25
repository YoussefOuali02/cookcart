"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export function SiteHeader() {
  const { user, isLoading, logout } = useAuth();

  return (
    <header className="border-b border-black/10 dark:border-white/10">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          CookCart
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          {isLoading ? null : user ? (
            <>
              <span className="text-zinc-600 dark:text-zinc-400">
                {user.firstName ?? user.email}
              </span>
              <button
                onClick={logout}
                className="rounded-full border border-black/10 px-4 py-1.5 font-medium transition-colors hover:bg-black/[.04] dark:border-white/15 dark:hover:bg-white/[.08]"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="font-medium text-zinc-700 hover:text-black dark:text-zinc-300 dark:hover:text-white"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-foreground px-4 py-1.5 font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
