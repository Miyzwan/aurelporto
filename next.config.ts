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

/**
 * Next 16 refuses to optimize images whose host resolves to a private or
 * loopback address, as SSRF protection. A local `supabase start` serves storage
 * from 127.0.0.1, so every portfolio image 400s in local development until the
 * restriction is lifted. It is lifted only for a loopback Supabase host: a
 * hosted project keeps the protection.
 */
function supabaseHostIsLoopback(): boolean {
  const hostname = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
    ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL.trim()).hostname
    : "";

  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
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
    dangerouslyAllowLocalIP: supabaseHostIsLoopback(),
  },
};

export default nextConfig;
