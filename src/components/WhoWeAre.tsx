import Image from "next/image";
import Section from "./Section";

type Partner = {
  name: string;
  title: string;
  creds: string[];
  // To add a real headshot: drop the file in public/images/team/ and set
  // image: "/images/team/roger.jpg" (square images look best).
  image?: string;
};

const partners: Partner[] = [
  {
    name: "Roger Wyatt",
    title: "Managing Partner & CTO · 40+ years",
    image: "/images/rogerheadshot.jpg",
    creds: [
      "146× performance improvement at Duck Creek",
      "$30MM savings at Capital One",
      "$3BN+ revenue at CarMax",
      "$2BN legacy modernization at NASA",
    ],
  },
  {
    name: "Michael Grundvig",
    title: "Partner & Head Engineer",
    creds: ["Enterprise platform experience at UKG and Duck Creek."],
  },
];

const verticals = [
  "Financial Services / Fintech",
  "Insurance / Insurtech",
  "Manufacturing & Supply Chain",
  "Enterprise SaaS / Tech",
  "Government / Public Sector",
];

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");
}

export default function WhoWeAre() {
  return (
    <Section id="who-we-are" className="bg-mist">
      <p className="font-serif text-sm uppercase tracking-[0.25em] text-royal">
        Who We Are
      </p>
      <h2 className="mt-3 max-w-3xl font-serif text-3xl font-bold text-navy lg:text-4xl">
        The partners who pitch you are accountable for what we ship.
      </h2>
      <p className="mt-4 max-w-2xl text-slate-600">
        WG AI Partners is a boutique AI-modernization firm. The founding partners
        lead every engagement and are personally accountable for the
        outcome — and often do the building themselves. When a project calls for
        more horsepower, we bring in vetted senior specialists. What you&rsquo;ll
        never get is a junior associate layer or an offshore handoff.
      </p>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {partners.map((p) => (
          <div
            key={p.name}
            className="rounded-xl border border-slate-200 bg-white p-7 shadow-sm"
          >
            <div className="flex items-center gap-4">
              {p.image ? (
                <Image
                  src={p.image}
                  alt={`${p.name} headshot`}
                  width={80}
                  height={80}
                  className="h-20 w-20 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div
                  aria-label={`${p.name} headshot placeholder`}
                  className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-slate-300 bg-navy/5 font-serif text-xl font-bold text-navy/40"
                >
                  {initials(p.name)}
                </div>
              )}
              <div>
                <h3 className="font-serif text-2xl font-bold text-navy">
                  {p.name}
                </h3>
                <p className="mt-1 text-sm font-medium text-royal">{p.title}</p>
              </div>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              {p.creds.map((c) => (
                <li key={c}>— {c}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <h3 className="mt-14 text-lg font-semibold text-navy">
        Verticals we know
      </h3>
      <div className="mt-4 flex flex-wrap gap-3 lg:flex-nowrap lg:justify-between">
        {verticals.map((v) => (
          <span
            key={v}
            className="whitespace-nowrap rounded-full bg-navy/5 px-3 py-2 text-sm text-navy"
          >
            {v}
          </span>
        ))}
      </div>
    </Section>
  );
}
