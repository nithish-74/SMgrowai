import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { TRPCReactProvider } from "@/lib/trpc/client";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-satoshi",
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SMgrowai — Your AI CMO",
    template: "%s | SMgrowai"
  },
  description: "SMgrowai is your AI Chief Marketing Officer. Research, create and post to Instagram and Twitter — on autopilot.",
  openGraph: {
    title: "SMgrowai — Your AI CMO",
    description: "SMgrowai is your AI Chief Marketing Officer. Research, create and post to Instagram and Twitter — on autopilot.",
    url: "https://smgrowai.com",
    siteName: "SMgrowai",
    images: [
      {
        url: "https://smgrowai.com/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SMgrowai — Your AI CMO",
    description: "SMgrowai is your AI Chief Marketing Officer. Research, create and post to Instagram and Twitter — on autopilot.",
    images: ["https://smgrowai.com/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetBrainsMono.variable}`}>
        <SessionProvider>
          <TRPCReactProvider>{children}</TRPCReactProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
