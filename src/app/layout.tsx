import type { Metadata } from "next";
import { Noto_Naskh_Arabic, Playfair_Display, Space_Grotesk } from "next/font/google";
import "./globals.css";
import NavBar from "../components/NavBar";
import ServiceWorker from "../components/ServiceWorker";
import { I18nProvider } from "../lib/i18n";

import Script from "next/script";

const display = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display"
});

const sans = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans"
});

const arabic = Noto_Naskh_Arabic({
  subsets: ["arabic"],
  variable: "--font-arabic"
});

export const metadata: Metadata = {
  metadataBase: new URL("https://r-ramadhan.vercel.app"),
  title: {
    default: "R-Ramadhan - Your Personal Ramadan Companion",
    template: "%s | R-Ramadhan"
  },
  description: "Experience a more organized and spiritual Ramadan with R-Ramadhan. Tracker, Quran, Hadith, Quiz, and health features all in one place.",
  manifest: "/manifest.json",
  keywords: ["Ramadan", "Islamic App", "Ramadan Calendar", "Quran", "Hadith", "Ramadan Tracker", "Zakat Calculator"],
  authors: [{ name: "R-Ramadhan Team" }],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "R-Ramadhan",
    description: "Your personal Ramadan companion for a spiritual journey.",
    url: "https://r-ramadhan.vercel.app",
    siteName: "R-Ramadhan",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "R-Ramadhan",
    description: "Your personal Ramadan companion",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/icon.png",
  }
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "R-Ramadhan",
  "url": "https://r-ramadhan.vercel.app",
  "description": "Your personal Ramadan companion for a spiritual journey.",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://r-ramadhan.vercel.app/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
};

export const viewport = {
  themeColor: "#0f172a",
};

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${arabic.variable}`}>
      <head>
        <meta name="google-site-verification" content="b-jJc-example-verification-code" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
              `}
            </Script>
          </>
        )}
      </head>
      <body className="min-h-screen font-sans">
        <I18nProvider>
          <div className="ramadan-shell ramadan-pattern min-h-screen">
            <ServiceWorker />
            <NavBar />
            <div className="pattern min-h-screen">
              <div className="ornament-overlay min-h-screen">
                {children}
                <Analytics />
                <SpeedInsights />
              </div>
            </div>
          </div>
        </I18nProvider>
      </body>
    </html>
  );
}
