# PRD — Interactive Interior Designer Portfolio

## 0. Status Dokumen

**Jenis proyek:** Website portofolio personal / studio untuk Interior Designer  
**Reference interaction:** itsjay.us, digunakan sebagai inspirasi ritme, motion, editorial layout, dan interaction quality; bukan sebagai clone visual.  
**Pemilik produk:** Interior Designer  
**Tujuan utama:** Menampilkan kualitas desain ruang secara premium, menjelaskan proses berpikir desain, membangun kepercayaan, dan mengubah pengunjung yang relevan menjadi project inquiry.

---

# PART A — PRODUCT POSITIONING

## 1. Perubahan Fundamental dari PRD Sebelumnya

PRD sebelumnya memosisikan pemilik website sebagai hybrid creative/design engineer. Untuk Interior Designer, objek yang harus dijual berubah dari kemampuan membuat interface dan motion menjadi kemampuan menciptakan ruang yang berfungsi, memiliki karakter, dan dapat direalisasikan.

Karena itu:

- hero tidak lagi berpusat pada showreel digital, tetapi pada signature interior project;
- Work menjadi **Projects**;
- Services tidak lagi berupa graphic/motion/development, tetapi layanan interior;
- technology stack tidak perlu ditampilkan sebagai bagian utama pengalaman pengguna;
- Lab diubah menjadi **Explorations / Material & Concept Studies**;
- case study wajib menjelaskan brief, problem, spatial strategy, layout, material, lighting, custom element, dan final result;
- CTA utama berubah dari `Hire Me` menjadi `Start a Project`, `Discuss Your Space`, atau `Book a Consultation`;
- website harus mampu menyaring calon klien berdasarkan jenis proyek, lokasi, luas, layanan, timeline, dan budget range;
- visual ruang harus menjadi hero, sedangkan motion hanya memperkuat pengalaman melihat ruang.

## 2. Product Vision

Membangun website portofolio Interior Designer yang terasa seperti editorial design publication: tenang, presisi, visual-first, dan immersive. Pengunjung harus bisa memahami karakter desain, jenis proyek yang pernah dikerjakan, cara kerja designer, dan jalur untuk memulai proyek tanpa harus mencari informasi penting terlalu lama.

Website harus menghasilkan kesan:

> “Designer ini memiliki taste, memahami ruang secara teknis, memiliki proses kerja yang jelas, dan mampu membawa konsep sampai menjadi ruang nyata.”

Bukan hanya:

> “Designer ini punya foto interior yang bagus.”

## 3. Product Jobs

Website memiliki empat fungsi utama:

1. **Show Taste** — memperlihatkan kualitas estetika dan karakter desain.
2. **Show Thinking** — membuktikan kemampuan spatial planning, material, lighting, detail, dan problem solving.
3. **Build Trust** — menjelaskan scope, proses, role, hasil proyek, testimonial, dan kredibilitas.
4. **Generate Qualified Inquiry** — memudahkan calon klien yang tepat memulai percakapan proyek.

## 4. Target Users

### 4.1 Residential Client

Contoh:

- pemilik rumah;
- pemilik apartemen;
- pemilik villa;
- klien renovasi rumah;
- klien furnishing/styling.

Pertanyaan mereka:

- Apakah gaya designer ini cocok dengan saya?
- Pernah menangani rumah/apartemen dengan skala serupa?
- Bisa menangani dari desain sampai implementasi?
- Bagaimana prosesnya?
- Berapa kelas proyek yang biasa ditangani?
- Bagaimana cara konsultasi?

### 4.2 Commercial Client

Contoh:

- pemilik kantor;
- retailer;
- F&B owner;
- developer;
- brand owner;
- property operator.

Pertanyaan mereka:

- Pernah mengerjakan proyek komersial?
- Bagaimana designer memikirkan circulation, branding, durability, dan customer experience?
- Apakah dapat bekerja dengan kontraktor/vendor?
- Apakah scope dan timeline cukup jelas?

### 4.3 Hospitality Client

Contoh:

- hotel;
- resort;
- restaurant;
- cafe;
- serviced apartment.

Fokus evaluasi:

- atmosphere;
- guest journey;
- material durability;
- lighting;
- operational flow;
- brand translation.

### 4.4 Recruiter / Design Studio / Collaborator

Membutuhkan bukti:

- kualitas portfolio;
- cara berpikir;
- drawing/rendering capability;
- role dalam collaborative project;
- software capability;
- pengalaman proyek.

---

# PART B — INFORMATION ARCHITECTURE

## 5. Sitemap MVP

```text
/
Home

/projects
All Projects

/projects/[slug]
Project Case Study

/services
Services

/process
Design Process

/about
About / Profile

/explorations
Material, Furniture, Lighting & Concept Studies

/contact
Project Inquiry

/404
Custom 404
```

### Simplified navigation option

Jika ingin lebih minimal seperti reference:

```text
Projects
Studio
Process
Contact
```

`Studio` dapat memuat About + Services.

## 6. Prioritas Navigasi

Urutan yang direkomendasikan:

```text
Projects
Services
Process
About
Contact
```

Pada mobile:

```text
Menu
 ├ Projects
 ├ Services
 ├ Process
 ├ About
 ├ Explorations
 └ Start a Project
```

CTA `Start a Project` harus memiliki hierarchy lebih tinggi daripada link sosial.

---

# PART C — VISUAL DIRECTION

## 7. Design Principle

Website harus terasa:

- editorial;
- architectural;
- tactile;
- spacious;
- calm;
- premium;
- image-led;
- detail-oriented.

