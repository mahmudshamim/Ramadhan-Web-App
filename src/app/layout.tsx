import type { Metadata } from "next";
import { Playfair_Display, Space_Grotesk } from "next/font/google";
import "./globals.css";
import NavBar from "../components/NavBar";
import ServiceWorker from "../components/ServiceWorker";
import { I18nProvider } from "../lib/i18n";

const display = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display"
});

const sans = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans"
});

export const metadata: Metadata = {
  title: "R-Ramadhan",
  description: "Your personal Ramadan companion",
  manifest: "/manifest.json"
};

export const viewport = {
  themeColor: "#0f172a",
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body className="min-h-screen font-sans">
        <I18nProvider>
          <div className="ramadan-shell ramadan-pattern min-h-screen">
            <ServiceWorker />
            <NavBar />
            <div className="pattern min-h-screen">
              <div className="ornament-overlay min-h-screen">
                {children}
              </div>
            </div>
          </div>
        </I18nProvider>
      </body>
    </html>
  );
}
