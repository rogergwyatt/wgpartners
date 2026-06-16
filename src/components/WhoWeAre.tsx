import Section from "./Section";

const partners = [
  {
    name: "Roger Wyatt",
    title: "Managing Partner & CTO · 40+ years",
    creds: [
      "146× performance improvement at Duck Creek",
      "$30MM savings at Capital One",
      "$3BN+ revenue at CarMax",
      "$2BN legacy modernization at NASA",
    ],
  },
  {
    name: "Michael Grundvig",
    title: "Principal Engineer",
    creds: ["Enterprise platform experience at UKG and Duck Creek."],
  },
];

const verticals = [
  "Financial Services / Fintech",
  "Manufacturing & Supply Chain",
  "Enterprise SaaS / Tech",
  "Government / Public Sector",
];

export default function WhoWeAre() {
  return (
    <Section id="who-we-are" className="bg-mist">
      <p className="font-serif text-sm uppercase tracking-[0.25em] text-royal">
        Who We Are
      </p>
      <h2 className="mt-3 max-w-3xl font-serif text-3xl font-bold text-navy lg:text-4xl">
        Senior technologists only. The partners who pitch you are the partners
        who build your system.
      </h2>
      <p className="mt-4 max-w-2xl text-slate-600">
        WG Partners is a boutique AI-modernization firm — no associate layer, no
        offshore handoff.
      </p>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {partners.map((p) => (
          <div
            key={p.name}
            className="rounded-xl border border-slate-200 bg-white p-7 shadow-sm"
          >
            <h3 className="font-serif text-2xl font-bold text-navy">{p.name}</h3>
            <p className="mt-1 text-sm font-medium text-royal">{p.title}</p>
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
      <div className="mt-4 flex flex-wrap gap-3">
        {verticals.map((v) => (
          <span
            key={v}
            className="rounded-full bg-navy/5 px-4 py-2 text-sm text-navy"
          >
            {v}
          </span>
        ))}
      </div>
    </Section>
  );
}
