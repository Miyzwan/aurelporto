import { describe, expect, it } from "vitest";

import { placeholderCtaContent, placeholderHeroContent } from "@/lib/content/placeholder-home";
import { placeholderProjects } from "@/lib/content/placeholder-projects";
import { placeholderSiteSettings } from "@/lib/content/placeholder-shell";

/**
 * Guards the CLIENT_CONTEXT section 29 content rules against drift. These are
 * not style preferences: publishing any of them would misrepresent the client.
 */
describe("client content rules", () => {
  const allCopy = [
    ...placeholderProjects.flatMap((project) => [
      project.title,
      project.summary,
      project.projectType,
    ]),
    placeholderHeroContent.headline,
    placeholderHeroContent.subheadline,
    placeholderHeroContent.eyebrow,
    placeholderCtaContent.title,
    placeholderCtaContent.body,
    placeholderSiteSettings.professionalRole,
  ]
    .join(" ")
    .toLowerCase();

  // Rule 3: a render is not a built project.
  it.each(["completed project", "built project", "finished interior", "delivered project"])(
    "never describes work as %s",
    (phrase) => {
      expect(allCopy).not.toContain(phrase);
    },
  );

  // Rule 4 and section 33: no inflated positioning.
  it.each([
    "award-winning",
    "studio founder",
    "principal designer",
    "senior interior designer",
    "architect",
    "expert",
    "luxury specialist",
  ])("never claims %s", (phrase) => {
    expect(allCopy).not.toContain(phrase);
  });

  // Rule 3: every project is concept or visualization work until construction
  // status is confirmed.
  it("marks every project as concept work", () => {
    for (const project of placeholderProjects) {
      expect(project.projectStatus).toBe("concept");
    }
  });

  // Section 32: no commission-seeking CTA until the client confirms she takes
  // client work.
  it("does not use a commission CTA", () => {
    expect(placeholderCtaContent.ctaLabel.toLowerCase()).not.toContain("start a project");
  });

  // Section 4: contact details stay unpublished until verified.
  it("publishes no unverified contact detail", () => {
    expect(placeholderSiteSettings.email).toBeNull();
    expect(placeholderSiteSettings.phone).toBeNull();
    expect(placeholderSiteSettings.whatsapp).toBeNull();
  });
});
