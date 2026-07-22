import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import Nav from "@/components/Nav";

// Toda la app requiere sesión, así que no tiene sentido pre-generarla como
// HTML estático en el build (además, NextAuth necesita una request real
// para resolver NEXTAUTH_URL, cosa que no existe todavía en build time).
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Generador de Landing Page",
  description: "Sube tus secciones de Canva y exporta el JSON para Elementor",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <Providers>
          <Nav />
          {children}
        </Providers>
      </body>
    </html>
  );
}
