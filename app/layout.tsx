import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "TravelVault — Secure Travel Document Management",
  description:
    "Encrypt, store, and manage your travel documents. Passports, visas, insurance — all in one secure vault with expiry reminders and selective sharing.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="font-display" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
