import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Comprar consulta · Protótipo Starbem",
  description: "Protótipo mobile da nova UX de descontos B2C (compra avulsa).",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
