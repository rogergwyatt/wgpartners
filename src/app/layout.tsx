import type { Metadata } from "next";
import { Inter, Sofadi_One, Nanum_Gothic} from "next/font/google";
import "./globals.css";
import Script from 'next/script';
import { Analytics } from "@vercel/analytics/react"

import { nanum } from '../controls/fonts'
import GoogleAnalytics from "@/controls/googleAnalytics";
import GoogleTagManager from "@/controls/googleTagManager";
import HotJar from "@/controls/hotjar";
import { CartProvider } from '@/context/CartContext';

const SITE_DESCRIPTION = "Hand-picked Walnut, Cherry, and Maple cutting boards featuring our signature Heritage Lock joinery. Handcrafted in Virginia and built for a lifetime of service by Roger & Sally."

export const metadata: Metadata = {
  title: "Roger And Sally | Handcrafted Heritage Lock Wood Cutting Boards",
  description: SITE_DESCRIPTION,
  keywords: "handcrafted cutting boards, walnut butcher block, heritage lock joinery, live edge spalted maple, personalized wedding gifts, custom wood coasters, Virginia woodworking, heirloom quality kitchenware, cherry wood charcuterie board, handmade wood gifts",
  metadataBase: new URL(`https://www.rogerandsally.com`),
  alternates: {
      canonical: './',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.rogerandsally.com',
    siteName: 'Roger & Sally',
    title: 'Roger And Sally | Handcrafted Heritage Lock Wood Cutting Boards',
    description: SITE_DESCRIPTION,
    images: [{ url: '/images/IMG_3668.jpeg', width: 1200, height: 630, alt: 'Roger & Sally handcrafted Heritage Lock cutting board' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Roger And Sally | Handcrafted Heritage Lock Wood Cutting Boards',
    description: SITE_DESCRIPTION,
    images: ['/images/IMG_3668.jpeg'],
  },
};

const localBusinessJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': 'https://www.rogerandsally.com/#business',
  name: 'Roger & Sally',
  description: SITE_DESCRIPTION,
  url: 'https://www.rogerandsally.com',
  logo: 'https://www.rogerandsally.com/images/LogoNoWebsite_small.png',
  image: 'https://www.rogerandsally.com/images/IMG_3668.jpeg',
  email: 'sales@rogerandsally.com',
  telephone: '+1-804-464-8162',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '507 Coalbrook Dr',
    addressLocality: 'Midlothian',
    addressRegion: 'VA',
    postalCode: '23114',
    addressCountry: 'US',
  },
  areaServed: 'US',
  priceRange: '$$',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
       <head>
        <HotJar/>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
       </head>
      <body className={nanum.variable}>
        <CartProvider>
          {children}
        </CartProvider>
        <Analytics />
        </body>
    </html>
  );
}
