import Link from "next/link";
import Section from "./Section";
import { getAllWhitepapers } from "@/lib/whitepapers";

export default function WhitepapersTeaser() {
  const articles = getAllWhitepapers();
  return (
    <Section id="whitepapers" className="bg-mist">
      <div className="flex items-end justify-between">
        <div>
          <p className="font-serif text-sm uppercase tracking-[0.25em] text-royal">
            Whitepapers
          </p>
          <h2 className="mt-3 font-serif text-3xl font-bold text-navy lg:text-4xl">
            The thinking behind the thesis.
          </h2>
        </div>
        <Link href="/whitepapers" className="text-sm font-semibold text-royal hover:underline">
          View all &rarr;
        </Link>
      </div>
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {articles.map((a) => (
          <Link
            key={a.slug}
            href={`/whitepapers/${a.slug}`}
            className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-colors hover:border-royal"
          >
            <h3 className="font-serif text-lg font-bold text-navy">{a.title}</h3>
            <p className="mt-2 flex-1 text-sm text-slate-600">{a.dek}</p>
            <span className="mt-4 text-sm font-semibold text-royal">Read &rarr;</span>
          </Link>
        ))}
      </div>
    </Section>
  );
}
