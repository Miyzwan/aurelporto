import { beforeEach, describe, expect, it, vi } from "vitest";

import { PRD_EVENT_NAMES } from "@/lib/analytics/events";
import { sanitizeAnalyticsProperties, trackPortfolioEvent } from "@/lib/analytics/tracker";

describe("Analytics and performance instrumentation (INT-017)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete (window as unknown as { va?: unknown }).va;
  });

  describe("PRD event coverage", () => {
    it("contains all 11 required PRD event names", () => {
      const expectedEvents = [
        "hero_view_projects_click",
        "hero_start_project_click",
        "featured_project_click",
        "project_filter_used",
        "project_next_click",
        "service_view",
        "contact_start",
        "contact_submit",
        "whatsapp_click",
        "email_click",
        "instagram_click",
      ];

      for (const eventName of expectedEvents) {
        expect(PRD_EVENT_NAMES).toContain(eventName);
      }
    });
  });

  describe("PII Stripping and Sanitization", () => {
    it("strips sensitive personal data (email, phone, name, budget, brief)", () => {
      const dirtyInput = {
        project_type: "Residential",
        name: "John Doe",
        email: "john@example.com",
        phone: "+62812345678",
        budget_range: "$50,000 - $100,000",
        project_brief: "Confidential penthouse design",
        required_service: "Full Interior Design",
        timeline: "6 months",
      };

      const sanitized = sanitizeAnalyticsProperties(dirtyInput);

      expect(sanitized).toBeDefined();
      expect(sanitized).toEqual({
        project_type: "Residential",
        required_service: "Full Interior Design",
        timeline: "6 months",
      });

      // Verify no PII keys exist in sanitized output
      expect(sanitized).not.toHaveProperty("name");
      expect(sanitized).not.toHaveProperty("email");
      expect(sanitized).not.toHaveProperty("phone");
      expect(sanitized).not.toHaveProperty("budget_range");
      expect(sanitized).not.toHaveProperty("project_brief");
    });

    it("drops undefined and null values cleanly", () => {
      const input = {
        category: "hospitality",
        placement: null,
        notes: undefined,
      };

      const sanitized = sanitizeAnalyticsProperties(input);
      expect(sanitized).toEqual({ category: "hospitality" });
    });
  });

  describe("Event Dispatching and Resilience", () => {
    it("dispatches to window.va and DOM CustomEvent when window.va is available", () => {
      const vaMock = vi.fn();
      window.va = vaMock;

      const eventSpy = vi.fn();
      window.addEventListener("portfolio_event", eventSpy);

      trackPortfolioEvent("featured_project_click", {
        project_slug: "menteng-sanctuary",
        project_type: "Residential",
        sort_order: 1,
      });

      expect(vaMock).toHaveBeenCalledWith("event", {
        name: "featured_project_click",
        data: {
          project_slug: "menteng-sanctuary",
          project_type: "Residential",
          sort_order: 1,
        },
      });

      expect(eventSpy).toHaveBeenCalled();
    });

    it("never throws if window.va throws an internal error", () => {
      window.va = vi.fn().mockImplementation(() => {
        throw new Error("Provider tracking failed");
      });

      expect(() => {
        trackPortfolioEvent("contact_start", { source: "inquiry_form" });
      }).not.toThrow();
    });

    it("handles dispatch when window.va is undefined", () => {
      const eventSpy = vi.fn();
      window.addEventListener("portfolio_event", eventSpy);

      expect(() => {
        trackPortfolioEvent("whatsapp_click", { placement: "footer" });
      }).not.toThrow();

      expect(eventSpy).toHaveBeenCalled();
    });
  });
});
