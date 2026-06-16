import type { Metadata } from "next";
import Link from "next/link";
import TopNav from "@/components/TopNav";
import Footer from "@/components/Footer";
import { getAllWhitepapers } from "@/lib/whitepapers";

export const metadata: Metadata = {
  title: "Whitepapers | WG Partners",
  description: "The thinking behind the thesis — essays on SaaS lock-in, spec-driven engineering, and AI modernization.",
};

export default function WhitepapersIndex() {
  const articles = getAllWhitepapers();
  return (
    <>
      <TopNav />
      <main className="mx-auto max-w-4xl px-6 py-20">
        <p className="font-serif text-sm uppercase tracking-[0.25em] text-royal">
          Whitepapers
        </p>
        <h1 className="mt-3 font-serif text-4xl font-bold text-navy">
          The thinking behind the thesis.
        </h1>
        <div className="mt-10 space-y-6">
          {articles.map((a) => (
            <Link
              key={a.slug}
              href={`/whitepapers/${a.slug}`}
              className="block rounded-xl border border-slate-200 bg-white p-7 shadow-sm transition-colors hover:border-royal"
            >
              <h2 className="font-serif text-2xl font-bold text-navy">{a.title}</h2>
              <p className="mt-2 text-slate-600">{a.dek}</p>
              <span className="mt-4 inline-block text-sm font-semibold text-royal">
                Read &rarr;
              </span>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
