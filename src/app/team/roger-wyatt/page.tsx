import type { Metadata } from "next";
import Link from "next/link";
import TopNav from "@/components/TopNav";
import Footer from "@/components/Footer";
import CTAButton from "@/components/CTAButton";

export const metadata: Metadata = {
  title: "Roger Wyatt — Résumé | WG AI Partners",
  description:
    "Enterprise software engineering executive and CTO with 40+ years leading large engineering organizations across NASA, Capital One, CarMax, and Duck Creek Technologies.",
  alternates: { canonical: "/team/roger-wyatt" },
};

const summary =
  "Enterprise Software Engineering Executive and CTO with 40+ years of experience leading cross-functional engineering organizations of up to 200+ professionals to design, scale, and deploy cloud-native SaaS solutions. Proven track record of spearheading massive digital transformations, driving multi-billion-dollar revenue growth, and architecting critical systems for premier organizations including NASA and Capital One. Expert in microservices, event-driven architectures, and implementing cutting-edge AI automation frameworks to drastically reduce operating overhead and accelerate deployment cycles.";

const expertise = [
  "Enterprise SaaS & IaaS",
  "Cloud Architecture (AWS, Azure, GCP)",
  "Software Engineering Leadership",
  "Event-Driven Architecture",
  "Large-Scale Agile Development",
  "AI Automation & LLM Integration",
  "Data Strategy & Observability",
  "Strategic Roadmap Execution",
  "Multi-Million Dollar Budget Management",
];

type Role = {
  company: string;
  title: string;
  period: string;
  bullets: { label: string; text: string }[];
};

