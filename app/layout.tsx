import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Git Visual Emulator — Master Git Visually",
  description:
    "Understand branches, merges, rebases and commit history through an interactive visual simulator designed for developers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
