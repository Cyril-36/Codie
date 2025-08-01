import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "Codie — AI Code Review Assistant",
  description: "Explainable, secure, and efficient AI-powered code reviews",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen bg-neutral-950 text-neutral-100 antialiased">
        <div className="flex min-h-screen">
          <aside className="w-64 border-r border-neutral-800 p-4 hidden md:block">
            <h1 className="text-xl font-semibold">Codie</h1>
            <nav className="mt-6 space-y-2 text-sm">
              <a className="block hover:text-brand" href="/">Dashboard</a>
              <a className="block hover:text-brand" href="/repo/intelligence">Repo Intelligence</a>
              <a className="block hover:text-brand" href="/runtime">Runtime</a>
              <a className="block hover:text-brand" href="/security">Security</a>
              <a className="block hover:text-brand" href="/tests">Tests</a>
              <a className="block hover:text-brand" href="/refactor">Refactor Planner</a>
              <a className="block hover:text-brand" href="/settings">Settings</a>
            </nav>
          </aside>
          <main className="flex-1 p-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
