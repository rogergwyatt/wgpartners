import type { Whitepaper } from "@/content/whitepapers/types";

export default function WhitepaperBody({ article }: { article: Whitepaper }) {
  return (
    <div
      className="prose prose-slate max-w-none prose-headings:font-serif prose-headings:text-navy prose-h2:text-2xl prose-p:leading-relaxed prose-p:text-slate-700 prose-a:text-royal prose-strong:text-navy prose-li:text-slate-700"
      dangerouslySetInnerHTML={{ __html: article.contentHtml }}
    />
  );
}
