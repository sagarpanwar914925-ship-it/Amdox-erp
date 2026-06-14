import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "sonner";
import { auth } from "@/lib/auth";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

export const metadata: Metadata = {
  title: "AMDOX ERP – AI-Powered Cloud ERP Suite",
  description:
    "Enterprise-grade AI-powered ERP platform for Finance, HR, Supply Chain, Projects & Analytics. Built for modern organizations.",
  keywords: ["ERP", "Enterprise", "Finance", "HR", "Supply Chain", "AI", "Cloud"],
  authors: [{ name: "AMDOX Technologies" }],
  openGraph: {
    title: "AMDOX ERP – AI-Powered Cloud ERP Suite",
    description: "Enterprise-grade AI-powered ERP platform",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geist.variable} font-sans antialiased`}>
        <Providers session={session}>
          {children}
          <Toaster richColors position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
