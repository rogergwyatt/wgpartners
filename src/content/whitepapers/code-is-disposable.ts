import type { Whitepaper } from "./types";

const article: Whitepaper = {
  slug: "code-is-disposable",
  title: "The Code Is Disposable: Why the Specification Is Your Only Real Asset",
  dek: "If you're still measuring engineering health by lines of code, you're managing a ghost.",
  order: 2,
  sections: [
    {
      paragraphs: [
        `If you're still measuring the health of your engineering department by counting the lines of code written, the number of commits pushed, or the velocity of Jira tickets closed, you are managing a ghost.`,
        `In the pre-AI era, code was the ultimate corporate asset. It represented thousands of grueling human engineering hours spent turning abstract business ideas into rigid syntax. The code was the value because the labor to produce it was incredibly scarce and expensive. Then the world flipped.`,
        `With modern tooling, an engineer can prompt a model and watch it generate 500 lines of syntactically perfect code in three seconds. Writing syntax has officially transitioned from a highly skilled craft to a cheap, near-zero-marginal-cost commodity. If code is free, the code itself is no longer the asset. The code is disposable. The only real, unyielding asset your company owns is the specification.`,
      ],
    },
    {
      heading: "The Sandbox Illusion",
      paragraphs: [
        `When you give an engineering team an LLM-powered environment without a rigorous, machine-readable specification, you don't get faster feature delivery. You just get an explosion of accidental complexity.`,
        `Developers start writing code by intuition—prompting, pasting, hitting a runtime error, pasting the stack trace back into the AI, and asking it to fix itself. This is "vibe coding." The AI confidently obliges, churning out massive blocks of wrapper code and nested conditionals to bypass the error. The code looks clean, passes a basic local test, and gets shoved into a pull request—but because nobody defined the precise specification of what that module is allowed to do, the AI is essentially guessing the rules of your business.`,
      ],
    },
    {
      heading: "Shift the Gate: Stop Reviewing Code",
      paragraphs: [
        `If your senior technical leaders are spending their days manually reviewing AI-generated pull requests line-by-line, you have built a human bottleneck for a machine-scale problem. In a disciplined, AI-augmented engineering department, you don't manage the syntax. You manage the specification.`,
        `The Spec is the Truth: your senior architects use AI to analyze old logs, read historical code, and define strict, human-readable schemas (OpenAPI, Protocol Buffers, structural type schemas) that lock down your business rules.`,
        `The Code Writes Itself: once the specification is tightly defined and compiled, you hand it to the AI generation engine. Because the prompt is no longer a vague sentence but a precise, mathematical schema, the AI can generate the code flawlessly.`,
        `Instant Rejection by Default: you feed the generated code into an isolated testing sandbox and slam it against automated validation. If the code deviates from the specification by even a single byte, the verification engine rejects it instantly and tells the generator to try again. The human never has to look at a single line of code until the machine has mathematically proven it conforms to the spec.`,
      ],
    },
    {
      heading: "The Tech Leader's New Mandate",
      paragraphs: [
        `The legacy mindset says: "We own a complex, proprietary software application." The modern mindset says: "We own a bulletproof, machine-readable specification. The application is just a temporary asset we can regenerate or flip into a different language by next Tuesday if we feel like it."`,
        `If your engineering department is drowning in a backlog despite having AI tools at their fingertips, stop telling them to prompt faster. Strip away the illusion that more raw syntax equals progress. Turn your abstract business rules into rigid, verifiable specifications, build the automated safety nets to police them, and let the code become exactly what it is meant to be in this new era: completely disposable.`,
      ],
    },
  ],
};

export default article;
