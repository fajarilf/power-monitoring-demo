import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono, Inter } from "next/font/google";
import ConnectionStatus from "@/components/ConnectionStatus";
import LiveClock from "@/components/LiveClock";
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
        <header className="border-b border-border-soft bg-gradient-to-b from-[#0d0f12] to-background">
          <div className="mx-auto flex max-w-6xl items-center gap-7 px-8 py-[18px]">
            <div className="flex items-center gap-2.5 font-display text-sm font-semibold tracking-wide">
              <span className="flex gap-[3px]">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-phase-r" />
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-phase-s" />
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-phase-t" />
              </span>
              GRID/MON
            </div>
            <div className="ml-auto flex items-center gap-5">
              <LiveClock />
              <ConnectionStatus />
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-8 py-4">{children}</main>
      </body>
    </html>
  );
}