Hindari:

- terlalu banyak gradient;
- glassmorphism;
- cursor gimmick berlebihan;
- neon;
- motion yang mendistorsi geometri interior;
- terlalu banyak kartu kecil;
- typography yang bersaing dengan photography;
- autoplay video besar pada semua section.

## 8. Color System

Tidak wajib pure black-white seperti reference. Interior portfolio lebih cocok memakai warm neutral palette yang berasal dari brand designer.

Contoh token awal:

```text
Ink           #171714
Warm White    #F2F0E9
Stone         #D9D3C7
Taupe         #A49B8C
Muted Line    rgba(23,23,20,.16)
```

Warna final harus mengikuti brand identity.

Prinsip:

- photography tetap menjadi sumber warna utama;
- UI tidak boleh merusak warna material pada foto;
- background neutral;
- accent color maksimal 1 warna jika memang bagian dari brand.

## 9. Typography

Disarankan menggunakan pasangan:

- editorial serif untuk statement tertentu; dan
- clean grotesk/sans-serif untuk informasi teknis.

Atau satu typeface family yang memiliki kontras weight kuat.

Role:

```text
Display Project Title   72–160 px desktop
Hero Statement          64–140 px desktop
Section Heading         40–72 px
Body                    16–20 px
Metadata                12–14 px
Project Specification   12–16 px
```

Typography harus tunduk pada photography.

## 10. Layout System

Gunakan 12-column grid desktop.

Prinsip komposisi:

- banyak negative space;
- asymmetric editorial placement;
- full-bleed project photography;
- kombinasi landscape, portrait, detail crop;
- floor plan dapat menjadi elemen grafis;
- metadata menggunakan grid yang konsisten;
- project page tidak terasa seperti gallery template generik.

---

# PART D — MOTION & SCROLL ARCHITECTURE

## 11. Motion Philosophy

Reference itsjay.us tetap dipakai pada level kualitas motion, bukan isi interaksi.

Interior design membutuhkan motion yang lebih restrained.

Motion harus mensimulasikan:

- memasuki ruang;
- membuka view;
- berpindah antar detail;
- melihat layer material;
- memahami transformasi before → after;
- melihat plan → realization.

Motion tidak boleh membuat dinding, furniture, dan perspektif terlihat tidak natural.

## 12. Runtime Model

Direkomendasikan:

- **Lenis:** smooth scrolling dan velocity data;
- **GSAP + ScrollTrigger:** scroll choreography, image reveal, pinned comparison, parallax, horizontal project gallery;
- **Motion:** menu, hover, filter state, modal, subtle pointer spring;
- **CSS:** masking, hover sederhana, typography, layout.

```text
User wheel/touch
      ↓
    Lenis
      ↓
scroll + velocity
      ↓
 GSAP ticker
      ↓
ScrollTrigger
      ↓
section timeline
```

## 13. Motion Ownership

| Interaction | Owner |
|---|---|
| Smooth scroll | Lenis |
| Scroll reveal | GSAP |
| Image parallax | GSAP |
| Before/after scrub | GSAP |
| Pinned floor-plan sequence | GSAP |
| Menu transition | Motion |
| Project filter state | Motion |
| Button hover | CSS/Motion |
| Pointer offset | Motion/GSAP quickTo |
| Marquee | GSAP |

Jangan mengubah `transform` DOM element yang sama menggunakan GSAP dan Motion secara bersamaan.

---

# PART E — HOME PAGE EXPERIENCE

## 14. Home Scroll Sequence

```text
INTRO
  ↓
HERO / SIGNATURE SPACE
  ↓
DESIGN POSITIONING
  ↓
FEATURED PROJECTS
  ↓
DESIGN PHILOSOPHY
  ↓
SERVICES
  ↓
PROCESS
  ↓
MATERIAL / DETAIL MOMENT
  ↓
TESTIMONIAL / CREDIBILITY
  ↓
PROJECT INQUIRY CTA
  ↓
FOOTER
```

## 15. Scene 01 — Intro

Durasi target:

```text
700–1100 ms
```

Sequence:

```text
page shell
↓
name / studio mark
↓
hero image reveal
↓
INTERIOR DESIGNER label
↓
project metadata
```

Gunakan masking atau clip-path.

Jangan menggunakan fake loading percentage.

## 16. Scene 02 — Hero / Signature Project

Hero harus menjawab dalam satu viewport:

- siapa designer;
- profesinya;
- karakter desain;
- lokasi/service area jika relevan;
- CTA Projects;
- CTA Start a Project.

Struktur contoh:

```text
┌─────────────────────────────────────────────┐
│ NAME / STUDIO               MENU            │
│                                             │
│            SIGNATURE PROJECT                │
│            FULL / LARGE IMAGE               │
│                                             │
│ INTERIOR                                    │
│ DESIGNER                                    │
│                                             │
│ Jakarta / Indonesia      View Projects →    │
└─────────────────────────────────────────────┘
```

`Jakarta / Indonesia` hanya contoh. Isi aktual wajib menggunakan lokasi designer sebenarnya.

### Recommended hero media

Prioritas:

1. final interior photography;
2. high-quality photoreal render jika proyek belum dibangun;
3. short cinematic interior reel sebagai enhancement.

Hero video bukan kewajiban.

### Pointer interaction

Jika digunakan, sangat kecil:

```text
translateX ±6px
translateY ±4px
scale 1.00 → 1.01
```

Hindari tilt besar karena interior photography bergantung pada perspektif yang akurat.

