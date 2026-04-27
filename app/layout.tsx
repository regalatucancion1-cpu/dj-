import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DJ Playlist Generator",
  description: "Genera setlists curados para bodas y eventos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="border-b border-[var(--border)] bg-[var(--surface)]">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link
              href="/"
              className="text-lg font-semibold tracking-tight text-[var(--foreground)]"
            >
              <span className="text-[var(--accent)]">/</span>dj playlist
            </Link>
            <nav className="flex items-center gap-2">
              <Link
                href="/new/preset"
                className="rounded-full border border-[var(--border)] px-4 py-1.5 text-sm hover:border-[var(--accent)]"
              >
                Por tipo de evento
              </Link>
              <Link
                href="/new/event"
                className="rounded-full bg-[var(--accent)] px-4 py-1.5 text-sm font-medium text-black hover:bg-amber-500"
              >
                Brief detallado
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
