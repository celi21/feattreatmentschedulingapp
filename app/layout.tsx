import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Treatment Scheduler",
  description: "Simple treatment scheduling app"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="border-b">
          <div className="container flex items-center justify-between py-4">
            <a href="/" className="font-semibold text-lg">Treatment Scheduler</a>
            <nav className="flex gap-4">
              <a className="btn" href="/admin">Admin</a>
              <a className="btn" href="https://vercel.com" target="_blank">Deploy</a>
            </nav>
          </div>
        </header>
        <main className="container py-8">{children}</main>
        <footer className="border-t mt-12">
          <div className="container py-6 text-sm text-gray-500">
            Built with Next.js, Prisma, and Postgres.
          </div>
        </footer>
      </body>
    </html>
  );
}
