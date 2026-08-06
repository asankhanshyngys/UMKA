import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "УМКА — Английский язык",
  description:
    "Изучайте английский по подписке или покупайте отдельные темы и видеоуроки.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="h-full antialiased">
      <body className="min-h-full bg-background font-sans">{children}</body>
    </html>
  );
}
