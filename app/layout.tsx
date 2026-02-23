import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { LanguageProvider } from "@/components/LanguageContext";
import { GamificationProvider } from "@/components/GamificationContext";
import { DeviceProvider } from "@/components/DeviceContext";
import { DeviceFrame } from "@/components/DeviceFrame";
import { Providers } from "./providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Syntix Product Ideation",
  description: "High-stakes business idea validation platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={cn(inter.variable, "antialiased font-sans")}
        suppressHydrationWarning
      >
        <Providers>
          <LanguageProvider>
            <GamificationProvider>
              <DeviceProvider>
                <DeviceFrame>
                  {children}
                </DeviceFrame>
              </DeviceProvider>
            </GamificationProvider>
          </LanguageProvider>
        </Providers>
      </body>
    </html>
  );
}
