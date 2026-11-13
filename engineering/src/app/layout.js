import "./globals.css";

import { Google_Sans_Flex, Google_Sans_Code } from "next/font/google";

import ClientLayout from "@/components/ClientLayout";
import Menu from "@/components/Menu";
import Footer from "@/components/Footer";
import DitherCursorTrail from "@/components/DitherCursorTrail";
import { meta } from "@/lib/meta";
import { HANDOFF_SCRIPT } from "@/lib/handoff";
import { ANALYTICS } from "@/content/shared";

const googleSansFlex = Google_Sans_Flex({
  variable: "--font-google-sans-flex",
  subsets: ["latin"],
});

const googleSansCode = Google_Sans_Code({
  variable: "--font-google-sans-code",
  subsets: ["latin"],
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
        {/* frame handed over by koyotec.digital's "Découvrir Engineering" panel, shown before first paint */}
        <script dangerouslySetInnerHTML={{ __html: HANDOFF_SCRIPT }} />
        {/* cookieless analytics, same Umami website as koyotec.digital */}
        {ANALYTICS.id ? (
          <script defer src={ANALYTICS.src} data-website-id={ANALYTICS.id} data-domains="www.koyotec.digital,koyotec.digital" />
        ) : null}
      </head>
      <body>
        <ClientLayout>
          <Menu />
          {children}
          <Footer />
          <DitherCursorTrail />
        </ClientLayout>
      </body>
    </html>
  );
}
