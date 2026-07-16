import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-[720px] px-4 py-24 text-center sm:px-6 lg:px-8">
      <p className="text-xs font-medium uppercase tracking-[0.24em] text-stone">404</p>
      <h1 className="mt-4 text-4xl font-medium text-ink">This page is unavailable.</h1>
      <p className="mt-4 text-sm leading-6 text-stone">The piece may have moved, or the page no longer exists.</p>
      <Link
        href="/shop"
        className="mt-8 inline-flex h-12 items-center justify-center bg-ink px-6 text-sm font-medium text-white transition-colors hover:bg-stone"
      >
        Return to shop
      </Link>
    </section>
  );
}
