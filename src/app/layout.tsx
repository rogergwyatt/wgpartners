import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { Toaster } from "sonner";
import { sans, serif } from "@/lib/fonts";

const SITE_URL = "https://www.wgaipartners.com";
const SITE_DESCRIPTION =
  "WG Partners (Wyatt & Grundvig) uses AI to replace your legacy systems and off-the-shelf SaaS with custom software you own outright. One fixed engagement. No recurring fees.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "WG Partners | AI Modernization & Legacy Systems Consulting",
  description: SITE_DESCRIPTION,
  alternates: { canonical: "./" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "WG Partners",
    title: "WG Partners | Own Your Software. Forever.",
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: "WG Partners | Own Your Software. Forever.",
    description: SITE_DESCRIPTION,
  },
};

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": `${SITE_URL}/#org`,
  name: "Wyatt & Grundvig Partners",
  alternateName: "WG Partners",
  description: SITE_DESCRIPTION,
  url: SITE_URL,
  email: "roger@wgaipartners.com",
  telephone: "+1-910-297-0929",
  areaServed: "US",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
      </head>
      <body className="font-sans antialiased">
        {children}
        <Toaster richColors position="top-center" />
        <Analytics />
      </body>
    </html>
  );
}
