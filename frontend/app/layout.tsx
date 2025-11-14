// frontend/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner" // <-- CHANGED: Import from sonner

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LUMEN-Agent",
  description: "Conversational Financial Intelligence",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          {children}
          <Toaster /> {/* <-- THIS IS THE SONNER TOASTER */}
        </body>
      </html>
    </ClerkProvider>
  );
}