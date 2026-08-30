import { DISALLOWED_PII_KEYS, type PortfolioEventMap, type PortfolioEventName } from "./events";

declare global {
  interface Window {
    va?: (action: string, params: { name: string; data?: Record<string, unknown> }) => void;
  }
}

/**
 * Sanitizes an analytics payload to strictly enforce privacy compliance.
 * Drops nullish fields, strips all disallowed PII keys, and casts values to primitives.
 */
export function sanitizeAnalyticsProperties(
  properties?: Record<string, unknown>,
): Record<string, string | number | boolean> | undefined {
  if (!properties || typeof properties !== "object") return undefined;

  const sanitized: Record<string, string | number | boolean> = {};

  for (const [key, rawValue] of Object.entries(properties)) {
    const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, "");

    // PII Guard
    if (DISALLOWED_PII_KEYS.has(normalizedKey) || DISALLOWED_PII_KEYS.has(key.toLowerCase())) {
      continue;
    }

    if (rawValue === null || rawValue === undefined) {
      continue;
    }

    if (
      typeof rawValue === "string" ||
      typeof rawValue === "number" ||
      typeof rawValue === "boolean"
    ) {
      sanitized[key] = rawValue;
    } else {
      sanitized[key] = String(rawValue);
    }
  }

  return Object.keys(sanitized).length > 0 ? sanitized : undefined;
}

/**
 * Unified privacy-safe analytics dispatcher for all portfolio user interactions.
 * Completely immune to runtime errors: failure to track will never crash or disrupt UI actions.
 */
export function trackPortfolioEvent<E extends PortfolioEventName>(
  eventName: E,
  properties?: PortfolioEventMap[E],
): void {
  try {
    if (typeof window === "undefined") return;

    const sanitizedData = sanitizeAnalyticsProperties(
      properties as Record<string, unknown> | undefined,
    );

    // 1. Dispatch to Vercel Web Analytics if installed on window
    if (typeof window.va === "function") {
      window.va("event", {
        name: eventName,
        data: sanitizedData,
      });
    }

    // 2. Dispatch DOM custom event for testing / debug observers
    window.dispatchEvent(
      new CustomEvent("portfolio_event", {
        detail: {
          name: eventName,
          data: sanitizedData,
        },
      }),
    );

    // 3. Debug logging in non-production environments
    if (process.env.NODE_ENV !== "production") {
      console.debug(`[analytics] ${eventName}`, sanitizedData ?? "(no data)");
    }
  } catch (error) {
    // Non-blocking: analytics failures must never interrupt user experience
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[analytics] failed to track event ${eventName}:`, error);
    }
  }
}
