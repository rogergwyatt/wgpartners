const stats = [
  { figure: "90%", label: "cost reduction vs. traditional SI firms" },
  { figure: "10×", label: "faster delivery than manual development" },
  { figure: "Zero", label: "ongoing licensing fees after delivery" },
];

export default function ResultBand() {
  return (
    <div className="bg-ink">
      <div className="mx-auto grid max-w-5xl grid-cols-1 divide-y divide-white/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {stats.map((s) => (
          <div key={s.figure} className="px-6 py-8 text-center">
            <div className="font-serif text-4xl font-extrabold text-gold">
              {s.figure}
            </div>
            <div className="mt-2 text-sm text-slate-400">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
