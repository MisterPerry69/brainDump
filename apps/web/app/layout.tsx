import type { Metadata } from "next";
import { Archivo, JetBrains_Mono } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import "@karakeep/tailwind-config/globals.css";

import type { Viewport } from "next";
import React from "react";
import { Toaster } from "@/components/ui/sonner";
import Providers from "@/lib/providers";
import { THEME_COLORS } from "@/lib/themeColors";
import { getUserLocalSettings } from "@/lib/userLocalSettings/userLocalSettings";
import { getServerAuthSession } from "@/server/auth";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { clientConfig } from "@karakeep/shared/config";

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["500", "700", "800", "900"],
  variable: "--font-archivo",
  fallback: ["sans-serif"],
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
  fallback: ["monospace"],
});

export const metadata: Metadata = {
  title: "BrainDump",
  applicationName: "BrainDump",
  description: "Brain dump personale: salva da ovunque, smista in cartelle.",
  icons: {
    // No media queries: crawlers (e.g. Google's favicon fetcher) skip icons
    // that are conditional on one. favicon.svg adapts to dark mode itself.
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-icon.png",
  },
  appleWebApp: {
    capable: true,
    title: "BrainDump",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  // Values match the `--background` token in tooling/tailwind/globals.css.
  // These cover the pre-hydration and no-JavaScript cases; once mounted,
  // <ThemeColorSync /> updates them to follow an in-app theme override.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: THEME_COLORS.light },
    { media: "(prefers-color-scheme: dark)", color: THEME_COLORS.dark },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerAuthSession();
  const userSettings = await getUserLocalSettings();
  const isRTL = userSettings.lang === "ar";
  return (
    <html
      lang={userSettings.lang}
      dir={isRTL ? "rtl" : "ltr"}
      suppressHydrationWarning
    >
      <body className={`${archivo.variable} ${mono.variable} font-sans`}>
        <NuqsAdapter>
          <Providers
            session={session}
            clientConfig={clientConfig}
            userLocalSettings={await getUserLocalSettings()}
          >
            {children}
            <ReactQueryDevtools initialIsOpen={false} />
            <Toaster />
          </Providers>
        </NuqsAdapter>
      </body>
    </html>
  );
}