## 17. Scene 03 — Hero Scroll Transformation

Recommended interaction:

Saat user scroll:

```text
framed project image
        ↓
image expands
        ↓
near full-bleed space
        ↓
project metadata appears
```

Alternative:

```text
full-bleed image
        ↓
slow crop/pan
        ↓
next section overlaps gently
```

Gunakan `scale` sangat kecil, misalnya 1.04 → 1.00.

Jangan melakukan zoom ekstrem.

## 18. Scene 04 — Positioning Statement

Contoh struktur copy:

```text
WE DESIGN INTERIORS
AROUND THE WAY PEOPLE
LIVE, MOVE, AND FEEL.
```

Copy final harus disesuaikan dengan filosofi designer.

Motion:

- line-by-line masked reveal;
- subtle text opacity;
- visual tidak perlu bergerak banyak.

## 19. Scene 05 — Featured Projects

Home menampilkan 3–5 project terbaik.

Project card minimal menampilkan:

```text
Project Name
Project Type
Location
Year
```

Contoh:

```text
01 / KEMANG RESIDENCE
Residential — Jakarta
2026
```

### Desktop interaction

Recommended Option A:

Vertical scroll memberikan impulse pada horizontal project track tanpa mengunci user terlalu lama.

```text
scroll ↓

PROJECT 01 → PROJECT 02 → PROJECT 03
```

Alternative lebih editorial:

- alternating large image layouts;
- sticky project title;
- project image sequence.

Untuk interior design, alternating editorial layout lebih aman jika photography sangat kuat.

### Hover

Hover hanya memperlihatkan:

- subtle crop;
- project type;
- area;
- `View Project`.

Tidak perlu floating card yang menutupi foto interior.

## 20. Scene 06 — Design Philosophy

Bukan bio panjang.

Tujuan:

- menjelaskan perspektif desain;
- menunjukkan alasan di balik aesthetic;
- membedakan designer dari kompetitor.

Contoh content structure:

```text
FORM
FUNCTION
MATERIAL
LIGHT
HUMAN EXPERIENCE
```

Setiap kata dapat terhubung dengan 1 kalimat pendek.

## 21. Scene 07 — Services

Recommended 4–6 services, misalnya:

```text
01 Full-Service Interior Design
02 Space Planning
03 Interior Renovation
04 Furniture & Styling
05 3D Visualization
06 Design Consultation
```

Jika designer fokus pada sektor tertentu, gunakan sector-first:

```text
Residential
Commercial
Hospitality
Retail
Office
```

Jangan menampilkan service yang sebenarnya tidak ditawarkan.

### Sticky Media Interaction

Desktop:

```text
service list          sticky visual

Residential     →     living room image
Commercial      →     office image
Hospitality     →     restaurant image
```

Preview crossfade, bukan motion agresif.

## 22. Scene 08 — Process

Process adalah bagian penting untuk membangun trust.

Contoh generic process:

```text
01 Discovery / Brief
02 Site Survey
03 Concept Direction
04 Space Planning
05 Material & Lighting
06 3D Visualization
07 Technical Development
08 Procurement / Coordination
09 Installation / Supervision
10 Styling & Handover
```

Tahap aktual harus disesuaikan dengan workflow designer.

### Interaction

Gunakan scroll progress dengan satu diagram horizontal atau vertical.

Desktop:

```text
01 ── 02 ── 03 ── 04 ── 05 ── 06
           ↑ active
```

Setiap step dapat mengubah visual pendukung:

```text
brief photo
floor plan
moodboard
material palette
render
construction photo
final photo
```

Ini jauh lebih relevan dibanding `Modern Tech Stack` marquee pada PRD lama.

## 23. Scene 09 — Material & Detail Moment

Sebagai signature section.

Dapat menampilkan:

- stone;
- wood;
- fabric;
- metal;
- lighting;
- custom joinery;
- furniture details.

Layout:

```text
MATERIAL MATTERS

[wood] [stone] [fabric] [metal]
```

Bisa menggunakan slow infinite strip atau scroll-driven crop.

Jangan membuatnya seperti e-commerce swatch picker kecuali website memang menjual material/product.

## 24. Scene 10 — Credibility

Bergantung pada asset yang tersedia:

- client testimonial;
- press feature;
- award;
- selected client;
- completed project count;
- years of experience.

Semua angka harus faktual.

Jika belum ada, section dapat dihilangkan.

## 25. Scene 11 — Final CTA

Contoh:

```text
HAVE A SPACE
IN MIND?

LET'S DISCUSS
YOUR PROJECT.

Start a Project →
```

CTA membuka `/contact` atau inquiry drawer.

---

# PART F — PROJECT INDEX

## 26. Route

```text
/projects
```

## 27. Project Taxonomy

Primary filters:

```text
All
Residential
Commercial
Hospitality
Retail
Office
```

Tampilkan hanya kategori yang benar-benar ada.

Optional filters:

- year;
- location;
- scope;
- built / concept;
- renovation / new interior;
- residential subtype.

Jangan menambahkan filter jika total portfolio <8 project.

## 28. Project Card Data

Setiap card dapat menggunakan:

```text
Project Name
Type
Location
Year
Area
Status
```

Contoh:

```text
BINTARO HOUSE
Residential
South Tangerang
2026
320 m²
Completed
```

Area bersifat optional jika confidential.

## 29. Project Index Interaction

Recommended mode:

- large editorial grid;
- variable aspect ratio photography;
- hover scale maksimal 1.02;
- metadata appears/repositions subtly;
- filter transition menggunakan layout animation.

