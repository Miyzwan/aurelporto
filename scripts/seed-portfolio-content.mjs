#!/usr/bin/env node
/**
 * Seeds the portfolio content that ships with the repository.
 *
 * Source of truth for every fact below:
 *   - isi.pdf (Gabrielle's CV + portfolio deck)
 *   - CLIENT_CONTEXT_GABRIELLE_AURELIA_INTERIOR_PORTFOLIO.md
 *   - two points confirmed directly by the client (see NEEDS_CONFIRMATION notes)
 *
 * Content rules this file obeys (CLAUDE.md, "Content truth rules"):
 *   - Brand-named coursework (Starbucks, Netflix, Accor, Greenhost) is described
 *     as academic work, never as a client commission.
 *   - No render is called built, completed, or delivered: every project carries
 *     project_status 'concept'.
 *   - No studio title, no age, no award or seniority language.
 *   - Nothing is asserted that the sources do not state. Unknown fields are left
 *     null rather than filled in.
 *
 * The script is idempotent and authoritative: it converges the managed rows to
 * the state described here, and removes managed sections that no longer appear
 * below. Re-running it therefore overwrites edits made in /admin to these rows.
 *
 * The script signs in as the admin user and writes through RLS, exactly as the
 * CMS does. It never uses SUPABASE_SECRET_KEY: plan section 7 grants that key
 * nothing but `insert` on `inquiries`, and CLAUDE.md forbids bypassing RLS for
 * ordinary admin work.
 *
 * Usage:  npm run seed:content
 * Env:    NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
 *         SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD
 *         (read from the environment, falling back to .env.local)
 */

import { createClient } from "@supabase/supabase-js";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MEDIA_DIR = path.join(ROOT, "supabase", "seed-media");
const BUCKET = "portfolio-public";
const STORAGE_YEAR = 2026;

/* ------------------------------------------------------------------ env --- */

