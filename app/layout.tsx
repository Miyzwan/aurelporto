import type { Metadata } from "next";

import { editorialSerif, neutralSans } from "@/lib/fonts";
import { generateRootMetadata } from "@/lib/seo/metadata";
import { cn } from "@/lib/utils/cn";

import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  try {
    return await generateRootMetadata();
  } catch (error) {
    console.error("[RootLayout] failed to generate root metadata:", error);
    return {
      title: "Gabrielle Aurelia — Interior Designer",
      description: "Editorial interior architecture and spatial curation.",
    };
  }
}

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
