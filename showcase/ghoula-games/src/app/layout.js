import "./globals.css";

import ClientLayout from "@/client-layout";

export const metadata = {
  title: "Ghoula Games",
  description: "Concept by KOYOTEC",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
