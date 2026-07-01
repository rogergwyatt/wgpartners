import type { Metadata } from "next";
import TopNav from "@/components/TopNav";
import Footer from "@/components/Footer";
import AgentTaxCalculator from "@/components/calculator/AgentTaxCalculator";

export const metadata: Metadata = {
  title: "Agent Tax Calculator | WG AI Partners",
  description:
    "Put a number on it: annual agent-runtime cost vs. compiled software you own, with break-even and a live cost meter. Every input is yours to change.",
  alternates: { canonical: "/calculator" },
};

export default function CalculatorPage() {
  return (
    <>
      <TopNav />
      <main className="bg-mist">
        <div className="bg-navy px-6 py-16">
          <div className="mx-auto max-w-5xl">
            <p className="font-serif text-sm uppercase tracking-[0.25em] text-gold">
              Put a number on it
            </p>
            <h1 className="mt-3 max-w-3xl font-serif text-3xl font-bold text-mist lg:text-4xl">
              What does one workflow cost if an agent runs it forever?
            </h1>
            <p className="mt-4 max-w-2xl text-slate-300">
              Enter your real volume on the left. Everything is an assumption you
              can change — dial it to your numbers and watch the meter. The point
              isn&rsquo;t the default figures; it&rsquo;s where the two cost curves
              cross.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-6 py-12 lg:py-16">
          <AgentTaxCalculator />
          <p className="mt-8 text-xs text-slate-500">
            Assumptions are yours to change. Token and cloud figures are sourced
            as of June 2026 — verify before relying on them.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