const experience: Role[] = [
  {
    company: "Duck Creek Technologies",
    title: "Director of Engineering",
    period: "2023 – 2026",
    bullets: [
      { label: "Scale & Leadership", text: "Directed an engineering organization of 75+ developers focused on implementing complex network architectures for core enterprise software products." },
      { label: "SaaS Transformation", text: "Built a specialized team of 18+ engineers to completely redesign legacy software applications into modern, true SaaS implementations utilizing Kubernetes, Kafka, Argo, Kargo, and MongoDB." },
      { label: "Efficiency Metrics", text: "Streamlined cross-functional workflows to accelerate customer environment provisioning timelines from 3 months down to 2 weeks." },
      { label: "Performance Optimization", text: "Achieved a 146X performance improvement in formal testing, slashing response latency from 14 seconds to 400 milliseconds while reducing projected operating costs by over $4MM annually." },
      { label: "AI Innovation", text: "Drove team integration of Claude Code to elevate engineering quality and spearheaded development of proprietary AI agents to replace legacy coding dependencies." },
      { label: "CI/CD & Observability", text: "Reduced system deployment windows from 2 weeks to 15 minutes while engineering comprehensive enterprise observability using Grafana dashboards and proactive health checks." },
      { label: "Incident Response", text: "Commanded incident engineering response for critical SEV1 events via data-driven troubleshooting and control variable testing, interfacing directly with Executive Leadership Teams (ELT) for top-tier global clients." },
    ],
  },
  {
    company: "CarMax",
    title: "Director of Software Engineering",
    period: "2018 – 2022",
    bullets: [
      { label: "Revenue Growth", text: "Led a 50+ person team delivering 20+ core software products that directly yielded $3BN+ in revenue growth." },
      { label: "Technical Roadmapping", text: "Formulated the technical product strategy and architectural roadmaps for 10+ internal enterprise tools supporting a user base of 10,000+." },
      { label: "Architectural Innovation", text: "Engineered parameter-driven, runtime module-loading software architectures, resulting in an organization-wide 50%+ baseline performance lift and specific application gains exceeding 200%." },
      { label: "Cross-Functional Alignment", text: "Collaborated across 10+ cross-functional business units to identify, address, and capture over $100MN+ in previously unrealized opportunity costs." },
      { label: "Core Tech Stack", text: "Leveraged C#, MSSQL, NuGet, and Azure web services within an Agile development framework." },
    ],
  },
  {
    company: "Data Globe Group",
    title: "Chief Technology Officer",
    period: "2017 – 2018",
    bullets: [
      { label: "AI Strategy", text: "Initiated the development and technical execution of an AI-driven financial services platform that generated $1BN+ in revenue." },
      { label: "Scalable Infrastructure", text: "Authored the engineering strategy and mobile/web roadmaps necessary to scale consumer applications to support 10MN+ active users." },
      { label: "Organizational Design", text: "Structured, scale-built, and managed an engineering department exceeding 200+ developers, managers, and architects." },
      { label: "Capital Acquisition", text: "Successfully pitched technical product capabilities to international investor syndicates, securing $10MN+ in early capital commitments." },
      { label: "Global Enterprise Pitches", text: "Architected and presented a $5BN+ ARR technical framework targeted at the African continent for business magnate Carlos Slim, and designed a $2MN ARR engineering solution for a key German enterprise client." },
    ],
  },
  {
    company: "Capital One",
    title: "Senior Engineering Manager",
    period: "2015 – 2017",
    bullets: [
      { label: "Executive Solutions", text: "Managed a 100+ person engineering group developing strategic, high-visibility software portfolios valued at $50MN for CEO Richard Fairbanks." },
      { label: "Cost Containment", text: "Architected high-performance systems that realized $30MN in immediate operational savings while driving a 12,000%+ increase in processing speed." },
      { label: "Robotic Process Automation (RPA)", text: "Directed a dedicated 30-engineer RPA task force to implement intelligent automation workflows, securing $15MM in recurring annual savings." },
      { label: "Talent Acquisition", text: "Recruited, interviewed, onboarded, and mentored 30+ cross-functional engineers and technical leaders." },
      { label: "Reliability Engineering", text: "Evangelized cutting-edge distributed architectures to minimize system downtime, bolster data integrity, and guarantee platform reliability." },
    ],
  },
  {
    company: "Insignia Technology Services, LLC",
    title: "Deputy Program Manager",
    period: "2015",
    bullets: [
      { label: "Program Management", text: "Supervised a $12M federal program and a 75-person team comprising managers, developers, QA analysts, and project managers to deliver Identity and Access Management (IAM) software solutions for the Veterans Administration." },
      { label: "Strategic Staffing", text: "Sourced and hired 40 niche technical experts, establishing a robust leadership pipeline by mentoring team leads to enhance delegation and project oversight." },
      { label: "Stakeholder Relations", text: "Interfaced directly with Senior Executive Service (SES) leaders within the Veterans Administration to harmonize development velocity with federal compliance priorities." },
    ],
  },
  {
    company: "Anthem",
    title: "Technical Architect / Developer Lead",
    period: "2012 – 2015",
    bullets: [
      { label: "Enterprise Architecture", text: "Overhauled a massive web services infrastructure supporting 500+ secure endpoints across Medicare and Medicaid operations, securing a $1BN+ business segment." },
      { label: "Telephony Automation", text: "Designed and executed an automated Voice Response infrastructure capable of managing over 100M+ inbound customer interactions annually." },
      { label: "Technical Mentorship", text: "Institutionalized modern design principles and Gang of Four (GoF) software patterns across engineering squads to boost code maintainability." },
    ],
  },
  {
    company: "NASA, Langley Research Center",
    title: "Software Development Manager",
    period: "2010 – 2012",
    bullets: [
      { label: "Federal Project Control", text: "Led the architectural modernization of a critical financial accounting ecosystem tracking $2BN+ in federal assets, directly supporting the presidential directive to phase out the Space Shuttle program." },
      { label: "Process Engineering", text: "Optimized fiscal year data rollover algorithms, generating $200K+ in direct engineering and operational savings." },
      { label: "Legacy Modernization", text: "Orchestrated the extraction, transformation, and migration of 2,000,000+ legacy mainframe records into a highly secure, web-based ecosystem." },
    ],
  },
  {
    company: "Tynken Interactive, Inc.",
    title: "President",
    period: "2002 – 2012",
    bullets: [
      { label: "Startup Operations", text: "Founded and scaled a proprietary LAMP-stack web content management solution (CMS) company." },
      { label: "Business Development", text: "Negotiated and finalized over $1M in enterprise B2B software contracts." },
      { label: "Product Lifecycle Management", text: "Directed the end-to-end product roadmap and P&L, executing three core software upgrades that drove a 200% surge in active users." },
    ],
  },
];

const earlyCareer = [
  "Corning Inc. — Software Development Manager (Nov 2000 – Jun 2002)",
  "Visionair, Inc. — Integration Technical Director (Mar 1993 – Nov 2000)",
  "Energy Services, Inc. / Carolina Software / Piedmont Software — Software Developer (1987 – 1993)",
];

const education = [
  "Clemson University — B.S. in Computer Science",
  "Private Pilot License (FAA Third-Class Medical Certified)",
];

