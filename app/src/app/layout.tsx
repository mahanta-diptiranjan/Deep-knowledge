import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Nav } from "@/components/nav";
import { countDueReviews } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Deep Knowledge",
  description: "Bite-sized ideas from books, articles and videos — saved, organised and remembered.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Deep Knowledge", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f4ee" },
    { media: "(prefers-color-scheme: dark)", color: "#14130f" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const due = countDueReviews();
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">
        <Nav due={due} />
        <main className="mx-auto w-full max-w-2xl px-4 pb-28 pt-4 md:pb-12 md:pt-20">{children}</main>
      </body>
    </html>
  );
}