Avoid:

- tiny masonry cards;
- overly fast hover previews;
- UI yang mengalahkan photography.

---

# PART G — PROJECT CASE STUDY

## 30. Route

```text
/projects/[slug]
```

## 31. Case Study Objective

Case study harus membuktikan lima lapisan:

```text
PROBLEM
ROLE
PROCESS
FINAL SPACE
RESULT
```

Foto final saja tidak cukup untuk menjelaskan kompetensi designer.

## 32. Project Header

Wajib mendukung:

```text
Project Name
Project Type
Location
Year
Area
Status
Scope / Services
Designer Role
Client Type
```

Optional:

```text
Design Team
Architect
Contractor
Stylist
Photographer
Lighting Consultant
Landscape
Completion Date
Budget Range
```

Credits harus transparan.

## 33. Project Story Sequence

Recommended sequence:

```text
01 Project Hero
02 Overview
03 Client Brief
04 Existing Condition / Challenge
05 Design Concept
06 Space Planning
07 Material & Color Strategy
08 Lighting Strategy
09 Custom Furniture / Joinery
10 Visualization / Development
11 Construction / Implementation
12 Before & After
13 Final Photography
14 Outcome
15 Credits
16 Next Project
```

Tidak semua proyek wajib mempunyai semua section.

## 34. Client Brief

Contoh field:

```text
Client needs
Users / occupants
Lifestyle / operational needs
Must-have spaces
Pain points
Aesthetic direction
Timeline constraints
Budget constraints if publishable
```

## 35. Existing Condition

Dapat menampilkan:

- site photo;
- old floor plan;
- room limitations;
- circulation problem;
- natural light condition;
- ceiling/MEP constraints;
- existing furniture to retain.

## 36. Design Concept

Dapat menampilkan:

- concept statement;
- moodboard;
- visual references;
- design keywords;
- color story;
- material intent.

## 37. Space Planning

Sangat penting untuk membedakan interior designer dari sekadar styling portfolio.

Dukung:

- floor plan;
- zoning diagram;
- circulation;
- furniture layout;
- before/after plan;
- dimension callout jika relevan.

### Suggested scroll interaction

Desktop dapat menggunakan plan reveal:

```text
existing plan
     ↓ scroll
zoning overlay
     ↓
furniture plan
     ↓
final interior
```

Gunakan pinning singkat.

Mobile menjadi sequential blocks.

## 38. Material & Color Strategy

Support:

```text
Material Name
Application
Reason
Image / Texture
```

Contoh:

```text
Natural Oak
Cabinetry
Warmth + visual continuity
```

Hindari klaim teknis yang tidak memiliki sumber proyek.

## 39. Lighting Strategy

Dapat memuat:

- ambient;
- task;
- accent;
- natural light;
- fixture selection;
- temperature/mood;
- feature lighting.

Jangan menampilkan engineering calculation jika designer memang tidak mengerjakannya.

## 40. Custom Furniture / Joinery

Jika relevan, tampilkan:

- sketch;
- elevation;
- detail drawing;
- rendered detail;
- built result.

Ini memberikan proof yang kuat terhadap kemampuan teknis.

## 41. Before / After

Recommended implementation:

**Option A:** scroll scrub.

```text
BEFORE
  ↓ scroll
AFTER
```

**Option B:** draggable comparison slider.

Wajib:

- bekerja menggunakan keyboard jika interactive slider;
- memiliki label Before/After;
- tidak menjadi satu-satunya cara melihat hasil.

## 42. Final Photography

Photography sequence harus dikurasi seperti editorial:

```text
establishing view
↓
secondary angle
↓
functional moment
↓
detail
↓
material
↓
lighting
↓
human scale / lifestyle
```

Jangan hanya mengurutkan file berdasarkan nama atau upload time.

## 43. Outcome

Dapat memuat:

- fungsi yang berhasil diperbaiki;
- perubahan circulation;
- perubahan capacity;
- peningkatan storage;
- transformed atmosphere;
- client quote;
- publication/award;
- project completion status.

Jangan membuat angka impact jika tidak ada data.

## 44. Next Project Transition

Gunakan full-width preview proyek berikutnya:

```text
NEXT PROJECT
Project Name
[image]
```

Scroll atau hover dapat membuka image secara lembut.

---

# PART H — SERVICES

## 45. Route

```text
/services
```

## 46. Service Data Structure

Setiap service:

```text
Service Name
Ideal Client
Scope
Typical Deliverables
Process
What Is Included
What Is Not Included
Typical Project Type
CTA
```

Tidak harus mempublikasikan harga.

## 47. Example Services

### Full-Service Interior Design

Dapat mencakup:

- briefing;
- site analysis;
- concept;
- space planning;
- material selection;
- 3D visualization;
- technical drawing;
- furniture specification;
- vendor/contractor coordination;
- site review;
- styling.

### Design Consultation

Dapat mencakup:

- layout review;
- design direction;
- material/color recommendation;
- design problem review.

### Furnishing & Styling

Dapat mencakup:

- furniture selection;
- loose furniture;
- textiles;
- art;
- accessories;
- styling.

Semua scope final harus mengikuti layanan nyata designer.

---

# PART I — DESIGN PROCESS

## 48. Route

```text
/process
```

## 49. Process Page Objective

Menjawab:

- apa yang terjadi setelah inquiry;
- siapa melakukan apa;
- kapan client memberikan approval;
- kapan design masuk ke technical development;
- apakah designer terlibat di construction/procurement;
- kapan project dianggap selesai.

