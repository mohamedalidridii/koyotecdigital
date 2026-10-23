import "../globals.css";
import { notFound } from "next/navigation";
import { Cormorant_Garamond, Italiana, DM_Mono, Host_Grotesk } from "next/font/google";

import ClientLayout from "@/client-layout";
import DictProvider from "@/i18n/DictProvider";
import { locales, isLocale, getDict } from "@/i18n/config";

import Preloader from "@/components/Preloader/Preloader";
import Menu from "@/components/Menu/Menu";
import Footer from "@/components/Footer/Footer";
import Selection from "@/components/Selection/Selection";
import Cursor from "@/components/Cursor/Cursor";
import TransitionProvider from "@/providers/TransitionProvider";

const cormorant = Cormorant_Garamond({
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-cormorant",
});

const italiana = Italiana({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-italiana",
});

const hostGrotesk = Host_Grotesk({
  weight: ["300", "400", "500"],
  subsets: ["latin"],
  variable: "--font-host-grotesk",
});

const dmMono = DM_Mono({
  weight: ["300", "400", "500"],
  subsets: ["latin"],
  variable: "--font-dm-mono",
});

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const dict = getDict(lang);
  return {
    title: { default: dict.meta.title, template: "%s — Maison Aurèle" },
    description: dict.meta.description,
    alternates: { languages: { fr: "/fr", en: "/en" } },
  };
}

export default async function RootLayout({ children, params }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  return (
    <html lang={lang}>
      <body
        className={`${cormorant.variable} ${italiana.variable} ${hostGrotesk.variable} ${dmMono.variable}`}
      >
        <DictProvider lang={lang}>
          <TransitionProvider>
            <ClientLayout footer={<Footer />}>
              <Preloader />
              <Menu />
              {children}
            </ClientLayout>
            <Selection />
            <Cursor />
          </TransitionProvider>
        </DictProvider>
        <div className="grain" aria-hidden="true" />
      </body>
    </html>
  );
}
