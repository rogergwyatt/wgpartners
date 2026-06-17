import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TopNav from "@/components/TopNav";
import Footer from "@/components/Footer";
import WhitepaperLayout from "@/components/whitepapers/WhitepaperLayout";
import { getWhitepaper, whitepaperSlugs } from "@/lib/whitepapers";

export function generateStaticParams() {
  return whitepaperSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const article = getWhitepaper(params.slug);
  if (!article) return { title: "Whitepaper | WG AI Partners" };
  return {
    title: `${article.title} | WG AI Partners`,
    description: article.dek,
    alternates: { canonical: `/whitepapers/${article.slug}` },
  };
}

export default function WhitepaperPage({ params }: { params: { slug: string } }) {
  const article = getWhitepaper(params.slug);
  if (!article) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.dek,
    url: `https://www.wgaipartners.com/whitepapers/${article.slug}`,
    author: { "@type": "Organization", name: "Wyatt & Grundvig Partners" },
    publisher: { "@type": "Organization", name: "WG AI Partners" },
  };

  return (
    <>
      <TopNav />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <WhitepaperLayout article={article} />
      <Footer />
    </>
  );
}
