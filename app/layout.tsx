import "./globals.css";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";
import { type Metadata } from "next";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"] });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "ryznAI - Deep Learning through Reasoning",
  description: "Analyze files and web pages with AI assistance",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable}`}
      >
        <body className={inter.className}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 relative overflow-x-hidden">
              {/* Net Background Pattern */}
              <div className="absolute inset-0 z-0 opacity-10">
                <svg
                  width="100%"
                  height="100%"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <pattern
                    id="net-pattern"
                    width="40"
                    height="40"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M0 20 L40 20 M20 0 L20 40"
                      stroke="currentColor"
                      strokeWidth="0.5"
                    />
                  </pattern>
                  <rect width="100%" height="100%" fill="url(#net-pattern)" />
                </svg>
              </div>

              <div className="relative z-10">{children}</div>
              <Analytics />
            </div>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
