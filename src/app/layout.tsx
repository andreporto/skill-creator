import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Skill Creator",
  description: "Transform your text demands into production-ready agent skills.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