## 50. Recommended Process Structure

```text
01 Inquiry
02 Discovery Call
03 Site Visit / Survey
04 Proposal & Scope
05 Concept
06 Design Development
07 Technical Documentation
08 Procurement / Contractor Coordination
09 Site Implementation
10 Styling
11 Handover
```

Tahap harus disederhanakan sesuai praktek nyata.

---

# PART J — ABOUT

## 51. Route

```text
/about
```

## 52. Content

About page dapat memuat:

- portrait;
- short biography;
- design philosophy;
- background/education;
- experience;
- selected clients;
- awards/publications;
- approach;
- location/service area;
- collaboration model;
- software capability jika relevan untuk hiring.

Untuk personal interior designer, About harus terasa personal tetapi tetap profesional.

---

# PART K — EXPLORATIONS

## 53. Route

```text
/explorations
```

Pengganti `/lab` pada PRD lama.

## 54. Purpose

Menampilkan pekerjaan yang tidak harus berupa completed client project.

Contoh:

- material palette;
- furniture concept;
- joinery study;
- lighting study;
- color study;
- spatial experiment;
- rendering experiment;
- conceptual room;
- competition work;
- academic project;
- travel/interior references jika dikurasi.

## 55. Interaction

Dapat lebih eksperimental daripada halaman Projects:

- infinite image strip;
- material zoom;
- cursor detail;
- layered collage;
- scroll velocity gallery.

Tetap jangan membebani Home bundle.

---

# PART L — CONTACT / PROJECT INQUIRY

## 56. Route

```text
/contact
```

## 57. Primary CTA

Recommended labels:

```text
Start a Project
Discuss Your Space
Book a Consultation
Project Inquiry
```

Pilih satu sebagai CTA utama dan gunakan konsisten.

## 58. Inquiry Form

Minimum fields:

```text
Name
Email
Phone / WhatsApp (optional)
Project Type
Project Location
Approximate Area
Required Service
Project Status
Desired Timeline
Budget Range (optional / configurable)
Project Brief
How did you hear about us?
```

Optional:

```text
Upload Floor Plan
Upload Site Photos
Upload Inspiration PDF/Image
```

Upload dapat menjadi post-MVP jika backend belum diperlukan.

## 59. Qualification Logic

Project type options dapat berupa:

```text
Residential
Apartment
Villa
Office
Retail
F&B
Hospitality
Other
```

Status:

```text
New Build
Renovation
Furnishing Only
Still Exploring
```

Timeline:

```text
Immediately
1–3 Months
3–6 Months
6+ Months
Flexible
```

Budget field harus configurable dan tidak wajib ditampilkan jika designer tidak ingin melakukan budget qualification di website.

## 60. Inquiry Success State

Setelah submit:

```text
Thank you
↓
what happens next
↓
expected response process
↓
optional WhatsApp/email contact
```

Jangan menjanjikan response time tertentu kecuali memang merupakan SOP bisnis.

---

# PART M — CONTENT MODEL

## 61. Project Interface

```ts
interface InteriorProject {
  slug: string
  title: string
  year: number
  location: string
  projectType: ProjectType
  areaSqm?: number
  status: 'concept' | 'ongoing' | 'completed'
  featured: boolean
  order: number

  clientType?: string
  designRole: string[]
  services: string[]
  collaborators?: Credit[]

  summary: string
  brief?: string
  challenge?: string
  concept?: string
  spatialStrategy?: string
  materialStrategy?: string
  lightingStrategy?: string
  outcome?: string

  hero: MediaAsset
  gallery: MediaAsset[]
  beforeAfter?: BeforeAfterPair[]
  plans?: PlanAsset[]
  materialPalette?: MaterialItem[]
  credits?: Credit[]
}
```

## 62. Material Item

```ts
interface MaterialItem {
  name: string
  application?: string
  description?: string
  image: MediaAsset
}
```

## 63. Plan Asset

```ts
interface PlanAsset {
  title: string
  type:
    | 'existing'
    | 'zoning'
    | 'layout'
    | 'furniture'
    | 'lighting'
    | 'ceiling'
    | 'custom'
  media: MediaAsset
  caption?: string
}
```

## 64. Credit

```ts
interface Credit {
  role: string
  name: string
  url?: string
}
```

## 65. Media Asset

```ts
interface MediaAsset {
  type: 'image' | 'video'
  src: string
  alt: string
  width: number
  height: number
  poster?: string
  caption?: string
  photographer?: string
}
```

---

# PART N — CONTENT PREPARATION

## 66. Identity Assets

Siapkan:

- nama profesional/studio;
- role: `Interior Designer`, `Interior Architect`, atau role faktual lain;
- positioning statement;
- short bio 60–120 kata;
- full bio;
- design philosophy;
- location;
- service area;
- email;
- phone/WhatsApp jika digunakan;
- Instagram;
- LinkedIn jika relevan;
- resume/CV jika target juga recruiter;
- portrait;
- logo/wordmark jika ada.

## 67. Minimum Project Inventory

Ideal launch:

```text
4–8 strong projects
```

Jika hanya memiliki 3 project sangat kuat, lebih baik 3 daripada 10 project lemah.

Untuk setiap project siapkan:

- project name;
- location;
- year;
- area;
- type;
- status;
- role;
- scope;
- brief;
- constraints;
- concept;
- process;
- floor plan jika boleh dipublikasikan;
- moodboard;
- material palette;
- renders;
- construction/progress photo;
- final photography;
- before/after;
- credits;
- testimonial/result jika ada.

