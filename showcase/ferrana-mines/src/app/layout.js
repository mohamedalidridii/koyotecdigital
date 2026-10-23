import "./globals.css";

import { ViewTransitions } from "next-view-transitions";

import ClientLayout from "@/components/ClientLayout";
import Footer from "@/components/Footer";
import Menu, { MenuProvider } from "@/components/Menu";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "Ferrana Mines — Mines & métaux",
  description: "Concept by KOYOTEC",
};

export default function RootLayout({ children }) {
  return (
    <ViewTransitions>
      <html lang="en">
        <body>
          <ClientLayout>
            <MenuProvider>
              <Navbar />
              <Menu />

              <div data-page-shell>
                {children}
                <Footer />
              </div>
            </MenuProvider>
          </ClientLayout>
        </body>
      </html>
    </ViewTransitions>
  );
}
