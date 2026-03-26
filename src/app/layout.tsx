import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shuffle — Signal Deck",
  description: "Explore signals of the world",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="antialiased">{children}</body>
    </html>
  );
}