## 68. Recommended Image Inventory per Completed Project

```text
1 hero landscape
3–5 wide establishing shots
3–6 secondary angles
3–8 detail/material shots
1–3 plan/diagram assets
1–3 process assets
1 before/after pair if available
```

Tidak semuanya wajib.

## 69. Photography Requirements

- master image high resolution;
- sRGB output for web;
- horizon/perspective corrected sebelum export;
- consistent color grading;
- avoid excessive compression;
- photographer credits tersedia;
- client permission untuk publish jika dibutuhkan;
- image usage rights jelas.

## 70. Rendering Requirements

Jika menggunakan render:

- pisahkan jelas antara `Visualization`, `Concept`, `Ongoing`, dan `Completed`;
- jangan membuat render seolah-olah completed photography;
- gunakan consistent exposure dan color management;
- siapkan crop desktop + mobile bila hero membutuhkan komposisi berbeda.

---

# PART O — TECHNICAL ARCHITECTURE

## 71. Recommended Stack

### Frontend

- Next.js App Router
- React
- TypeScript
- Tailwind CSS

### Motion

- GSAP
- ScrollTrigger
- `@gsap/react`
- Motion
- Lenis

### Content

**Production recommendation:** Sanity CMS jika designer perlu menambah/mengubah project tanpa menyentuh code.

**Simpler MVP:** typed data + MDX.

### Hosting

- Vercel

### Forms

Pilihan:

- server action + email provider;
- Formspree/Resend-equivalent workflow;
- CRM integration pada fase berikutnya.

Jangan membuat database khusus hanya untuk form jika tidak dibutuhkan.

## 72. Proposed Repository Architecture

```text
app/
  layout.tsx
  page.tsx
  projects/
    page.tsx
    [slug]/page.tsx
  services/page.tsx
  process/page.tsx
  about/page.tsx
  explorations/page.tsx
  contact/page.tsx
  not-found.tsx

components/
  layout/
    Header.tsx
    MobileMenu.tsx
    Footer.tsx
    ProjectInquiryCTA.tsx

  home/
    Hero.tsx
    Positioning.tsx
    FeaturedProjects.tsx
    Philosophy.tsx
    ServicesPreview.tsx
    ProcessPreview.tsx
    MaterialMoment.tsx
    Credibility.tsx

  projects/
    ProjectGrid.tsx
    ProjectFilter.tsx
    ProjectHero.tsx
    ProjectFacts.tsx
    ProjectNarrative.tsx
    PlanSequence.tsx
    MaterialPalette.tsx
    BeforeAfter.tsx
    EditorialGallery.tsx
    ProjectCredits.tsx
    NextProject.tsx

  services/
    ServiceList.tsx
    ServiceDetail.tsx

  process/
    ProcessTimeline.tsx

  explorations/
    ExplorationGallery.tsx

  contact/
    ProjectInquiryForm.tsx

  motion/
    SmoothScrollProvider.tsx
    MaskReveal.tsx
    ParallaxMedia.tsx
    ImageReveal.tsx
    SplitTextReveal.tsx
    VelocityStrip.tsx

content/
  profile.ts
  services.ts
  process.ts
  projects/
  explorations/

lib/
  gsap.ts
  lenis.ts
  projects.ts
  seo.ts
  media.ts
  inquiry.ts

public/
  fonts/
  images/
  video/
  plans/
```

---

# PART P — RESPONSIVE RULES

## 73. Desktop ≥1280 px

Aktifkan:

- smooth scrolling;
- cinematic hero reveal;
- mild image parallax;
- horizontal/experimental featured project track;
- sticky project metadata;
- sticky process visualization;
- pinned plan transition;
- before/after scrub;
- material strip.

## 74. Tablet 768–1279 px

Kurangi:

- pin duration;
- parallax distance;
- hover dependency;
- large display type;
- multiple simultaneous media.

Pertahankan:

- project storytelling;
- plan;
- material section;
- filters;
- process.

## 75. Mobile <768 px

Mobile bukan desktop yang diperkecil.

Gunakan:

- native vertical reading;
- editorial stacked images;
- simple reveal;
- touch-safe filters;
- before/after tap/drag jika aman;
- project facts sebelum long gallery;
- sticky CTA hanya jika tidak mengganggu viewport.

Matikan:

- cursor-follow;
- pointer parallax;
- prolonged pinning;
- large 3D tilt;
- heavy auto-loop galleries.

---

# PART Q — PERFORMANCE

## 76. Performance Priorities

Interior portfolio berisiko berat karena high-resolution photography.

Prioritas utama:

1. image optimization;
2. responsive image sizing;
3. lazy loading;
4. correct aspect ratio;
5. poster-first video;
6. route-level code splitting;
7. CMS image transformations jika menggunakan CMS.

## 77. Performance Targets

Target launch:

```text
Lighthouse Performance     90+ target
Accessibility              95+
Best Practices              95+
SEO                         95+
CLS                         < 0.1
LCP                         < 2.5 s target
```

Nilai harus diuji pada halaman sebenarnya dan device/network representatif.

## 78. Image Budget

Recommended target:

```text
Hero initial image       < 350–500 KB where visually acceptable
Project thumbnail        < 200–300 KB
Below-fold project image lazy loaded
No full-resolution originals served directly
```

Tidak boleh mengorbankan color/detail berlebihan hanya untuk mengejar ukuran file.

## 79. Image Delivery

Gunakan:

