import CTAButton from "./CTAButton";
import ResultBand from "./ResultBand";

export default function Hero() {
  return (
    <>
      <div className="bg-gradient-to-b from-navy to-navy-700 px-6 py-24 text-center lg:py-32">
        <div className="mx-auto max-w-3xl">
          <div className="mx-auto mb-6 h-[3px] w-14 bg-gold" />
          <h1 className="font-serif text-4xl font-bold leading-tight text-mist lg:text-6xl">
            You&rsquo;re Renting Software.{" "}
            <span className="text-gold">You Could Own It Forever.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-slate-300">
            We use AI to build custom software that replaces your legacy systems
            and eliminates annual SaaS fees &mdash; permanently. One fixed
            engagement. You own the code. No more recurring bills.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <CTAButton href="/#contact">Book a 20-min call &rarr;</CTAButton>
            <CTAButton href="/#saas-killer" variant="outline">
              See the argument
            </CTAButton>
          </div>
        </div>
      </div>
      <ResultBand />
    </>
  );
}
