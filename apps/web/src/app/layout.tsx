import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HighlightHero",
  description:
    "Transform your favorite sports moments into stylized, viral-ready animations with high-fidelity sound synchronization.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