- AVIF/WebP;
- responsive `sizes`;
- width variants;
- `next/image` atau CMS image CDN;
- blur/low quality placeholder;
- preload hanya hero LCP;
- lazy load media lain.

---

# PART R — ACCESSIBILITY

## 80. Requirements

- semantic heading structure;
- image alt text yang mendeskripsikan ruang secara relevan;
- captions tidak menjadi pengganti alt;
- filters keyboard accessible;
- visible focus state;
- Before/After tidak hanya bergantung drag;
- project detail tetap terbaca tanpa animation;
- color contrast memadai;
- `prefers-reduced-motion` didukung.

## 81. Reduced Motion

Saat aktif:

```text
Lenis smoothing      off/reduced
parallax             off
scrub zoom           off
pointer movement     off
long pin             off
```

Content tetap visible.

---

# PART S — SEO & DISCOVERABILITY

## 82. SEO Objectives

Website harus dapat ditemukan berdasarkan kombinasi:

```text
Designer Name
Interior Designer
Location
Project Type
Service
Project Name
```

Contoh pola title:

```text
Project Name — Residential Interior | Designer Name
```

Services:

```text
Residential Interior Design — Designer Name
```

Lokasi hanya digunakan jika faktual dan memang wilayah layanan.

## 83. Project Metadata

Setiap project memiliki:

- unique page title;
- meta description;
- social preview image;
- canonical URL;
- descriptive image alt;
- project category;
- location;
- year;
- credits.

## 84. Structured Data

Pertimbangkan schema yang sesuai dengan informasi faktual:

- Person atau Organization;
- WebSite;
- BreadcrumbList;
- CreativeWork untuk project bila sesuai;
- ProfessionalService/LocalBusiness hanya jika informasi bisnis dan lokasi memang memenuhi konteksnya.

Jangan membuat rating, review, alamat, atau service area palsu untuk SEO.

---

# PART T — ANALYTICS

## 85. Events

```text
hero_view_projects_click
hero_start_project_click
featured_project_click
project_filter_used
project_case_study_50
project_case_study_90
project_next_click
service_view
process_view
contact_start
contact_submit
whatsapp_click
email_click
instagram_click
resume_click
```

## 86. Meaningful Conversion

Primary conversion:

```text
contact_submit
```

Secondary:

```text
start_project_click
whatsapp_click
email_click
```

Engagement metric:

```text
project_case_study_50
project_case_study_90
```

---

# PART U — FUNCTIONAL REQUIREMENTS

## 87. FR-01 Global Navigation

Must provide:

- Projects;
- Services;
- Process;
- About;
- Contact.

Acceptance:

- pointer/touch/keyboard works;
- active route visible;
- menu closes on route change;
- focus management valid;
- no hidden essential links behind hover.

## 88. FR-02 Featured Projects

Home must show 3–5 featured projects.

Acceptance:

- title/type/location readable without hover;
- each project semantic link;
- responsive images;
- case-study route loads independently.

## 89. FR-03 Project Filters

If filters are enabled:

Acceptance:

- URL query optionally reflects filter;
- keyboard accessible;
- no blank-state bug;
- transition does not move page unexpectedly;
- `All` restores all projects.

## 90. FR-04 Case Study CMS/Data

Case studies generated from structured content.

Acceptance:

- metadata not duplicated manually in multiple components;
- optional sections disappear cleanly;
- image/video/plan blocks supported;
- next project deterministic.

## 91. FR-05 Before/After

Acceptance:

- works on pointer and touch;
- labels exist;
- both images independently accessible where practical;
- no layout shift.

## 92. FR-06 Process Page

Acceptance:

- real working stages only;
- CTA available at end;
- no fake milestones.

## 93. FR-07 Inquiry Form

Acceptance:

- required validation;
- email validation;
- clear error state;
- clear success state;
- spam protection;
- accessible labels;
- no sensitive file upload without proper backend policy.

## 94. FR-08 CMS

Jika Sanity digunakan:

Content editor dapat:

- create project;
- edit metadata;
- reorder projects;
- toggle featured;
- upload optimized media;
- add floor plan;
- add material items;
- hide confidential fields;
- publish/unpublish.

---

# PART V — NON-FUNCTIONAL REQUIREMENTS

## 95. Performance

- Server Components by default;
- Client Components only for interaction;
- animation libraries scoped;
- heavy Explorations module dynamic-loaded;
- no full gallery preload;
- no unnecessary global state.

## 96. Browser Support

Minimum test:

- Chrome desktop;
- Safari desktop;
- Firefox desktop;
- iOS Safari;
- Android Chrome.

## 97. Reliability

- no console errors;
- no duplicate ScrollTriggers;
- no route transition scroll lock;
- no broken image placeholder;
- form submission retry/error handled;
- direct reload `/projects/[slug]` works.

---

# PART W — QA MATRIX

## 98. Visual QA

Check:

- image crop per breakpoint;
- project image color consistency;
- typography wrapping;
- floor plan legibility;
- portrait/landscape rhythm;
- credits;
- image caption placement;
- no accidental stretching.

## 99. Interaction QA

Check:

- hero animation;
- scrolling forward/backward;
- filter animation;
- before/after;
- pinned sequences;
- next-project transition;
- menu transition;
- form validation;
- reduced motion.

## 100. Content QA

Check every project:

- project type;
- location;
- area;
- year;
- completion status;
- designer role;
- collaborator credits;
- photo credits;
- render vs built status;
- permission to publish.

---

# PART X — DEVELOPMENT PHASES

## 101. Phase 1 — Content Audit

Deliverables:

