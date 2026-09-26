"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api-client";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await register({
        email,
        password,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
      });
      router.push("/");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Something went wrong.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center bg-zinc-50 px-6 py-16 dark:bg-black">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Create your account
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Start cooking with less waste.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <div className="flex gap-3">
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <label htmlFor="firstName" className="text-sm font-medium">
                First name
              </label>
              <input
                id="firstName"
                type="text"
                autoComplete="given-name"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                className="w-full min-w-0 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-black/30 dark:border-white/15 dark:bg-zinc-900 dark:focus:border-white/40"
              />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <label htmlFor="lastName" className="text-sm font-medium">
                Last name
              </label>
              <input
                id="lastName"
                type="text"
                autoComplete="family-name"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                className="w-full min-w-0 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-black/30 dark:border-white/15 dark:bg-zinc-900 dark:focus:border-white/40"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-black/30 dark:border-white/15 dark:bg-zinc-900 dark:focus:border-white/40"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-black/30 dark:border-white/15 dark:bg-zinc-900 dark:focus:border-white/40"
            />
            <p className="text-xs text-zinc-500 dark:text-zinc-500">
              At least 8 characters.
            </p>
          </div>

          {error ? (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 flex h-11 items-center justify-center rounded-full bg-foreground text-sm font-medium text-background transition-colors hover:bg-[#383838] disabled:opacity-50 dark:hover:bg-[#ccc]"
          >
            {isSubmitting ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <p className="mt-6 text-sm text-zinc-600 dark:text-zinc-400">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-black dark:text-zinc-50">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
