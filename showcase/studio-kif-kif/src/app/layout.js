import { Host_Grotesk, DM_Mono, Shadows_Into_Light } from "next/font/google";
import ClientLayout from "@/components/ClientLayout";
import "./globals.css";

const hostGrotesk = Host_Grotesk({
  variable: "--font-host-grotesk",
  subsets: ["latin"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

const shadowsIntoLight = Shadows_Into_Light({
  variable: "--font-shadows-into-light",
  subsets: ["latin"],
  weight: "400",
});

export const metadata = {
  title: "Studio Kif-Kif — Studio d'illustration",
  description: "Concept by KOYOTEC",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${hostGrotesk.variable} ${dmMono.variable} ${shadowsIntoLight.variable}`}
    >
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
