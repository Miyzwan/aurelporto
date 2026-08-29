import type { Metadata } from "next";

import { editorialSerif, neutralSans } from "@/lib/fonts";
import { cn } from "@/lib/utils/cn";

import "./globals.css";

/**
 * Placeholder metadata only. INT-015 replaces this with database-driven
 * defaults read from `site_settings`; no business copy belongs here.
 */
export const metadata: Metadata = {
  title: "Interior Design Portfolio",
  description: "Interior design portfolio.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn(editorialSerif.variable, neutralSans.variable, "h-full antialiased")}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