const proficiencies = [
  { group: "Cloud Platforms", items: "AWS, Azure, Google Cloud Platform (GCP)" },
  { group: "Core Systems & Architectures", items: "SaaS, IaaS, Enterprise Software Architecture, Microservices, Event-Driven Architecture, REST APIs, SOAP, SOA, IAM, RPA, CI/CD pipelines" },
  { group: "Orchestration & DevOps Tools", items: "Kubernetes, Kafka, Argo, Kargo, Grafana, Splunk, Git, Jenkins, TeamCity, SVN" },
  { group: "Languages", items: "C#, Java, JavaScript, Node.js, PHP, Ruby, C++, C, SQL" },
  { group: "Frameworks & Libraries", items: "Next.js, React, GraphQL, Angular, jQuery, ASP.NET" },
  { group: "Databases", items: "SQL Server (MSSQL), MongoDB, MySQL, Oracle, SQLite, XML" },
  { group: "AI & LLM Integration", items: "Claude Code, GitHub Copilot, Grok, ChatGPT, OpenCV, FreeTTS" },
];

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-serif text-2xl font-bold text-navy">{children}</h2>
  );
}

export default function RogerWyattResume() {
  return (
    <>
      <TopNav />
      <main className="bg-mist">
        <div className="bg-navy px-6 py-16">
          <div className="mx-auto max-w-3xl">
            <Link
              href="/#who-we-are"
              className="text-sm text-slate-300 hover:text-mist focus-visible:outline-none focus-visible:text-mist focus-visible:underline"
            >
              &larr; Back to WG AI Partners
            </Link>
            <h1 className="mt-4 font-serif text-4xl font-bold text-mist">
              Roger Wyatt
            </h1>
            <p className="mt-2 text-lg text-gold">
              Managing Partner &amp; CTO · 40+ years
            </p>
            <p className="mt-3 text-sm text-slate-300">
              <a href="mailto:roger@wgaipartners.com" className="hover:text-mist">
                roger@wgaipartners.com
              </a>{" "}
              ·{" "}
              <a href="tel:+19102970929" className="hover:text-mist">
                910-297-0929
              </a>{" "}
              ·{" "}
              <a
                href="https://www.linkedin.com/in/rogerwyatt"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-mist"
              >
                linkedin.com/in/rogerwyatt
              </a>
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-3xl space-y-12 px-6 py-16">
          <section>
            <SectionHeading>Executive Summary</SectionHeading>
            <p className="mt-3 leading-relaxed text-slate-700">{summary}</p>
          </section>

          <section>
            <SectionHeading>Areas of Expertise</SectionHeading>
            <div className="mt-4 flex flex-wrap gap-3">
              {expertise.map((e) => (
                <span
                  key={e}
                  className="rounded-full bg-navy/5 px-4 py-2 text-sm text-navy"
                >
                  {e}
                </span>
              ))}
            </div>
          </section>

          <section>
            <SectionHeading>Professional Experience</SectionHeading>
            <div className="mt-6 space-y-8">
              {experience.map((role) => (
                <div key={role.company}>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                    <h3 className="font-serif text-xl font-bold text-navy">
                      {role.company}
                    </h3>
                    <span className="text-sm text-slate-500">{role.period}</span>
                  </div>
                  <p className="text-sm font-medium text-royal">{role.title}</p>
                  <ul className="mt-3 space-y-2 text-sm text-slate-700">
                    {role.bullets.map((b) => (
                      <li key={b.label}>
                        <span className="font-semibold text-navy">
                          {b.label}:
                        </span>{" "}
                        {b.text}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <section>
            <SectionHeading>Early Career</SectionHeading>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {earlyCareer.map((e) => (
                <li key={e}>— {e}</li>
              ))}
            </ul>
          </section>

          <section>
            <SectionHeading>Education &amp; Credentials</SectionHeading>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {education.map((e) => (
                <li key={e}>— {e}</li>
              ))}
            </ul>
          </section>

          <section>
            <SectionHeading>Technical Proficiencies</SectionHeading>
            <dl className="mt-4 space-y-3">
              {proficiencies.map((p) => (
                <div
                  key={p.group}
                  className="grid grid-cols-1 gap-1 sm:grid-cols-[220px_1fr] sm:gap-4"
                >
                  <dt className="font-semibold text-navy">{p.group}</dt>
                  <dd className="text-sm text-slate-700">{p.items}</dd>
                </div>
              ))}
            </dl>
          </section>

          <div className="rounded-xl bg-navy p-8 text-center">
            <p className="font-serif text-xl font-bold text-mist">
              Want this experience on your next modernization?
            </p>
            <p className="mt-2 text-slate-300">
              20 minutes. No pitch. Just questions.
            </p>
            <div className="mt-5">
              <CTAButton href="/#contact">Book a 20-min call &rarr;</CTAButton>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
