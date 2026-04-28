import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CapacitaciónPro - Plataforma de formación",
  description: "Plataforma de capacitación interna para vendedores de Adventure Center",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased bg-slate-50">
        {children}
      </body>
    </html>
  );
}
