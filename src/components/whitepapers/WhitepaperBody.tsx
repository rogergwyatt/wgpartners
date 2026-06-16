import type { Whitepaper } from "@/content/whitepapers/types";

export default function WhitepaperBody({ article }: { article: Whitepaper }) {
  return (
    <div className="space-y-8">
      {article.sections.map((section, i) => (
        <div key={i}>
          {section.heading && (
            <h2 className="font-serif text-2xl font-bold text-navy">
              {section.heading}
            </h2>
          )}
          <div className="mt-3 space-y-4">
            {section.paragraphs.map((p, j) => (
              <p key={j} className="leading-relaxed text-slate-700">
                {p}
              </p>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
