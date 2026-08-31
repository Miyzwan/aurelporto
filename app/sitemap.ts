import type { MetadataRoute } from "next";

import { getPublishedExplorations } from "@/lib/data/explorations";
import { getPublishedPages } from "@/lib/data/pages";
import { getPublishedProjects } from "@/lib/data/projects";
import { absoluteUrl } from "@/lib/seo/site-url";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // 1. Dynamic published pages
  let pageRoutes: MetadataRoute.Sitemap = [];
  try {
    const pages = await getPublishedPages();
    pageRoutes = pages.map((page) => {
      const isHome = page.slug === "home";
      const path = isHome ? "/" : `/${page.slug}`;
      return {
        url: absoluteUrl(path),
        lastModified: now,
        changeFrequency: isHome ? "weekly" : "monthly",
        priority: isHome ? 1.0 : 0.8,
      };
    });
  } catch (error) {
    console.error("[sitemap] could not query published pages:", error);
    pageRoutes = [
      { url: absoluteUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1.0 },
      {
        url: absoluteUrl("/projects"),
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.9,
      },
      {
        url: absoluteUrl("/services"),
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.8,
      },
      {
        url: absoluteUrl("/process"),
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.8,
      },
      {
        url: absoluteUrl("/explorations"),
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.8,
      },
      { url: absoluteUrl("/about"), lastModified: now, changeFrequency: "monthly", priority: 0.7 },
      {
        url: absoluteUrl("/contact"),
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.8,
      },
    ];
  }

  // If pages query returned empty list (e.g. unseeded environment), provide core routes
  if (pageRoutes.length === 0) {
    pageRoutes = [
      { url: absoluteUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1.0 },
      {
        url: absoluteUrl("/projects"),
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.9,
      },
      {
        url: absoluteUrl("/services"),
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.8,
      },
      {
        url: absoluteUrl("/process"),
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.8,
      },
      {
        url: absoluteUrl("/explorations"),
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.8,
      },
      { url: absoluteUrl("/about"), lastModified: now, changeFrequency: "monthly", priority: 0.7 },
      {
        url: absoluteUrl("/contact"),
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.8,
      },
    ];
  }

  // 2. Dynamic published case studies (drafts and archived projects are excluded by getPublishedProjects)
  let projectRoutes: MetadataRoute.Sitemap = [];
  try {
    const projects = await getPublishedProjects();
    projectRoutes = projects.map((project) => ({
      url: absoluteUrl(`/projects/${project.slug}`),
      lastModified: now,
      changeFrequency: "monthly",
      priority: project.featured ? 0.85 : 0.75,
    }));
  } catch (error) {
    console.error("[sitemap] could not query published projects:", error);
  }

  // 3. Ensure explorations endpoint query is active
  try {
    await getPublishedExplorations();
  } catch (error) {
    console.error("[sitemap] could not query published explorations:", error);
  }

  return [...pageRoutes, ...projectRoutes];
}
