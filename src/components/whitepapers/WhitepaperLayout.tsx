import Link from "next/link";
import type { Whitepaper } from "@/content/whitepapers/types";
import WhitepaperBody from "./WhitepaperBody";
import CTAButton from "../CTAButton";

export default function WhitepaperLayout({ article }: { article: Whitepaper }) {
  return (
    <main className="bg-mist">
      <div className="bg-navy px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <Link href="/whitepapers" className="text-sm text-slate-300 hover:text-mist focus-visible:outline-none focus-visible:text-mist focus-visible:underline">
            &larr; All whitepapers
          </Link>
          <h1 className="mt-4 font-serif text-3xl font-bold text-mist lg:text-4xl">
            {article.title}
          </h1>
          <p className="mt-3 text-lg text-slate-300">{article.dek}</p>
        </div>
      </div>
      <article className="mx-auto max-w-3xl px-6 py-16">
        <WhitepaperBody article={article} />
        <div className="mt-14 rounded-xl bg-navy p-8 text-center">
          <p className="font-serif text-xl font-bold text-mist">
            Renting software you could own forever?
          </p>
          <p className="mt-2 text-slate-300">20 minutes. No pitch. Just questions.</p>
          <div className="mt-5">
            <CTAButton href="/#contact">Book a 20-min call &rarr;</CTAButton>
          </div>
        </div>
      </article>
    </main>
  );
}
