import type { Metadata } from "next";
import "./globals.css";
import "./login.css";

export const metadata: Metadata = {
  title: "Pétala — Florería contemporánea",
  description: "Arreglos florales frescos con entrega en Lima.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  );
}