- project list;
- project scoring;
- photography audit;
- missing content checklist;
- service definition;
- real design process;
- positioning statement.

## 102. Phase 2 — Information Architecture

Deliverables:

- sitemap;
- project taxonomy;
- case-study template;
- inquiry fields;
- page hierarchy.

## 103. Phase 3 — Art Direction

Deliverables:

- moodboard;
- typography;
- color system;
- grid;
- photography treatment;
- motion principles.

## 104. Phase 4 — Figma

Design at minimum:

- Home desktop;
- Home mobile;
- Projects;
- Project Detail;
- Services;
- Process;
- About;
- Contact;
- Menu;
- 404.

## 105. Phase 5 — Static Frontend

Build all content and responsive layout before complex motion.

## 106. Phase 6 — CMS / Structured Content

Connect projects, services, process, and metadata.

## 107. Phase 7 — Motion Foundation

Implement:

- Lenis;
- GSAP registration;
- motion tokens;
- reduced motion;
- cleanup lifecycle.

## 108. Phase 8 — Signature Interaction

Implement only interactions that strengthen interior storytelling:

- hero image reveal;
- featured project track;
- plan sequence;
- before/after;
- process transformation;
- material strip;
- next-project transition.

## 109. Phase 9 — Optimization

- image audit;
- bundle audit;
- Lighthouse;
- mobile QA;
- color/image QA;
- accessibility.

## 110. Phase 10 — Launch

- domain;
- analytics;
- sitemap;
- SEO metadata;
- contact workflow;
- production QA.

---

# PART Y — RISKS

## 111. Risk: Portfolio menjadi image dump

Mitigation:

Setiap featured project memiliki narasi, role, process, dan outcome; bukan sekadar 20 foto berurutan.

## 112. Risk: Website terlihat seperti clone itsjay.us

Mitigation:

Pertahankan principle motion dan polish, tetapi ubah:

- grid;
- typography;
- palette;
- hero behavior;
- image composition;
- project storytelling;
- service flow;
- signature plan/material interactions.

## 113. Risk: Media terlalu berat

Mitigation:

- image CDN;
- correct sizes;
- AVIF/WebP;
- hero preload only;
- lazy-load gallery;
- mobile crops.

## 114. Risk: Interior photography rusak karena motion

Mitigation:

- no excessive tilt;
- no large warp;
- minimal scale;
- slow motion;
- preserve perspective.

## 115. Risk: Case studies disclose confidential information

Mitigation:

Content model membuat area, client identity, budget, floor plan, dan contractor data optional.

## 116. Risk: Service offering ambiguously presented

Mitigation:

Services page menjelaskan scope dan deliverables. Jangan menyuruh pengunjung menebak dari foto project.

## 117. Risk: Project inquiry terlalu panjang

Mitigation:

Gunakan progressive form atau hanya field qualification utama. File upload dan detail tambahan dapat dikumpulkan setelah initial contact.

---

# PART Z — ACCEPTANCE CRITERIA / DEFINITION OF DONE

## 118. Product Is Done When

- Home secara langsung mengomunikasikan Interior Designer + signature work;
- minimum 3 strong featured projects tersedia;
- setiap major project mempunyai dedicated case study;
- case study memperlihatkan final result dan cukup process proof;
- project type dan location mudah dibaca;
- Services menjelaskan apa yang dapat dikerjakan;
- Process menjelaskan bagaimana engagement berjalan;
- Contact menghasilkan project inquiry yang dapat ditindaklanjuti;
- semua project credits benar;
- render dan completed work dibedakan;
- desktop dan mobile dirancang secara terpisah;
- reduced motion bekerja;
- keyboard navigation bekerja;
- core media optimized;
- tidak ada critical console error;
- project routes mempunyai unique SEO metadata;
- website tidak terlihat sebagai clone reference;
- motion membantu membaca ruang, bukan mengganggunya.

---

# FINAL PRODUCT DECISION

## 119. Recommended Product Direction

Untuk Interior Designer, formula paling tepat bukan:

```text
portfolio + banyak animasi
```

melainkan:

```text
STRONG INTERIOR PHOTOGRAPHY
        +
CLEAR PROJECT STORY
        +
SPATIAL DESIGN PROOF
        +
EDITORIAL LAYOUT
        +
RESTRAINED PREMIUM MOTION
        +
CLEAR SERVICE & PROCESS
        +
QUALIFIED PROJECT INQUIRY
```

Stack yang direkomendasikan tetap:

```text
Next.js
TypeScript
Tailwind CSS
GSAP + ScrollTrigger
Motion
Lenis
Sanity CMS / MDX
Vercel
```

Perubahan terbesar berada pada **content architecture dan motion semantics**. Pada website Interior Designer, teknologi tidak perlu terlihat. Teknologi hanya bertugas membuat photography, floor plan, material, proses, dan final space terasa lebih hidup dan lebih mudah dipahami.

## 120. Recommended Signature Experience

Jika hanya memilih tiga interaction untuk membuat website berbeda dari portfolio interior biasa, gunakan:

1. **Hero Space Reveal** — signature project berkembang dari framed image menjadi immersive full-width space saat user mulai scroll.
2. **Plan-to-Space Sequence** — floor plan/zoning berubah bertahap menjadi final interior pada project case study.
3. **Material-to-Final Detail** — material palette bergerak menuju close-up built detail sehingga user melihat hubungan antara concept dan realization.

Tiga interaction tersebut lebih relevan bagi Interior Designer daripada mouse gimmick atau excessive 3D effects.
