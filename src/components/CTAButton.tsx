import Link from "next/link";
import { ReactNode } from "react";

export default function CTAButton({
  href,
  variant = "primary",
  children,
}: {
  href: string;
  variant?: "primary" | "outline";
  children: ReactNode;
}) {
  const base =
    "inline-flex items-center justify-center rounded-md px-6 py-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-navy";
  const styles =
    variant === "primary"
      ? "bg-gold text-navy hover:bg-gold/90 focus-visible:ring-gold"
      : "border border-white/30 text-mist hover:bg-white/10 focus-visible:ring-mist";
  return (
    <Link href={href} className={`${base} ${styles}`}>
      {children}
    </Link>
  );
}
