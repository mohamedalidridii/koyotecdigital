import "./globals.css";

import { Google_Sans_Flex, Google_Sans_Code } from "next/font/google";

import ClientLayout from "@/components/ClientLayout";
import Menu from "@/components/Menu";
import Footer from "@/components/Footer";
import LangHint from "@/components/LangHint";
import { meta } from "@/lib/meta";
import { ANALYTICS } from "@/content/shared";
import JsonLd from "@/components/JsonLd";
import { ORGANIZATION } from "@/lib/schema";

// Next has no metric data for these two families, so it cannot build matched fallbacks: we declare our
// own (globals.css, "GSF Fallback" / "GSC Fallback", width measured against Arial). Text keeps its line
// breaks when the web font swaps in, so the page does not jump (CLS).
const googleSansFlex = Google_Sans_Flex({
  variable: "--font-google-sans-flex",
  subsets: ["latin"],
  fallback: ["GSF Fallback", "GSF Fallback Linux", "sans-serif"],
  adjustFontFallback: false,
});

const googleSansCode = Google_Sans_Code({
  variable: "--font-google-sans-code",
  subsets: ["latin"],
  fallback: ["GSC Fallback", "monospace"],
  adjustFontFallback: false,
});

export const metadata = meta("fr", null);

export default function RootLayout({ children }) {
  return (
    <html
      lang="fr"
      className={`${googleSansFlex.variable} ${googleSansCode.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* cookieless analytics, same Umami website as koyotec.digital */}
        {ANALYTICS.id ? (
          <script defer src={ANALYTICS.src} data-website-id={ANALYTICS.id} data-domains="www.koyotec.digital,koyotec.digital" data-performance="true" data-errors="true" />
        ) : null}
      </head>
      <body>
        <JsonLd data={ORGANIZATION} />
        <ClientLayout>
          <Menu />
          <LangHint />
          {children}
          <Footer />
        </ClientLayout>
      </body>
    </html>
  );
}
