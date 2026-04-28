import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Capacitación Vendedores | Invierno 2026",
  description:
    "Capacitación de excursiones, protocolos y evaluación final.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        {children}
      </body>
    </html>
  );
}
