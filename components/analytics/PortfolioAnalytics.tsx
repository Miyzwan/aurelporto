"use client";

import Script from "next/script";

/**
 * Injects Vercel Web Analytics and Speed Insights scripts safely in production environments.
 * Non-blocking, deferred execution with zero effect on Core Web Vitals.
 */
export function PortfolioAnalytics() {
  const isProd = process.env.NODE_ENV === "production";
  if (!isProd) return null;

  return (
    <>
      <Script
        id="vercel-analytics-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };`,
        }}
      />
      <Script
        id="vercel-analytics-script"
        strategy="afterInteractive"
        src="/_vercel/insights/script.js"
      />
      <Script
        id="vercel-speed-insights-script"
        strategy="afterInteractive"
        src="/_vercel/speed-insights/script.js"
      />
    </>
  );
}
