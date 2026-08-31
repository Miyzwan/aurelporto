import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/seo/site-url";

const PRIVATE_PATHS = ["/admin", "/admin/", "/auth", "/auth/", "/admin/preview/"];

export default function robots(): MetadataRoute.Robots {
  // DEP-004: there is no staging Supabase project, so a Preview deployment
  // serves real production content from a *.vercel.app origin. Indexing one
  // would publish the portfolio under a second canonical host.
  const vercelEnv = process.env.VERCEL_ENV;
  if (vercelEnv && vercelEnv !== "production") {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: PRIVATE_PATHS,
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
