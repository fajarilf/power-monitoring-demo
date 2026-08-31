import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono, Inter } from "next/font/google";
import { AppHeader } from "@/components/layout/app-header";
import { LiveReadingProvider } from "@/features/measurements";
import Providers from "./providers";
import "./globals.css";

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Power Monitoring",
  description: "Power consumption dashboard and log history",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${plexSans.variable} ${plexMono.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background font-sans text-text-primary">
        <Providers>
          <LiveReadingProvider>
            <AppHeader />
            <main className="mx-auto w-full max-w-6xl flex-1 px-8 py-4">{children}</main>
          </LiveReadingProvider>
        </Providers>
      </body>
    </html>
  );
}
