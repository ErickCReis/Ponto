import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";

import { cn } from "@acme/ui";
import { ThemeProvider, ThemeToggle } from "@acme/ui/theme";
import { Toaster } from "@acme/ui/toast";

import { env } from "~/env";
import { TRPCReactProvider } from "~/trpc/react";
import { Header } from "./_components/header";

import "~/app/globals.css";

export const runtime = "edge";
export const preferredRegion = ["iad1"];

export const metadata: Metadata = {
  metadataBase: new URL(
    env.VERCEL_ENV === "production"
      ? "https://ponto-six.vercel.app"
      : "http://localhost:3000",
  ),
  title: "Ponto",
  description: "Simples e Ponto",
  openGraph: {
    title: "Ponto",
    description: "Simples e Ponto",
    url: "https://ponto-six.vercel.app",
    siteName: "Ponto",
  },
  twitter: {
    card: "summary_large_image",
    site: "@erickreis25",
    creator: "@erickreis25",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="pt-br" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans text-foreground antialiased",
          GeistSans.variable,
          GeistMono.variable,
        )}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TRPCReactProvider>
            <div className="container flex h-screen flex-col">
              <Header />
              <div className="py-4 sm:py-6">{props.children}</div>
            </div>
          </TRPCReactProvider>

          <div className="absolute bottom-4 right-4">
            <ThemeToggle />
          </div>
          <Toaster />
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
