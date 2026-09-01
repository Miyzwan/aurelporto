import type { NextConfig } from "next";

type SupabaseStorageImagePattern = {
  protocol: "http" | "https";
  hostname: string;
  port?: string;
  pathname: string;
};

function supabaseStorageImagePattern(): SupabaseStorageImagePattern {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();

  if (!rawUrl) {
    throw new Error(
      "Supabase environment is not configured: set NEXT_PUBLIC_SUPABASE_URL before starting the application.",
    );
  }

  let url: URL;

  try {
    url = new URL(rawUrl);
  } catch {
    throw new Error("Invalid NEXT_PUBLIC_SUPABASE_URL: set it to the full Supabase project URL.");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Invalid NEXT_PUBLIC_SUPABASE_URL: URL protocol must be http or https.");
  }

  return {
    protocol: url.protocol.slice(0, -1) as "http" | "https",
    hostname: url.hostname,
    ...(url.port ? { port: url.port } : {}),
    pathname: "/storage/v1/object/public/**",
  };
}

const nextConfig: NextConfig = {
  // Version skew protection. Every build mints new Server Action ids, so a tab
  // opened before a deploy posts an id the new build does not know and the
  // request fails with "Failed to find Server Action" — which the admin login
  // surfaced as a generic error page. With a deployment id, Next detects the
  // mismatch and forces a full reload instead of failing the request.
  deploymentId: process.env.VERCEL_DEPLOYMENT_ID,
  images: {
    remotePatterns: [supabaseStorageImagePattern()],
  },
};

export default nextConfig;
