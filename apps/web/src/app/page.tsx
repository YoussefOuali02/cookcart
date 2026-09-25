import Link from "next/link";

const steps = [
  {
    title: "Choose meals",
    description: "Browse meal kits and pick what you want to cook.",
  },
  {
    title: "Get exact ingredients",
    description:
      "See the precise quantities required — no more, no less.",
  },
  {
    title: "Remove what you already have",
    description:
      "Tell us what's already in your pantry and we'll skip it.",
  },
  {
    title: "Cook with less waste",
    description: "Order only what you need, and nothing you don't.",
  },
];

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center bg-zinc-50 dark:bg-black">
      <section className="w-full max-w-3xl px-6 py-24 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-black sm:text-5xl dark:text-zinc-50">
          Cook exactly what you need.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          CookCart turns grocery products into customizable meal kits.
          Choose a meal, remove ingredients you already have, and order
          only what&apos;s missing.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/register"
            className="flex h-12 w-full items-center justify-center rounded-full bg-foreground px-8 text-base font-medium text-background transition-colors hover:bg-[#383838] sm:w-auto dark:hover:bg-[#ccc]"
          >
            Get started
          </Link>
          <Link
            href="/login"
            className="flex h-12 w-full items-center justify-center rounded-full border border-black/[.08] px-8 text-base font-medium transition-colors hover:border-transparent hover:bg-black/[.04] sm:w-auto dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
          >
            Log in
          </Link>
        </div>
      </section>

      <section className="w-full max-w-3xl border-t border-black/10 px-6 py-16 dark:border-white/10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          {steps.map((step, index) => (
            <div key={step.title} className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black/[.06] text-sm font-semibold dark:bg-white/[.08]">
                {index + 1}
              </span>
              <div>
                <h2 className="font-medium text-black dark:text-zinc-50">
                  {step.title}
                </h2>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
