import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "SonicAI — AI-Powered Headphone Shopping",
  description: "Discover your perfect headphones through conversational AI. Premium recommendations, intelligent comparisons, and a seamless shopping experience.",
  keywords: ["headphones", "AI shopping", "noise cancelling", "wireless headphones", "earbuds"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="h-full font-sans bg-gray-50/30">{children}</body>
    </html>
  );
}