function loadEnvLocal() {
  const file = path.join(ROOT, ".env.local");
  if (!existsSync(file)) return;

  for (const line of readFileSync(file, "utf8").split("\n")) {
    const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (process.env[key]) continue;
    process.env[key] = rawValue.replace(/^["']|["']$/g, "");
  }
}

function requireEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing ${name}. Set it in the environment or .env.local.`);
  }
  return value;
}

/* --------------------------------------------------------------- helpers --- */

const UUID_NAMESPACE = "8f4f1d6e-1a2b-4c3d-9e5f-6a7b8c9d0e1f";

/** RFC 4122 v5 UUID, so storage paths stay stable across runs. */
function uuidV5(name) {
  const namespaceBytes = Buffer.from(UUID_NAMESPACE.replace(/-/g, ""), "hex");
  const hash = createHash("sha1")
    .update(Buffer.concat([namespaceBytes, Buffer.from(name, "utf8")]))
    .digest();

  const bytes = Buffer.from(hash.subarray(0, 16));
  bytes[6] = (bytes[6] & 0x0f) | 0x50; // version 5
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // RFC 4122 variant

  const hex = bytes.toString("hex");
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ].join("-");
}

function storagePathFor(name) {
  return `portfolio/${STORAGE_YEAR}/${uuidV5(name)}-${name}.jpg`;
}

/** Minimal baseline/progressive JPEG dimension reader, so no dependency is needed. */
function jpegSize(buffer) {
  let offset = 2; // skip SOI

  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    const marker = buffer[offset + 1];
    const length = buffer.readUInt16BE(offset + 2);

    // SOF0..SOF15, excluding the non-frame markers DHT, JPG, and DAC.
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return { height: buffer.readUInt16BE(offset + 5), width: buffer.readUInt16BE(offset + 7) };
    }

    offset += 2 + length;
  }

  return { width: null, height: null };
}

function fail(step, error) {
  throw new Error(`${step} failed: ${error.message ?? JSON.stringify(error)}`);
}

/* ----------------------------------------------------------------- media --- */

/** name -> alt text. The file is supabase/seed-media/<name>.jpg. */
const MEDIA = {
  "portrait-gabrielle-aurelia":
    "Portrait of Gabrielle Aurelia Sulistya seated against a plain wall",

  "green-nest-floor-plans": "Green Nest floor plans for level one and level two",
  "green-nest-model-bar-counter":
    "Scale model of the Green Nest bar counter with timber screen and planting",
  "green-nest-model-counter-seating":
    "Scale model of the Green Nest counter seating along a glazed edge",
  "green-nest-model-overview": "Overall scale model of the Green Nest retail unit seen from above",

  "dynamic-of-creativity-furniture-plan":
    "Furniture layout plan for the Dynamic of Creativity office",
  "dynamic-of-creativity-front-office":
    "Front office and reception counter under a red curved ceiling",
  "dynamic-of-creativity-waiting-area":
    "Waiting area with pale seating beneath a yellow curved ceiling",
  "dynamic-of-creativity-blue-lounge": "Lounge with a long pale sofa against a blue patterned wall",
  "dynamic-of-creativity-working-space": "Open working space with yellow and red ceiling volumes",
  "dynamic-of-creativity-collaboration-area":
    "Collaboration area with round seating under a blue ceiling disc",
  "dynamic-of-creativity-meeting-room": "Meeting room with a long table and red patterned walls",
  "dynamic-of-creativity-big-meeting-room":
    "Big meeting room with a projection screen and red upholstered chairs",

  "cultural-harmony-furniture-plan": "Furniture layout plan for the Cultural Harmony office",
  "cultural-harmony-section-aa": "Section A–A through the Cultural Harmony office",
  "cultural-harmony-section-bb": "Section B–B through the Cultural Harmony office",
  "cultural-harmony-reception":
    "Reception with a timber counter, perforated screen, and circular ceiling feature",
  "cultural-harmony-front-desk": "Front desk in rattan and timber beside a curved column",
  "cultural-harmony-workstations":
    "Workstations in timber joinery beneath slatted pendant lighting",
  "cultural-harmony-open-workspace": "Open workspace seen past a carved timber screen",

  "retail-furniture-plan": "Furniture layout plan for the retail interior",
  "retail-section-aa": "Section A–A through the retail interior",
  "retail-section-bb": "Section B–B through the retail interior",
  "retail-service-counter":
    "Service counter in fluted blue joinery under a patterned light feature",
  "retail-dining-area": "Dining area with blue banquettes and dark marble flooring",
  "retail-seating-overview": "Seating area seen from the counter with timber ceiling battens",
  "retail-banquette-seating": "Blue banquette seating beside a display counter",
  "retail-display-counter": "Display counter with pendant lighting and blue-and-white pattern",

  "flamora-timber-prototype":
    "Timber prototype of the Flamora stool showing its mortise and tenon joints",
  "flamora-stool-render": "Render of the Flamora stool with a pink seat on slender legs",

  "takinoo-drawing-open": "Technical drawing of Takinoo in its open configuration",
  "takinoo-drawing-closed": "Technical drawing of Takinoo closed, with front and side views",
  "takinoo-storage-mode": "Takinoo in storage mode with the cabinet doors open",
  "takinoo-open-configuration": "Takinoo opened out to show drawers and internal storage",
  "takinoo-table-mode": "Takinoo unfolded into a dining table",

  "menavigasi-batavia-existing-plan": "Existing floor plan with the drop off area marked",
  "menavigasi-batavia-furniture-plan": "Furniture layout plan for Menavigasi Batavia",
  "menavigasi-batavia-section-aa": "Section A–A through the Menavigasi Batavia ground floor",
  "menavigasi-batavia-section-bb": "Section B–B through the Menavigasi Batavia ground floor",
  "menavigasi-batavia-receptionist": "Reception with a timber boat form set into a patterned floor",
  "menavigasi-batavia-lounge": "Lounge and specialty bar under a layered timber ceiling",
  "menavigasi-batavia-art-space": "Art space with brass screens and hanging fabric",
};

/* -------------------------------------------------------------- projects --- */

const ACADEMIC_LOCATION = "Academic project, BINUS University";
const ACADEMIC_CLIENT = "Academic coursework";

const INTERIOR_ROLE = ["Concept Design", "Spatial Planning", "3D Modelling", "Visualization"];
const INTERIOR_SERVICES = ["Interior Design", "Interior Visualization"];
const FURNITURE_ROLE = ["Concept Design", "Technical Drawing", "3D Modelling"];
const FURNITURE_SERVICES = ["Furniture Design", "Technical Drawing"];

const PROJECTS = [
  {
    slug: "menavigasi-batavia",
    title: "Menavigasi Batavia",
    // NEEDS_CONFIRMATION: year estimated from the course sequence, client approved
    // the estimate and will correct it in /admin if wrong.
    year: 2026,
    projectType: "Hospitality",
    designRole: INTERIOR_ROLE,
    services: INTERIOR_SERVICES,
    summary:
      "An academic hotel interior for Greenhost, a boutique hotel built around an eco-friendly philosophy. The design takes the local wisdom of Jakarta — the port of Sunda Kelapa — and reads the plan as an act of navigation, so circulation and the order of spaces flow, layer, and shift the way moving through a harbour does.",
    hero: "menavigasi-batavia-lounge",
    featured: true,
    featuredOrder: 0,
    sortOrder: 0,
    seoTitle: "Menavigasi Batavia — Hotel Interior Concept",
    seoDescription:
      "A hospitality interior concept reading spatial sequence as navigation, drawn from Batavia as a colonial-era port city.",
    sections: [
      {
        key: "overview",
        type: "overview",
        title: "Overview",
        content: {
          body: "Menavigasi Batavia is an academic hotel interior developed for Interior Design IV. It takes Greenhost, a boutique hotel whose concept is eco-friendly, and asks what a hotel lobby becomes when the plan is written as a route rather than a set of rooms.",
          mediaIds: ["menavigasi-batavia-receptionist"],
        },
      },
      {
        key: "brief",
        type: "brief",
        title: "Brief",
        content: {
          body: "Greenhost is a boutique hotel, not an ordinary place to spend a night: it carries a philosophy of sustainability through its design, its operations, and the guest experience. The brief was to design its ground floor — reception, waiting area and specialty bar, lounge, and art space.",
          mediaIds: [],
        },
      },
      {
        key: "concept",
        type: "concept",
        title: "Concept",
        content: {
          body: "The concept draws on the local wisdom of Jakarta and, specifically, on Batavia as a port city of the Dutch colonial era. Menavigasi Batavia reads space as a process of navigation: circulation and the sequence of rooms are arranged to resemble moving through a harbour — flowing, layered, and dynamic. Because that history begins in the colonial period, the interior uses a modern colonial style to hold both the history of Batavia and the movement of a contemporary space.",
          mediaIds: ["menavigasi-batavia-art-space"],
        },
      },
      {
        key: "plan-sequence",
        type: "plan_sequence",
        title: "Plans and Sections",
        content: {
          intro:
            "The existing shell, the furniture layout that navigates it, and two sections through the result.",
          items: [
            {
              title: "Existing condition",
              type: "existing",
              media: "menavigasi-batavia-existing-plan",
              caption: "The existing floor plan, including the drop off area.",
            },
            {
              title: "Furniture layout",
              type: "furniture",
              media: "menavigasi-batavia-furniture-plan",
              caption: "Reception, waiting area and specialty bar, lounge, and art space.",
            },
            {
              title: "Section A–A",
              type: "custom",
              media: "menavigasi-batavia-section-aa",
              caption: "Section A–A.",
            },
            {
              title: "Section B–B",
              type: "custom",
              media: "menavigasi-batavia-section-bb",
              caption: "Section B–B.",
            },
          ],
        },
      },
      {
        key: "gallery",
        type: "gallery",
        title: "Visualization",
        content: {
          intro: "Reception, lounge and specialty bar, and art space.",
          mediaIds: [
            "menavigasi-batavia-receptionist",
            "menavigasi-batavia-lounge",
            "menavigasi-batavia-art-space",
          ],
        },
      },
      {
        key: "credits",
        type: "credits",
        title: "Credits",
        content: {
          items: [{ role: "Course", name: "Interior Design IV, BINUS University", url: "" }],
        },
      },
    ],
  },

  {
    slug: "cultural-harmony",
    title: "Cultural Harmony",
    year: 2025,
    projectType: "Office",
    designRole: INTERIOR_ROLE,
    services: INTERIOR_SERVICES,
    summary:
      "An academic office interior for Accor, the global hospitality group whose stated values are connecting cultures and transparency. The design brings Jakarta's tradition and its modernity together through batik pattern and natural material, and keeps the layout open so the plan itself reads as transparent.",
    hero: "cultural-harmony-reception",
    featured: true,
    featuredOrder: 1,
    sortOrder: 1,
    seoTitle: "Cultural Harmony — Office Interior Concept",
    seoDescription:
      "An office interior concept joining Jakarta tradition and modernity through batik pattern, natural material, and an open plan.",
    sections: [
      {
        key: "overview",
        type: "overview",
        title: "Overview",
        content: {
          body: "Cultural Harmony is an academic office interior developed for Interior Design III, using Accor as its brand context.",
          mediaIds: ["cultural-harmony-reception"],
        },
      },
      {
        key: "brief",
        type: "brief",
        title: "Brief",
        content: {
          body: "Accor is the largest global hotel group, providing many kinds of accommodation and hospitality experience. The values it holds are connecting cultures and transparency, and the office had to argue for both.",
          mediaIds: [],
        },
      },
      {
        key: "concept",
        type: "concept",
        title: "Concept",
        content: {
          body: "The office joins the tradition of Jakarta to its modernity through batik pattern and natural material. The layout is kept open so that the plan reflects the transparency of the group's work ethic rather than merely describing it.",
          mediaIds: ["cultural-harmony-front-desk"],
        },
      },
      {
        key: "plan-sequence",
        type: "plan_sequence",
        title: "Plans and Sections",
        content: {
          intro: "",
          items: [
            {
              title: "Furniture layout",
              type: "furniture",
              media: "cultural-harmony-furniture-plan",
              caption: "Furniture layout plan.",
            },
            {
              title: "Section A–A",
              type: "custom",
              media: "cultural-harmony-section-aa",
              caption: "Section A–A.",
            },
            {
              title: "Section B–B",
              type: "custom",
              media: "cultural-harmony-section-bb",
              caption: "Section B–B.",
            },
          ],
        },
      },
      {
        key: "gallery",
        type: "gallery",
        title: "Visualization",
        content: {
          intro: "",
          mediaIds: [
            "cultural-harmony-reception",
            "cultural-harmony-front-desk",
            "cultural-harmony-workstations",
            "cultural-harmony-open-workspace",
          ],
        },
      },
      {
        key: "credits",
        type: "credits",
        title: "Credits",
        content: {
          items: [{ role: "Course", name: "Interior Design III, BINUS University", url: "" }],
        },
      },
    ],
  },

  {
    slug: "dynamic-of-creativity",
    title: "Dynamic of Creativity",
    year: 2025,
    projectType: "Office",
    designRole: INTERIOR_ROLE,
    services: INTERIOR_SERVICES,
    summary:
      "An academic office interior for Netflix, an online streaming platform whose work culture puts creativity and the flexibility of its employees first. Bright colour is used to support creativity and mood, and an open office layout lets people work flexibly.",
    hero: "dynamic-of-creativity-working-space",
    featured: true,
    featuredOrder: 2,
    sortOrder: 2,
    seoTitle: "Dynamic of Creativity — Office Interior Concept",
    seoDescription:
      "An office interior concept using bright colour and an open layout to support creativity and flexible work.",
    sections: [
      {
        key: "overview",
        type: "overview",
        title: "Overview",
        content: {
          body: "Dynamic of Creativity is an academic office interior developed for Interior Design III, using Netflix as its brand context.",
          mediaIds: ["dynamic-of-creativity-front-office"],
        },
      },
      {
        key: "brief",
        type: "brief",
        title: "Brief",
        content: {
          body: "Netflix is an online streaming platform whose work culture strongly prioritises the creativity and the flexibility of its employees. The office had to make room for both.",
          mediaIds: [],
        },
      },
      {
        key: "concept",
        type: "concept",
        title: "Concept",
        content: {
          body: "The office uses bright colours to push creativity and lift the mood of the people working in it. The layout is left open so that employees are free to work flexibly rather than being fixed to one setting.",
          mediaIds: ["dynamic-of-creativity-collaboration-area"],
        },
      },
      {
        key: "plan-sequence",
        type: "plan_sequence",
        title: "Plan",
        content: {
          intro: "",
          items: [
            {
              title: "Furniture layout",
              type: "furniture",
              media: "dynamic-of-creativity-furniture-plan",
              caption: "Furniture layout plan.",
            },
          ],
        },
      },
      {
        key: "gallery",
        type: "gallery",
        title: "Visualization",
        content: {
          intro: "Front office and waiting area, working space, and the big meeting room.",
          mediaIds: [
            "dynamic-of-creativity-front-office",
            "dynamic-of-creativity-waiting-area",
            "dynamic-of-creativity-blue-lounge",
            "dynamic-of-creativity-working-space",
            "dynamic-of-creativity-collaboration-area",
            "dynamic-of-creativity-meeting-room",
            "dynamic-of-creativity-big-meeting-room",
          ],
        },
      },
      {
        key: "credits",
        type: "credits",
        title: "Credits",
        content: {
          items: [{ role: "Course", name: "Interior Design III, BINUS University", url: "" }],
        },
      },
    ],
  },

  {
    slug: "retail",
    title: "Retail",
    year: 2025,
    projectType: "Retail",
    designRole: INTERIOR_ROLE,
    services: INTERIOR_SERVICES,
    summary:
      "A retail interior modelled and rendered for the Computer 3D course. The design mixes a japandi interior style with French art: timber carries the japandi side, while the blue and white belongs to Toile de Jouy.",
    hero: "retail-dining-area",
    featured: true,
    featuredOrder: 3,
    sortOrder: 3,
    seoTitle: "Retail — Japandi and Toile de Jouy Interior Concept",
    seoDescription:
      "A retail interior concept mixing japandi timber with the blue and white of Toile de Jouy.",
    sections: [
      {
        key: "overview",
        type: "overview",
        title: "Overview",
        content: {
          body: "A retail interior developed for the Computer 3D course, taken from layout and section drawings through to modelling and rendering.",
          mediaIds: ["retail-service-counter"],
        },
      },
      {
        key: "concept",
        type: "concept",
        title: "Concept",
        content: {
          body: "The design mixes a japandi interior style with French art. Timber stands for the japandi half, while the blue and white represents one of the arts of France, Toile de Jouy.",
          mediaIds: ["retail-display-counter"],
        },
      },
      {
        key: "plan-sequence",
        type: "plan_sequence",
        title: "Plans and Sections",
        content: {
          intro: "",
          items: [
            {
              title: "Furniture layout",
              type: "furniture",
              media: "retail-furniture-plan",
              caption: "Furniture layout plan.",
            },
            {
              title: "Section A–A",
              type: "custom",
              media: "retail-section-aa",
              caption: "Section A–A.",
            },
            {
              title: "Section B–B",
              type: "custom",
              media: "retail-section-bb",
              caption: "Section B–B.",
            },
          ],
        },
      },
      {
        key: "gallery",
        type: "gallery",
        title: "Visualization",
        content: {
          intro: "",
          mediaIds: [
            "retail-service-counter",
            "retail-dining-area",
            "retail-seating-overview",
            "retail-banquette-seating",
            "retail-display-counter",
          ],
        },
      },
      {
        key: "credits",
        type: "credits",
        title: "Credits",
        content: {
          items: [{ role: "Course", name: "Computer 3D, BINUS University", url: "" }],
        },
      },
    ],
  },

  {
    slug: "green-nest",
    title: "Green Nest",
    year: 2024,
    projectType: "Retail",
    designRole: ["Concept Design", "Spatial Planning", "Scale Model"],
    services: ["Interior Design", "Scale Model"],
    summary:
      "An academic retail interior for Starbucks, an international food and beverage brand that holds sustainability high. The design works for calm, drawn from the brand's natural character: planting, materials such as timber and bamboo, and daylight used as far as it will go. Developed as drawings and a physical scale model.",
    hero: "green-nest-model-bar-counter",
    featured: true,
    featuredOrder: 4,
    sortOrder: 4,
    seoTitle: "Green Nest — Retail Interior Concept",
    seoDescription:
      "A retail interior concept built on planting, timber, bamboo, and daylight, developed as drawings and a physical scale model.",
    sections: [
      {
        key: "overview",
        type: "overview",
        title: "Overview",
        content: {
          body: "Green Nest is an academic retail interior developed for Interior Design II, using Starbucks as its brand context and resolved as a physical scale model as well as drawings.",
          mediaIds: ["green-nest-model-overview"],
        },
      },
      {
        key: "brief",
        type: "brief",
        title: "Brief",
        content: {
          body: "Starbucks is an international food and beverage retailer that holds the value of sustainability high, and that became the starting point for the design.",
          mediaIds: [],
        },
      },
      {
        key: "concept",
        type: "concept",
        title: "Concept",
        content: {
          body: "The design creates a calm atmosphere taken from the natural character of the brand. Planting, materials such as timber and bamboo, and daylight used as far as the plan allows carry that character through the space.",
          mediaIds: ["green-nest-model-counter-seating"],
        },
      },
      {
        key: "plan-sequence",
        type: "plan_sequence",
        title: "Plans",
        content: {
          intro: "",
          items: [
            {
              title: "Floor plans",
              type: "layout",
              media: "green-nest-floor-plans",
              caption: "Level one and level two, with the furniture schedule.",
            },
          ],
        },
      },
      {
        key: "gallery",
        type: "gallery",
        title: "Scale Model",
        content: {
          intro: "The design resolved as a physical scale model.",
          mediaIds: [
            "green-nest-model-overview",
            "green-nest-model-bar-counter",
            "green-nest-model-counter-seating",
          ],
        },
      },
      {
        key: "credits",
        type: "credits",
        title: "Credits",
        content: {
          items: [{ role: "Course", name: "Interior Design II, BINUS University", url: "" }],
        },
      },
    ],
  },

  {
    slug: "flamora",
    title: "Flamora",
    year: 2025,
    projectType: "Furniture",
    designRole: FURNITURE_ROLE,
    services: FURNITURE_SERVICES,
    summary:
      "A stool taking its form from the flamingo. The legs follow the way the bird stands, and the seat carries its iconic pink. Built around mortise and tenon joinery, and entered in the JIFFINA Youth Furniture Design Competition.",
    hero: "flamora-stool-render",
    featured: false,
    featuredOrder: 0,
    sortOrder: 5,
    seoTitle: "Flamora — Stool Design",
    seoDescription:
      "A stool whose legs and colour are taken from the flamingo, built around mortise and tenon joinery.",
    sections: [
      {
        key: "overview",
        type: "overview",
        title: "Overview",
        content: {
          body: "Flamora is a stool developed for Furniture Design I, and the furniture project entered in the JIFFINA Youth Furniture Design Competition.",
          mediaIds: ["flamora-stool-render"],
        },
      },
      {
        key: "concept",
        type: "concept",
        title: "Concept",
        content: {
          body: "The design is inspired by the flamingo. Two characteristics are taken from the bird: its legs and the colour of its body. The legs of the stool are shaped to resemble the way a flamingo stands, and the seat carries its iconic pink.",
          mediaIds: [],
        },
      },
      {
        key: "custom-furniture",
        type: "custom_furniture",
        title: "Joinery",
        content: {
          body: "The frame is put together with mortise and tenon joints, prototyped in timber before the finished form was rendered.",
          mediaIds: ["flamora-timber-prototype"],
        },
      },
      {
        key: "gallery",
        type: "gallery",
        title: "Gallery",
        content: {
          intro: "",
          mediaIds: ["flamora-stool-render", "flamora-timber-prototype"],
        },
      },
      {
        key: "credits",
        type: "credits",
        title: "Credits",
        content: {
          items: [
            { role: "Course", name: "Furniture Design I, BINUS University", url: "" },
            {
              role: "Competition",
              name: "JIFFINA Youth Furniture Design Competition, 2025",
              url: "",
            },
          ],
        },
      },
    ],
  },

  {
    slug: "takinoo",
    title: "Takinoo",
    year: 2025,
    projectType: "Furniture",
    designRole: FURNITURE_ROLE,
    services: FURNITURE_SERVICES,
    summary:
      "A multifunctional piece made to answer the needs of a household where space runs short. Eating and storing things can both happen through the one piece of furniture, which opens out into a table and closes back into a cabinet.",
    hero: "takinoo-table-mode",
    featured: false,
    featuredOrder: 0,
    sortOrder: 6,
    seoTitle: "Takinoo — Multifunctional Furniture",
    seoDescription:
      "A multifunctional piece for small homes that opens into a dining table and closes back into storage.",
    sections: [
      {
        key: "overview",
        type: "overview",
        title: "Overview",
        content: {
          body: "Takinoo is a multifunctional piece of furniture developed for Furniture Design II.",
          mediaIds: ["takinoo-table-mode"],
        },
      },
      {
        key: "concept",
        type: "concept",
        title: "Concept",
        content: {
          body: "The piece is made to answer needs inside the home, and it addresses the problem of a house that is short of space. Activities such as eating or storing things can be carried out with the help of this one piece of furniture.",
          mediaIds: ["takinoo-open-configuration"],
        },
      },
      {
        key: "custom-furniture",
        type: "custom_furniture",
        title: "Configurations",
        content: {
          body: "Closed, it reads as a cabinet with drawers and internal storage. Opened, the top unfolds into a dining table and the base rolls clear on castors.",
          mediaIds: ["takinoo-storage-mode", "takinoo-open-configuration", "takinoo-table-mode"],
        },
      },
      {
        key: "plan-sequence",
        type: "plan_sequence",
        title: "Technical Drawings",
        content: {
          intro: "",
          items: [
            {
              title: "Open",
              type: "custom",
              media: "takinoo-drawing-open",
              caption: "Top and side views, open, with joinery details.",
            },
            {
              title: "Closed",
              type: "custom",
              media: "takinoo-drawing-closed",
              caption: "Top, side, and front views, closed, with handle and castor details.",
            },
          ],
        },
      },
      {
        key: "gallery",
        type: "gallery",
        title: "Gallery",
        content: {
          intro: "",
          mediaIds: ["takinoo-storage-mode", "takinoo-open-configuration", "takinoo-table-mode"],
        },
      },
      {
        key: "credits",
        type: "credits",
        title: "Credits",
        content: {
          items: [{ role: "Course", name: "Furniture Design II, BINUS University", url: "" }],
        },
      },
    ],
  },
];

/* -------------------------------------------------------------- services --- */

/** CLIENT_CONTEXT section 20 records focus areas, not a commercial offering. */
const SERVICES = [
  {
    slug: "hospitality",
    name: "Hospitality",
    shortDescription: "Spatial experience, atmosphere, storytelling, and visualization.",
    media: "menavigasi-batavia-lounge",
    sortOrder: 0,
    featured: true,
  },
  {
    slug: "retail",
    name: "Retail",
    shortDescription: "Brand-driven space, material direction, and spatial presentation.",
    media: "retail-dining-area",
    sortOrder: 1,
    featured: true,
  },
  {
    slug: "workplace",
    name: "Workplace",
    shortDescription: "Layout, flexibility, identity, and the experience of working in a space.",
    media: "cultural-harmony-open-workspace",
    sortOrder: 2,
    featured: true,
  },
  {
    slug: "furniture",
    name: "Furniture",
    shortDescription: "Form, function, compact-space problem solving, and joinery.",
    media: "takinoo-open-configuration",
    sortOrder: 3,
    featured: true,
  },
];

/** The approach the portfolio demonstrates, not a client engagement process. */
const PROCESS_STEPS = [
  {
    stepNo: 1,
    title: "Brief & Context",
    description: "Read the brief, the user, and the context the space has to answer to.",
    media: null,
  },
  {
    stepNo: 2,
    title: "Concept",
    description: "Set a spatial idea the rest of the decisions can be measured against.",
    media: "menavigasi-batavia-art-space",
  },
  {
    stepNo: 3,
    title: "Spatial Planning",
    description: "Resolve zoning, circulation, and furniture layout on plan and in section.",
    media: "menavigasi-batavia-furniture-plan",
  },
  {
    stepNo: 4,
    title: "Material & Detail",
    description: "Choose material, colour, and lighting, then detail what has to be built.",
    media: "cultural-harmony-front-desk",
  },
  {
    stepNo: 5,
    title: "Visualization",
    description: "Model and render the space, and lay the drawings out for presentation.",
    media: "retail-seating-overview",
  },
];

const EXPLORATIONS = [
  {
    slug: "mortise-and-tenon-study",
    title: "Mortise and Tenon Study",
    category: "Furniture Detail",
    description:
      "The joinery behind Flamora, prototyped in timber before the finished stool was rendered.",
    year: 2025,
    cover: "flamora-timber-prototype",
    media: ["flamora-timber-prototype", "flamora-stool-render"],
  },
  {
    slug: "green-nest-scale-model",
    title: "Green Nest Scale Model",
    category: "Scale Model",
    description:
      "Green Nest resolved by hand as a physical scale model, testing planting, timber, and daylight at 1:1 of the drawing.",
    year: 2024,
    cover: "green-nest-model-overview",
    media: [
      "green-nest-model-overview",
      "green-nest-model-bar-counter",
      "green-nest-model-counter-seating",
    ],
  },
];

/* ----------------------------------------------------------------- pages --- */

const NAVIGATION = [
  { label: "Projects", href: "/projects", placement: "header", sortOrder: 0 },
  { label: "Services", href: "/services", placement: "header", sortOrder: 1 },
  { label: "Process", href: "/process", placement: "header", sortOrder: 2 },
  { label: "About", href: "/about", placement: "header", sortOrder: 3 },
  { label: "Explorations", href: "/explorations", placement: "header", sortOrder: 4 },
  { label: "Contact", href: "/contact", placement: "footer", sortOrder: 0 },
  { label: "Projects", href: "/projects", placement: "footer", sortOrder: 1 },
  { label: "About", href: "/about", placement: "footer", sortOrder: 2 },
];

const ABOUT_INTRO =
  "Gabrielle Aurelia Sulistya is an Interior Design student at BINUS University focused on hospitality interiors, spatial visualization, and concept-driven design. Her work explores how material, layout, visual storytelling, and spatial experience can be translated into clear design concepts and compelling interior visualizations.";

function pages(mediaId, projectId) {
  return [
    {
      slug: "home",
      title: "Home",
      navLabel: "Home",
      seoTitle: "Gabrielle Aurelia Sulistya — Interior Designer & Spatial Visualizer",
      seoDescription:
        "Interior design work exploring concept, material, function, and visual storytelling.",
      ogMedia: "menavigasi-batavia-lounge",
      sections: [
        {
          key: "hero",
          type: "home_hero",
          content: {
            eyebrow: "Interior Designer & Spatial Visualizer",
            headline:
              "Designing spaces through concept, material, function, and visual storytelling.",
            subheadline:
              "Interior design work across hospitality, retail, workplace, and furniture — from spatial concept and planning through to interior visualization.",
            location: "",
            heroMediaId: mediaId("menavigasi-batavia-lounge"),
            signatureProjectId: projectId("menavigasi-batavia"),
            primaryCtaLabel: "View Projects",
            primaryCtaHref: "/projects",
            secondaryCtaLabel: "About",
            secondaryCtaHref: "/about",
          },
        },
        {
          key: "positioning",
          type: "positioning",
          content: {
            eyebrow: "",
            lines: ["SPACES BUILT FROM", "CONCEPT, MATERIAL,", "AND SPATIAL STORY."],
            body: "Each project starts from a clear idea about how a space should be entered, moved through, and remembered.",
          },
        },
        {
          key: "featured-projects",
          type: "featured_projects",
          content: { title: "Selected Projects", intro: "", maxItems: 5 },
        },
        {
          key: "philosophy",
          type: "philosophy",
          content: {
            title: "Approach",
            intro: "",
            items: [
              {
                title: "Concept",
                body: "A spatial idea comes first — context, brand, or history gives the plan something to argue.",
              },
              {
                title: "Space",
                body: "Zoning and circulation are resolved on the plan before the space is dressed.",
              },
              {
                title: "Material",
                body: "Material and colour carry the concept into something you can touch and light.",
              },
              {
                title: "Visualization",
                body: "3D modelling and rendering test the result and make the intent legible to others.",
              },
            ],
          },
        },
        {
          key: "services-preview",
          type: "services_preview",
          content: { title: "Design Focus", intro: "", maxItems: 6 },
        },
        {
          key: "process-preview",
          type: "process_preview",
          content: { title: "How the Work Develops", intro: "", maxItems: 10 },
        },
        {
          key: "material-moment",
          type: "material_moment",
          content: {
            title: "Material Studies",
            intro: "",
            mediaIds: [
              mediaId("cultural-harmony-front-desk"),
              mediaId("retail-display-counter"),
              mediaId("menavigasi-batavia-art-space"),
            ],
          },
        },
        {
          key: "credibility",
          type: "credibility",
          content: {
            title: "Background",
            stats: [
              { value: "3.72", label: "GPA, BINUS University" },
              { value: "B.Des", label: "Bachelor of Interior Design" },
              { value: "7", label: "Portfolio projects" },
              { value: "4", label: "Design focus areas" },
            ],
            testimonialIds: [],
          },
        },
        {
          key: "cta",
          type: "cta",
          content: {
            eyebrow: "",
            title: "Get in touch.",
            body: "",
            ctaLabel: "Contact",
            ctaHref: "/contact",
          },
        },
      ],
    },

    {
      slug: "projects",
      title: "Projects",
      navLabel: "Projects",
      seoTitle: "Projects — Gabrielle Aurelia Sulistya",
      seoDescription: "Selected interior design and spatial visualization work.",
      ogMedia: "menavigasi-batavia-receptionist",
      // /projects renders a fixed layout and does not read page_sections, so a
      // section here would never appear. The note about the nature of the work
      // lives on /about, and every project page states it in its own facts.
      sections: [],
    },

    {
      slug: "services",
      title: "Services",
      navLabel: "Services",
      seoTitle: "Design Focus — Gabrielle Aurelia Sulistya",
      seoDescription:
        "Design focus areas across interior concepts, visualization, and presentation.",
      ogMedia: "cultural-harmony-open-workspace",
      sections: [
        {
          key: "intro",
          type: "rich_text",
          content: {
            title: "Design Focus",
            body: "These are the areas the portfolio concentrates on rather than a commercial service offering. Each one names a kind of space and the part of the work — concept, planning, material, visualization — that the projects in it are built around.",
          },
        },
      ],
    },

    {
      slug: "process",
      title: "Process",
      navLabel: "Process",
      seoTitle: "Process — Gabrielle Aurelia Sulistya",
      seoDescription:
        "A design approach shaped by brief, concept, spatial planning, material, and visualization.",
      ogMedia: "menavigasi-batavia-furniture-plan",
      sections: [
        {
          key: "intro",
          type: "rich_text",
          content: {
            title: "How the Work Develops",
            body: "This is the sequence the projects in this portfolio actually follow, from reading a brief through to laying the drawings out for presentation.",
          },
        },
      ],
    },

    {
      slug: "about",
      title: "About",
      navLabel: "About",
      seoTitle: "About — Gabrielle Aurelia Sulistya",
      seoDescription:
        "Background, capabilities, and interests in interior design and visualization.",
      ogMedia: "portrait-gabrielle-aurelia",
      sections: [
        {
          key: "intro",
          type: "rich_text",
          content: { title: "About", body: ABOUT_INTRO },
        },
        {
          key: "portrait",
          type: "gallery",
          content: { title: "", intro: "", mediaIds: [mediaId("portrait-gabrielle-aurelia")] },
        },
        {
          key: "focus",
          type: "rich_text",
          content: {
            title: "Focus",
            body: "Her primary focus is hospitality interior design and interior visualization: developing visual concepts and translating design ideas into 3D models and presentation drawings, with additional exposure to exhibition and event-based spatial design. She is interested in interior design, custom furniture, and the work that surrounds both, and is open to onsite work and relocation.",
          },
        },
        {
          key: "work-note",
          type: "rich_text",
          content: {
            title: "About the work",
            body: "The projects in this portfolio are academic coursework produced at BINUS University, one of which was also entered in the JIFFINA Youth Furniture Design Competition. Where a brand is named, it is the design context the brief was set against rather than a client commission, and each project is a design concept rather than a built interior.",
          },
        },
        {
          key: "education",
          type: "philosophy",
          content: {
            title: "Education",
            intro: "",
            items: [
              {
                title: "BINUS University",
                body: "Bachelor of Interior Design, GPA 3.72. August 2023 – July 2027.",
              },
            ],
          },
        },
        {
          key: "experience",
          type: "philosophy",
          content: {
            title: "Experience",
            intro: "",
            items: [
              {
                title: "PT Escala Interior — Junior Interior Designer",
                body: "Internship, August 2026 – present.",
              },
              {
                title: "Byast Design Studio — Junior Interior Designer",
                body: "Internship, 2026, completed in July 2026.",
              },
              {
                title: "JIFFINA Youth Furniture Design Competition, 2025",
                body: "Participant. Developed furniture design concepts from the competition brief and industry standards, applying design thinking and material considerations, and met professional evaluation criteria and current furniture design trends.",
              },
              {
                title: "Pelatihan Desain Kreatif Inovatif, 2025",
                body: "Creative Division. Designed event merchandise and promotional posters, and developed design concepts aligned with the training theme and its audience.",
              },
              {
                title: "Company Visit to Jepara Furniture Industry, 2024",
                body: "Creative Division. Analysed the furniture materials and production processes used in Jepara's furniture industry, and gained insight into wood craftsmanship and manufacturing standards. Designed merchandise, posters, banners, activity proposals, and campus Instagram Stories content, keeping branding and visual communication consistent.",
              },
              {
                title: "Innerside Interior Exhibition, 2024",
                body: "Event Division. Managed ticketing flow and visitor coordination during the exhibition, and learned event operations under time pressure.",
              },
              {
                title: "BINUS First Year Program, 2024",
                body: "Freshmen Partner B28. Assisted new students during university orientation, developing communication, coordination, and responsibility.",
              },
            ],
          },
        },
        {
          key: "software",
          type: "philosophy",
          content: {
            title: "Software",
            intro: "",
            items: [
              { title: "AutoCAD", body: "Basic layout and technical drawing." },
              { title: "SketchUp", body: "Interior 3D modelling." },
              { title: "D5 Render", body: "Interior visualization and lighting." },
              { title: "LayOut", body: "Presentation drawings." },
              { title: "Adobe InDesign", body: "Layout and document design." },
              { title: "Canva", body: "Visual presentation and layout design." },
            ],
          },
        },
        {
          key: "cta",
          type: "cta",
          content: {
            eyebrow: "",
            title: "Get in touch.",
            body: "",
            ctaLabel: "Contact",
            ctaHref: "/contact",
          },
        },
      ],
    },

    {
      slug: "explorations",
      title: "Explorations",
      navLabel: "Explorations",
      seoTitle: "Explorations — Gabrielle Aurelia Sulistya",
      seoDescription: "Furniture and spatial explorations in form, material, and function.",
      ogMedia: "flamora-timber-prototype",
      sections: [
        {
          key: "intro",
          type: "rich_text",
          content: {
            title: "",
            body: "Studies that sit beside the projects — joinery worked out in timber, and a space resolved by hand as a physical model before it was ever rendered.",
          },
        },
      ],
    },

    {
      slug: "contact",
      title: "Contact",
      navLabel: "Contact",
      seoTitle: "Contact — Gabrielle Aurelia Sulistya",
      seoDescription: "Share a project brief or say hello.",
      ogMedia: "menavigasi-batavia-receptionist",
      sections: [
        {
          key: "intro",
          type: "rich_text",
          content: {
            title: "",
            body: "Open to onsite work and relocation. Reach out about an internship, a project, or the work in this portfolio — by the form below, or directly at gabrielleaurelia07@gmail.com.",
          },
        },
      ],
    },
  ];
}

/* ------------------------------------------------------------------- run --- */

async function seedMedia(supabase, userId) {
  const ids = new Map();

  for (const [name, altText] of Object.entries(MEDIA)) {
    const file = path.join(MEDIA_DIR, `${name}.jpg`);
    const bytes = await readFile(file);
    const { width, height } = jpegSize(bytes);
    const storagePath = storagePathFor(name);

    const upload = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, bytes, { contentType: "image/jpeg", upsert: true });
    if (upload.error) fail(`upload ${name}`, upload.error);

    const row = await supabase
      .from("media_assets")
      .upsert(
        {
          bucket: BUCKET,
          storage_path: storagePath,
          media_type: "image",
          alt_text: altText,
          width,
          height,
          mime_type: "image/jpeg",
          file_size_bytes: bytes.byteLength,
          is_archived: false,
          created_by: userId,
        },
        { onConflict: "storage_path" },
      )
      .select("id")
      .single();
    if (row.error) fail(`media_assets ${name}`, row.error);

    ids.set(name, row.data.id);
  }

  return ids;
}

async function seedSiteSettings(supabase, mediaId) {
  // Admins are granted update but not insert on this table. The singleton row
  // is created by the bootstrap migration, so update is the only path.
  const { error } = await supabase
    .from("site_settings")
    .update({
      site_name: "Gabrielle Aurelia Sulistya",
      professional_role: "Interior Designer & Spatial Visualizer",
      location: null,
      service_area: "Open to onsite work and relocation",
      email: "gabrielleaurelia07@gmail.com",
      phone: "082134183412",
      whatsapp: null,
      // No social URL is stated in the source, so none is invented here.
      social_links: [],
      footer_text: "Interior design and spatial visualization work.",
      default_seo_title: "Gabrielle Aurelia Sulistya — Interior Designer & Spatial Visualizer",
      default_seo_description:
        "Interior design work exploring concept, material, function, and visual storytelling.",
      default_og_media_id: mediaId("menavigasi-batavia-lounge"),
    })
    .eq("id", 1);
  if (error) fail("site_settings", error);
}

async function seedNavigation(supabase) {
  const existing = await supabase.from("navigation_items").select("id, href, placement");
  if (existing.error) fail("navigation_items read", existing.error);

  const keep = new Set();

  for (const item of NAVIGATION) {
    const match = existing.data.find(
      (row) => row.href === item.href && row.placement === item.placement,
    );
    const payload = {
      label: item.label,
      href: item.href,
      placement: item.placement,
      sort_order: item.sortOrder,
      is_visible: true,
      target_blank: false,
    };

    if (match) {
      keep.add(match.id);
      const { error } = await supabase.from("navigation_items").update(payload).eq("id", match.id);
      if (error) fail(`navigation_items ${item.href}`, error);
    } else {
      const inserted = await supabase
        .from("navigation_items")
        .insert(payload)
        .select("id")
        .single();
      if (inserted.error) fail(`navigation_items ${item.href}`, inserted.error);
      keep.add(inserted.data.id);
    }
  }

  const stale = existing.data.filter((row) => !keep.has(row.id)).map((row) => row.id);
  if (stale.length > 0) {
    const { error } = await supabase.from("navigation_items").delete().in("id", stale);
    if (error) fail("navigation_items cleanup", error);
  }
}

async function seedProjects(supabase, mediaId) {
  const ids = new Map();

  for (const project of PROJECTS) {
    const row = await supabase
      .from("projects")
      .upsert(
        {
          slug: project.slug,
          title: project.title,
          year: project.year,
          location: ACADEMIC_LOCATION,
          project_type: project.projectType,
          area_sqm: null,
          project_status: "concept",
          client_type: ACADEMIC_CLIENT,
          design_role: project.designRole,
          services: project.services,
          summary: project.summary,
          hero_media_id: mediaId(project.hero),
          featured: project.featured,
          featured_order: project.featuredOrder,
          sort_order: project.sortOrder,
          seo_title: project.seoTitle,
          seo_description: project.seoDescription,
          og_media_id: mediaId(project.hero),
          status: "published",
        },
        { onConflict: "slug" },
      )
      .select("id")
      .single();
    if (row.error) fail(`projects ${project.slug}`, row.error);

    const projectId = row.data.id;
    ids.set(project.slug, projectId);

    const sections = project.sections.map((section, index) => ({
      project_id: projectId,
      section_key: section.key,
      section_type: section.type,
      title: section.title ?? null,
      content: resolveMediaRefs(section.content, mediaId),
      sort_order: index,
      is_enabled: true,
    }));

    const upserted = await supabase
      .from("project_sections")
      .upsert(sections, { onConflict: "project_id,section_key" });
    if (upserted.error) fail(`project_sections ${project.slug}`, upserted.error);

    const cleanup = await supabase
      .from("project_sections")
      .delete()
      .eq("project_id", projectId)
      .not("section_key", "in", `(${project.sections.map((s) => s.key).join(",")})`);
    if (cleanup.error) fail(`project_sections cleanup ${project.slug}`, cleanup.error);
  }

  return ids;
}

/** Replaces `media`/`mediaIds` name references with real media_assets ids. */
function resolveMediaRefs(content, mediaId) {
  const resolved = structuredClone(content);

  if (Array.isArray(resolved.mediaIds)) {
    resolved.mediaIds = resolved.mediaIds.map((name) => mediaId(name));
  }

  if (Array.isArray(resolved.items)) {
    resolved.items = resolved.items.map((item) => {
      if (!item || typeof item !== "object" || !("media" in item)) return item;
      const { media, ...rest } = item;
      return { ...rest, mediaId: mediaId(media) };
    });
  }

  return resolved;
}

async function seedServices(supabase, mediaId) {
  for (const service of SERVICES) {
    const { error } = await supabase.from("services").upsert(
      {
        slug: service.slug,
        name: service.name,
        short_description: service.shortDescription,
        full_description: null,
        ideal_client: null,
        scope: [],
        deliverables: [],
        included: [],
        excluded: [],
        typical_project_types: [],
        media_id: mediaId(service.media),
        sort_order: service.sortOrder,
        featured: service.featured,
        status: "published",
      },
      { onConflict: "slug" },
    );
    if (error) fail(`services ${service.slug}`, error);
  }
}

async function seedProcess(supabase, mediaId) {
  const existing = await supabase.from("process_steps").select("id, step_no");
  if (existing.error) fail("process_steps read", existing.error);

  const keep = new Set();

  for (const step of PROCESS_STEPS) {
    const payload = {
      step_no: step.stepNo,
      title: step.title,
      description: step.description,
      media_id: step.media ? mediaId(step.media) : null,
      sort_order: step.stepNo - 1,
      status: "published",
    };
    const match = existing.data.find((row) => row.step_no === step.stepNo);

    if (match) {
      keep.add(match.id);
      const { error } = await supabase.from("process_steps").update(payload).eq("id", match.id);
      if (error) fail(`process_steps ${step.stepNo}`, error);
    } else {
      const inserted = await supabase.from("process_steps").insert(payload).select("id").single();
      if (inserted.error) fail(`process_steps ${step.stepNo}`, inserted.error);
      keep.add(inserted.data.id);
    }
  }

  const stale = existing.data.filter((row) => !keep.has(row.id)).map((row) => row.id);
  if (stale.length > 0) {
    const { error } = await supabase.from("process_steps").delete().in("id", stale);
    if (error) fail("process_steps cleanup", error);
  }
}

async function seedExplorations(supabase, mediaId) {
  for (const exploration of EXPLORATIONS) {
    const row = await supabase
      .from("explorations")
      .upsert(
        {
          slug: exploration.slug,
          title: exploration.title,
          category: exploration.category,
          description: exploration.description,
          year: exploration.year,
          cover_media_id: mediaId(exploration.cover),
          sort_order: EXPLORATIONS.indexOf(exploration),
          status: "published",
        },
        { onConflict: "slug" },
      )
      .select("id")
      .single();
    if (row.error) fail(`explorations ${exploration.slug}`, row.error);

    const links = exploration.media.map((name, index) => ({
      exploration_id: row.data.id,
      media_id: mediaId(name),
      caption: null,
      sort_order: index,
    }));

    const { error } = await supabase
      .from("exploration_media")
      .upsert(links, { onConflict: "exploration_id,media_id" });
    if (error) fail(`exploration_media ${exploration.slug}`, error);
  }
}

async function seedPages(supabase, mediaId, projectId) {
  for (const page of pages(mediaId, projectId)) {
    const row = await supabase
      .from("pages")
      .upsert(
        {
          slug: page.slug,
          title: page.title,
          nav_label: page.navLabel,
          seo_title: page.seoTitle,
          seo_description: page.seoDescription,
          og_media_id: mediaId(page.ogMedia),
          status: "published",
        },
        { onConflict: "slug" },
      )
      .select("id")
      .single();
    if (row.error) fail(`pages ${page.slug}`, row.error);

    const pageId = row.data.id;
    const sections = page.sections.map((section, index) => ({
      page_id: pageId,
      section_key: section.key,
      section_type: section.type,
      content: section.content,
      settings: {},
      sort_order: index,
      is_enabled: true,
      status: "published",
    }));

    const upserted = await supabase
      .from("page_sections")
      .upsert(sections, { onConflict: "page_id,section_key" });
    if (upserted.error) fail(`page_sections ${page.slug}`, upserted.error);

    const cleanup = await supabase
      .from("page_sections")
      .delete()
      .eq("page_id", pageId)
      .not("section_key", "in", `(${page.sections.map((s) => s.key).join(",")})`);
    if (cleanup.error) fail(`page_sections cleanup ${page.slug}`, cleanup.error);
  }
}

async function main() {
  loadEnvLocal();

  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const publishableKey = requireEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  const email = requireEnv("SEED_ADMIN_EMAIL");
  const password = requireEnv("SEED_ADMIN_PASSWORD");

  const supabase = createClient(url, publishableKey, { auth: { persistSession: false } });

  const signIn = await supabase.auth.signInWithPassword({ email, password });
  if (signIn.error) fail("admin sign in", signIn.error);
  const userId = signIn.data.user.id;

  console.log(`Seeding portfolio content into ${url} as ${email}`);

  const media = await seedMedia(supabase, userId);
  const mediaId = (name) => {
    const id = media.get(name);
    if (!id) throw new Error(`Unknown media reference: ${name}`);
    return id;
  };
  console.log(`  media_assets      ${media.size}`);

  await seedSiteSettings(supabase, mediaId);
  console.log("  site_settings     1");

  await seedNavigation(supabase);
  console.log(`  navigation_items  ${NAVIGATION.length}`);

  const projects = await seedProjects(supabase, mediaId);
  const projectId = (slug) => {
    const id = projects.get(slug);
    if (!id) throw new Error(`Unknown project reference: ${slug}`);
    return id;
  };
  console.log(`  projects          ${projects.size}`);

  await seedServices(supabase, mediaId);
  console.log(`  services          ${SERVICES.length}`);

  await seedProcess(supabase, mediaId);
  console.log(`  process_steps     ${PROCESS_STEPS.length}`);

  await seedExplorations(supabase, mediaId);
  console.log(`  explorations      ${EXPLORATIONS.length}`);

  await seedPages(supabase, mediaId, projectId);
  console.log(`  pages             ${pages(mediaId, projectId).length}`);

  await supabase.auth.signOut();
  console.log("Done.");
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
