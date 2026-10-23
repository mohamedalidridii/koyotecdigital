import "./globals.css";

export const metadata = {
  title: "Leïla Gharbi — Architecte",
  description: "Concept by KOYOTEC",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
