# Portfolio Stitch Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the portfolio page to match the Stitch light/dark design while preserving navigation, theme persistence, project and skill data, CV download, and the SendGrid contact form.

**Architecture:** Astro 7 + Tailwind CSS v4. Semantic design tokens live in `src/styles/global.css` as CSS variables switched by the existing `.dark` class. Each page section stays a focused Astro component under `src/components`, fed by the existing JSON data files.

**Tech Stack:** Astro, Tailwind CSS v4, `astro-icon` (`ph`, `fa`, `simple-icons`), Astro Fonts (Space Grotesk + Inter), SendGrid.

**Spec:** `docs/superpowers/specs/2026-10-24-portfolio-stitch-redesign-design.md`

## Global Constraints

- Single-page portfolio.
- Accent is `#8B5CF6`, hover `#7C3AED`.
- Dark canvas `#0B070D`, panel `#17121C`, ink `#F7EBE1`, muted `#9E95A6`.
- Light canvas `#F7F7FB`, panel `#FFFFFF`, ink `#111827`, muted `#6B7280`.
- Container max width `1280px`.
- Inputs radius 8px, cards 16px, large panels 24px, pills 9999px.
- Fonts: Space Grotesk for display/labels, Inter for body.
- Do not invent hero stats. Stats strip is removed.
- Contact form field names stay `name`, `surname`, `phone`, `email`, `message`.
- Do not add a runtime icon font or animation library.
- Keep `src/images/hero.jpg` on disk even if unused.

## Review Focus

- Mobile menu must open, close on link tap, and keep `aria-expanded` accurate.
- Theme toggle must survive reload and leave both palettes readable.
- Long project titles/descriptions must not break the 4-column card grid.
- Contact form must still POST the same five fields to the Astro handler.
- Cards must keep a 16:10 image ratio with no layout shift.

---

### Task 1: Tokens, fonts, and page shell

**Files:**
- Modify: `astro.config.mjs`
- Modify: `src/styles/global.css`
- Modify: `src/layouts/Layout.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Produces: utility classes `bg-canvas`, `bg-panel`, `bg-panel-raised`, `text-ink`, `text-muted`, `border-line`, `bg-glass`, `text-accent`, `bg-accent`, `border-accent`, `font-display`, `font-body`; radius utilities `rounded-card` (16px) and `rounded-panel` (24px).
- Produces: font CSS vars `--font-space-grotesk` and `--font-inter`.

- [ ] **Step 1: Add both fonts in `astro.config.mjs`**

Replace the single Lato entry with:

```js
fonts: [
  {
    provider: fontProviders.google(),
    name: "Space Grotesk",
    cssVariable: "--font-space-grotesk",
    weights: [500, 600, 700],
    styles: ["normal"],
    subsets: ["latin"],
  },
  {
    provider: fontProviders.google(),
    name: "Inter",
    cssVariable: "--font-inter",
    weights: [400, 500, 600],
    styles: ["normal"],
    subsets: ["latin"],
  },
],
```

- [ ] **Step 2: Replace `src/styles/global.css` tokens**

Keep `@import "tailwindcss";` and `@custom-variant dark`. Define raw variables in `:root`, dark overrides in `.dark`, then map them with `@theme inline`:

```css
:root {
  --canvas: #f7f7fb;
  --panel: #ffffff;
  --panel-raised: #f1f0f7;
  --ink: #111827;
  --muted: #6b7280;
  --line: rgb(17 24 39 / 0.10);
  --glass: rgb(255 255 255 / 0.72);
  --accent: #8b5cf6;
  --accent-hover: #7c3aed;
  --accent-glow: rgb(139 92 246 / 0.35);
}
.dark {
  --canvas: #0b070d;
  --panel: #17121c;
  --panel-raised: #231e25;
  --ink: #f7ebe1;
  --muted: #9e95a6;
  --line: rgb(247 235 225 / 0.10);
  --glass: rgb(23 18 28 / 0.65);
}
@theme inline {
  --color-canvas: var(--canvas);
  --color-panel: var(--panel);
  --color-panel-raised: var(--panel-raised);
  --color-ink: var(--ink);
  --color-muted: var(--muted);
  --color-line: var(--line);
  --color-glass: var(--glass);
  --color-accent: var(--accent);
  --color-accent-hover: var(--accent-hover);
  --font-display: var(--font-space-grotesk), ui-sans-serif, sans-serif;
  --font-body: var(--font-inter), ui-sans-serif, sans-serif;
  --radius-card: 1rem;
  --radius-panel: 1.5rem;
  --radius-pill: 9999px;
  --container-page: 80rem;
}
```

Remove all old color/text/radius tokens and the old `.container` utility; use `mx-auto w-full max-w-page px-4 sm:px-6 lg:px-8` instead. Add:

```css
@layer base {
  html { scroll-behavior: smooth; }
  body { background: var(--canvas); color: var(--ink); font-family: var(--font-body); }
  section[id] { scroll-margin-top: 6rem; }
  ::selection { background: var(--accent); color: #fff; }
  :focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
  @media (prefers-reduced-motion: reduce) {
    html { scroll-behavior: auto; }
    *, *::before, *::after { transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; }
  }
}
```

- [ ] **Step 3: Load fonts + add page background in `Layout.astro`**

Replace the Lato `<Font>` with:

```astro
<Font cssVariable="--font-space-grotesk" preload />
<Font cssVariable="--font-inter" />
```

Set `<body class="bg-canvas text-ink font-body antialiased">`. Add the fixed background layer as first body child:

```astro
<div class="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(#dec0bb_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.03]"></div>
<div class="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgb(139_92_246/0.14),transparent)]"></div>
<div class="relative z-10"><slot /></div>
```

Keep the viewport meta, favicon, title, and scrollbar styles (recolor thumb to `var(--accent)`).

- [ ] **Step 4: Add top-level layout spacing in `index.astro`**

Keep the component order. Wrap `Header` + `main` + `Footer`; add `pt-24` to `<main>` so the fixed header does not cover the hero.

```astro
<Layout title="Olexiy Melnychuk | Front-End Engineer">
  <Header />
  <main class="pt-24">
    <Hero />
    <Projects />
    <Skills />
    <Contact />
  </main>
  <Footer />
</Layout>
```

- [ ] **Step 5: Verify tokens and fonts compile**

Run: `npm run build`
Expected: PASS (`astro check` then build, no Tailwind unknown-class errors).

- [ ] **Step 6: Commit**

```bash
git add astro.config.mjs src/styles/global.css src/layouts/Layout.astro src/pages/index.astro
git commit -m "feat: add stitch design tokens and fonts"
```

---

### Task 2: Header, theme toggle, mobile menu

**Files:**
- Modify: `src/components/Header.astro`
- Modify: `src/components/ThemeButton.astro`

**Interfaces:**
- Consumes: `font-display`, `bg-glass`, `border-line`, `text-ink`, `text-muted`, `text-accent`, `bg-accent` utilities from Task 1.
- Produces: `#theme-toggle` button (existing id), `#menu-toggle` button with `aria-expanded`, `#mobile-nav` panel.

- [ ] **Step 1: Rewrite `Header.astro`**

Markup:

```astro
<header class="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6 lg:px-8">
  <div class="mx-auto flex h-16 max-w-page items-center justify-between rounded-full border border-line bg-glass px-4 shadow-[0_8px_30px_rgb(0_0_0/0.35)] backdrop-blur-2xl sm:px-6">
    <a href="#hero" class="flex items-center gap-3" aria-label="Olexiy Melnychuk — home">
      <span class="flex h-9 w-9 items-center justify-center rounded-full bg-panel-raised font-display text-sm font-semibold text-accent">OM</span>
      <span class="hidden font-display text-lg font-semibold tracking-tight sm:inline">Olexiy Melnychuk</span>
    </a>
    <nav class="hidden items-center gap-6 md:flex" aria-label="Main">
      <a href="#hero" class="font-display text-sm text-accent">Overview</a>
      <a href="#projects" class="font-display text-sm text-muted transition-colors hover:text-ink">Projects</a>
      <a href="#skills" class="font-display text-sm text-muted transition-colors hover:text-ink">Stack</a>
      <a href="#contact" class="font-display text-sm text-muted transition-colors hover:text-ink">Contact</a>
    </nav>
    <div class="flex items-center gap-2">
      <ThemeButton />
      <a href="/frontend-olexiy-melnychuk-cv.pdf" download class="hidden items-center gap-1.5 rounded-full border border-accent/30 bg-accent px-4 py-1.5 font-display text-sm text-white transition hover:bg-accent-hover sm:inline-flex">
        <Icon name="ph:download-simple-bold" width={16} height={16} /> CV
      </a>
      <button id="menu-toggle" type="button" class="flex h-9 w-9 items-center justify-center rounded-full bg-panel-raised text-ink md:hidden" aria-label="Toggle menu" aria-expanded="false" aria-controls="mobile-nav">
        <Icon name="ph:list-bold" width={18} height={18} />
      </button>
    </div>
  </div>
  <nav id="mobile-nav" class="mx-auto mt-2 hidden max-w-page rounded-2xl border border-line bg-glass p-2 backdrop-blur-2xl md:hidden" aria-label="Mobile">
    <a href="#hero" class="block rounded-xl px-4 py-3 font-display text-sm text-accent">Overview</a>
    <a href="#projects" class="block rounded-xl px-4 py-3 font-display text-sm text-muted hover:bg-panel-raised hover:text-ink">Projects</a>
    <a href="#skills" class="block rounded-xl px-4 py-3 font-display text-sm text-muted hover:bg-panel-raised hover:text-ink">Stack</a>
    <a href="#contact" class="block rounded-xl px-4 py-3 font-display text-sm text-muted hover:bg-panel-raised hover:text-ink">Contact</a>
    <a href="/frontend-olexiy-melnychuk-cv.pdf" download class="mt-1 block rounded-xl bg-accent px-4 py-3 text-center font-display text-sm font-semibold text-white">Download CV</a>
  </nav>
</header>

<script>
  const toggle = document.getElementById("menu-toggle");
  const menu = document.getElementById("mobile-nav");
  toggle?.addEventListener("click", () => {
    menu?.classList.toggle("hidden");
    const open = !menu?.classList.contains("hidden");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });
  menu?.querySelectorAll("a").forEach((link) =>
    link.addEventListener("click", () => {
      menu.classList.add("hidden");
      toggle?.setAttribute("aria-expanded", "false");
    }),
  );
</script>
```

Import `Icon` from `astro-icon/components` and `ThemeButton`. Remove old smooth-scroll JS and hamburger CSS; native `scroll-behavior` + `scroll-margin-top` handles it.

- [ ] **Step 2: Restyle `ThemeButton.astro`**

```astro
<button id="theme-toggle" type="button" class="flex h-9 w-9 items-center justify-center rounded-full bg-panel-raised text-muted transition-colors hover:text-ink" aria-label="Toggle theme">
  <Icon name="ph:sun-bold" width={18} height={18} class="hidden dark:block" />
  <Icon name="ph:moon-bold" width={18} height={18} class="dark:hidden" />
</button>
```

Keep the existing inline theme script and `#theme-toggle` id. Keep localStorage behavior unchanged.

- [ ] **Step 3: Verify**

Run: `npm run build`
Expected: PASS.

Run: `curl -s http://localhost:4321 | grep -o 'id="menu-toggle"'`
Expected: `id="menu-toggle"`.

- [ ] **Step 4: Commit**

```bash
git add src/components/Header.astro src/components/ThemeButton.astro
git commit -m "feat: rebuild header with glass nav and mobile menu"
```

---

### Task 3: Hero

**Files:**
- Modify: `src/components/Hero.astro`

**Interfaces:**
- Consumes: Task 1 tokens.
- Produces: `#hero` section with `#projects` and CV CTAs. No image imports.

- [ ] **Step 1: Replace `Hero.astro` markup**

```astro
<section id="hero" class="relative overflow-hidden px-4 pb-24 pt-12 text-center sm:px-6 md:pb-32 md:pt-20 lg:px-8">
  <div class="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[340px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-accent/20 via-accent/10 to-transparent blur-[110px]"></div>
  <div class="mx-auto max-w-4xl space-y-4">
    <h1 class="font-display text-4xl font-bold leading-[1.15] tracking-[-0.02em] sm:text-5xl lg:text-[56px] lg:leading-[64px]">
      Hello, I’m <span class="bg-gradient-to-r from-accent to-accent-hover bg-clip-text text-transparent">Olexiy Melnychuk</span>,<br />
      Your <span class="underline decoration-accent decoration-wavy underline-offset-8">Passionate</span> Web Developer.
    </h1>
    <p class="mx-auto max-w-2xl pt-2 text-base leading-7 text-muted sm:text-lg sm:leading-8">
      Crafting intuitive, accessible, and high-performance digital interfaces with modern component architecture and dynamic web animations.
    </p>
  </div>
  <div class="mt-10 flex flex-wrap items-center justify-center gap-4">
    <a href="#projects" class="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent px-8 py-3.5 font-display text-lg font-semibold text-white transition hover:bg-accent-hover hover:shadow-[0_0_28px_var(--accent-glow)]">
      View Projects <Icon name="ph:arrow-right-bold" width={20} height={20} />
    </a>
    <a href="/frontend-olexiy-melnychuk-cv.pdf" download class="inline-flex items-center gap-2 rounded-full bg-panel px-7 py-3.5 font-display text-lg font-semibold text-ink ring-1 ring-line transition hover:bg-panel-raised">
      <Icon name="ph:file-text-bold" width={20} height={20} /> Download CV
    </a>
  </div>
</section>
```

Import `Icon`. Remove `Image`, `HeroImage`, and all old classes.

- [ ] **Step 2: Verify hero renders and old image is gone**

Run: `npm run build`
Expected: PASS.

Run: `grep -c "hero.jpg" src/components/Hero.astro`
Expected: `0`.

- [ ] **Step 3: Commit**

```bash
git add src/components/Hero.astro
git commit -m "feat: rebuild hero section"
```

---

### Task 4: Projects grid and cards

**Files:**
- Modify: `src/components/Projects.astro`
- Modify: `src/components/ProjectCard.astro`

**Interfaces:**
- Consumes: `projects` from `src/data/projects.json`; Task 1 tokens.
- Produces: `ProjectCard` props unchanged (`image`, `title`, `tags`, `description`, `demo`, `github`).
- Fixes: `Projects.astro` passes `demo={demo}`, not `demo={github}`.

- [ ] **Step 1: Rewrite `Projects.astro`**

```astro
---
import ProjectCard from "@components/ProjectCard.astro";
import { projects } from "../data/projects.json";
---

<section id="projects" class="mx-auto w-full max-w-page px-4 py-20 sm:px-6 lg:px-8">
  <h2 class="mb-12 font-display text-4xl font-semibold tracking-tight">Featured Projects</h2>
  <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
    {projects.map(({ id, image, title, description, tags, demo, github }) => (
      <ProjectCard key={id} image={image} title={title} description={description} demo={demo} github={github} tags={tags} />
    ))}
  </div>
</section>
```

Remove `Circle`.

- [ ] **Step 2: Rewrite `ProjectCard.astro`**

Keep the glob + `Image` import. Card markup:

```astro
<article class="group flex flex-col overflow-hidden rounded-card bg-panel ring-1 ring-line transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_36px_rgb(0_0_0/0.25)]">
  <div class="relative aspect-[16/10] overflow-hidden bg-panel-raised">
    <Image width={640} height={400} quality={75} format="webp" alt={title} src={images[image]()} class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
    <div class="absolute inset-0 bg-gradient-to-t from-panel/80 to-transparent opacity-60"></div>
    {tags[0] && <span class="absolute right-3 top-3 rounded-full bg-canvas/80 px-2.5 py-1 font-display text-[11px] font-semibold uppercase tracking-wider text-accent backdrop-blur-md">{tags[0]}</span>}
  </div>
  <div class="flex flex-1 flex-col p-5">
    <ul class="mb-3 flex flex-wrap gap-1.5">
      {tags.map((tag) => <li class="rounded bg-panel-raised px-2 py-0.5 font-display text-[11px] text-muted">{tag}</li>)}
    </ul>
    <h3 class="mb-2 font-display text-2xl font-semibold leading-tight">{title}</h3>
    <p class="mb-6 line-clamp-3 text-sm leading-5 text-muted">{description}</p>
    <div class="mt-auto flex items-center gap-3 border-t border-line pt-4">
      <a href={demo} target="_blank" rel="noopener noreferrer" class="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-accent/30 bg-accent py-2 font-display text-sm font-medium text-white transition hover:bg-accent-hover">
        Live Demo <Icon name="ph:arrow-square-out-bold" width={16} height={16} />
      </a>
      <a href={github} target="_blank" rel="noopener noreferrer" class="flex items-center gap-1 rounded-lg bg-panel-raised px-3 py-2 font-display text-sm text-ink transition hover:bg-line">
        <Icon name="ph:code-bold" width={16} height={16} /> GitHub
      </a>
    </div>
  </div>
</article>
```

Import `Icon`. Make the card `<article>`; no `key` in Astro (remove it from ProjectCard call).

- [ ] **Step 3: Verify demo URLs**

Run: `grep -n "demo=" src/components/Projects.astro`
Expected: `demo={demo}`.

Run: `npm run build`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/components/Projects.astro src/components/ProjectCard.astro
git commit -m "feat: rebuild project cards grid"
```

---

### Task 5: Skills

**Files:**
- Modify: `src/components/Skills.astro`
- Modify: `src/components/SkillCard.astro`

**Interfaces:**
- Consumes: `skills` from `src/data/skills.json`; Task 1 tokens.
- Produces: `SkillCard` props unchanged (`title`, `icon`, `description`).

- [ ] **Step 1: Rewrite `Skills.astro`**

```astro
---
import SkillCard from "@components/SkillCard.astro";
import { skills } from "../data/skills.json";
---

<section id="skills" class="relative overflow-hidden border-y border-line bg-panel py-24">
  <div class="pointer-events-none absolute -right-32 top-1/4 h-96 w-96 rounded-full bg-accent/10 blur-[130px]"></div>
  <div class="relative z-10 mx-auto w-full max-w-page px-4 sm:px-6 lg:px-8">
    <div class="mx-auto mb-16 max-w-2xl text-center">
      <h2 class="font-display text-4xl font-semibold tracking-tight">Technical Stack &amp; Mastery</h2>
      <p class="mt-3 text-sm leading-6 text-muted">Specialized in creating robust web apps with clean separation of concerns and maintainable codebases.</p>
    </div>
    <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {skills.map(({ id, title, icon, description }, index) => (
        <SkillCard id={id} icon={icon} title={title} description={description} tone={["accent", "sky", "teal"][index % 3]} />
      ))}
    </div>
  </div>
</section>
```

Remove `Circle`. `tone` is new; define it in SkillCard.

- [ ] **Step 2: Rewrite `SkillCard.astro` with tone prop**

```astro
---
import { Icon } from "astro-icon/components";
export interface SkillCardProps {
  title: string;
  icon: string;
  description: string;
  tone?: "accent" | "sky" | "teal";
}
const { title, description, icon, tone = "accent" } = Astro.props as SkillCardProps;
const tones = {
  accent: "text-accent bg-accent/10",
  sky: "text-sky-400 bg-sky-400/10",
  teal: "text-teal-300 bg-teal-300/10",
};
---

<article class="group rounded-card bg-panel p-8 ring-1 ring-line transition duration-300 hover:-translate-y-1 hover:bg-panel-raised hover:shadow-xl">
  <div class={`mb-6 flex h-14 w-14 items-center justify-center rounded-xl ${tones[tone]} transition-transform group-hover:scale-110`}>
    <Icon name={icon} width={28} height={28} />
  </div>
  <h3 class="mb-3 font-display text-2xl font-semibold">{title}</h3>
  <p class="text-sm leading-relaxed text-muted">{description}</p>
</article>
```

- [ ] **Step 3: Verify**

Run: `npm run build`
Expected: PASS.

Run: `grep -c "SkillCard" src/components/Skills.astro`
Expected: `2` (import + usage).

- [ ] **Step 4: Commit**

```bash
git add src/components/Skills.astro src/components/SkillCard.astro
git commit -m "feat: rebuild skills grid"
```

---

### Task 6: Contact panel and form

**Files:**
- Modify: `src/components/Contact.astro`
- Modify: `src/components/ContactForm.astro`
- Modify: `src/components/Socials.astro`

**Interfaces:**
- Consumes: `socials` from `src/data/socials.json`; Task 1 tokens.
- Produces: form fields with names `name` (first name), `surname`, `phone`, `email`, `message`.
- Keeps: SendGrid POST handler in `ContactForm.astro` frontmatter unchanged.

- [ ] **Step 1: Rewrite `Contact.astro` with two-column panel**

Left column uses social data:

```astro
---
import ContactForm from "@components/ContactForm.astro";
import { socials } from "../data/socials.json";
import { Icon } from "astro-icon/components";

const direct = socials.filter((s) => ["fa:phone", "fa:envelope", "fa:telegram"].includes(s.icon));
const networks = socials.filter((s) => ["fa:linkedin", "fa:github", "fa:twitter"].includes(s.icon));
const labels: Record<string, string> = {
  "fa:phone": "Direct Phone",
  "fa:envelope": "Email Address",
  "fa:telegram": "Telegram",
};
---

<section id="contact" class="mx-auto w-full max-w-page px-4 py-24 sm:px-6 lg:px-8">
  <div class="relative overflow-hidden rounded-panel bg-panel p-8 ring-1 ring-line shadow-2xl sm:p-12 lg:p-16">
    <div class="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-accent/20 blur-[90px]"></div>
    <div class="relative z-10 grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-16">
      <div class="flex h-full flex-col justify-between space-y-8 lg:col-span-5">
        <div>
          <h2 class="font-display text-4xl font-semibold leading-tight tracking-tight">Let’s engineer something exceptional together.</h2>
          <p class="mt-4 text-sm leading-6 text-muted">I am open to full-time engineering roles, contract opportunities, and open-source collaborations. Drop me a line anytime.</p>
        </div>
        <div class="space-y-3.5">
          {direct.map((item) => (
            <a href={item.url} class="group flex items-center gap-3.5 rounded-xl bg-panel-raised p-3 transition hover:text-accent">
              <span class="flex h-10 w-10 items-center justify-center rounded-lg bg-canvas text-accent"><Icon name={item.icon} width={18} height={18} /></span>
              <span class="flex min-w-0 flex-col">
                <span class="font-display text-[11px] uppercase tracking-wider text-muted">{labels[item.icon]}</span>
                <span class="truncate font-display text-lg font-semibold">{item.text}</span>
              </span>
            </a>
          ))}
          <div class="grid grid-cols-3 gap-2.5 pt-2">
            {networks.map((item) => (
              <a href={item.url} target="_blank" rel="noopener noreferrer" class="group flex flex-col items-center rounded-xl bg-panel-raised p-3 text-center transition hover:bg-line">
                <span class="mb-1 font-display text-[11px] text-accent">{item.icon.replace("fa:", "").replace("-square", "")}</span>
                <span class="font-display text-[11px] text-muted group-hover:text-ink">{item.text.replace(/^https?:\/\/(www\.)?/, "")}</span>
              </a>
            ))}
          </div>
        </div>
        <a href="/frontend-olexiy-melnychuk-cv.pdf" download class="inline-flex items-center gap-2 font-display text-lg font-semibold text-accent transition hover:text-ink">
          <Icon name="ph:download-simple-bold" width={20} height={20} /> Download CV (PDF)
        </a>
      </div>
      <div class="rounded-card bg-panel-raised/70 p-6 backdrop-blur-md sm:p-8 lg:col-span-7">
        <ContactForm />
      </div>
    </div>
  </div>
</section>
```

Remove `Circle` and `Socials` import. Keep the old `Socials.astro` file untouched (unused) or delete it. Delete to avoid dead code.

- [ ] **Step 2: Rewrite `ContactForm.astro` markup, keep SendGrid frontmatter**

Keep the existing `SendGrid.setApiKey(...)` + `if (Astro.request.method === "POST") { ... }` block exactly. Replace markup with labels and the same names:

```astro
<form method="post" class="space-y-4">
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
    <label class="flex flex-col gap-1.5 font-display text-[11px] uppercase tracking-wider text-muted">
      First Name
      <input name="name" type="text" required autocomplete="given-name" placeholder="e.g. Elena" class="rounded-lg border border-line bg-panel px-4 py-3 font-body text-sm text-ink placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/40" />
    </label>
    <label class="flex flex-col gap-1.5 font-display text-[11px] uppercase tracking-wider text-muted">
      Last Name
      <input name="surname" type="text" autocomplete="family-name" placeholder="e.g. Rostova" class="rounded-lg border border-line bg-panel px-4 py-3 font-body text-sm text-ink placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/40" />
    </label>
  </div>
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
    <label class="flex flex-col gap-1.5 font-display text-[11px] uppercase tracking-wider text-muted">
      Email Address
      <input name="email" type="email" required autocomplete="email" placeholder="name@company.com" class="rounded-lg border border-line bg-panel px-4 py-3 font-body text-sm text-ink placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/40" />
    </label>
    <label class="flex flex-col gap-1.5 font-display text-[11px] uppercase tracking-wider text-muted">
      Phone Number
      <input name="phone" type="tel" required autocomplete="tel" placeholder="+380..." class="rounded-lg border border-line bg-panel px-4 py-3 font-body text-sm text-ink placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/40" />
    </label>
  </div>
  <label class="flex flex-col gap-1.5 font-display text-[11px] uppercase tracking-wider text-muted">
    Message
    <textarea name="message" rows="4" required placeholder="Describe your project, timeline, or inquiry..." class="resize-none rounded-lg border border-line bg-panel px-4 py-3 font-body text-sm text-ink placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/40"></textarea>
  </label>
  <button type="submit" class="flex w-full items-center justify-center gap-2 rounded-xl border border-accent/40 bg-accent py-4 font-display text-lg font-semibold text-white transition hover:bg-accent-hover hover:shadow-[0_0_30px_var(--accent-glow)]">
    Send Message <Icon name="ph:paper-plane-tilt-bold" width={20} height={20} />
  </button>
</form>
```

Remove the old inline `form.submit()` script; native POST is the intended behavior. Import `Icon`.

- [ ] **Step 3: Verify form contract**

Run: `grep -o 'name="[a-z]*"' src/components/ContactForm.astro | sort -u`
Expected exactly: `name="email"`, `name="message"`, `name="name"`, `name="phone"`, `name="surname"`.

Run: `npm run build`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/components/Contact.astro src/components/ContactForm.astro
git rm src/components/Socials.astro
git commit -m "feat: rebuild contact panel and form"
```

---

### Task 7: Footer, cleanup, final verification

**Files:**
- Modify: `src/components/Footer.astro`
- Delete: `src/components/Circle.astro`, `src/components/Logo.astro`, `src/components/LogoIcon.astro`

**Interfaces:**
- Consumes: `socials`; Task 1 tokens.
- Produces: final page.

- [ ] **Step 1: Rewrite `Footer.astro`**

```astro
---
import { socials } from "../data/socials.json";
import { Icon } from "astro-icon/components";
---

<footer class="mt-24 border-t border-line bg-panel">
  <div class="mx-auto flex w-full max-w-page flex-col items-center justify-between gap-6 px-6 py-10 md:flex-row lg:px-12">
    <div class="flex flex-col items-center gap-2 text-center sm:flex-row sm:text-left">
      <span class="flex h-9 w-9 items-center justify-center rounded-full bg-panel-raised font-display text-sm font-semibold text-accent">OM</span>
      <p class="text-sm text-muted">© {new Date().getFullYear()} Olexiy Melnychuk. Engineered with precision.</p>
    </div>
    <div class="flex items-center gap-4">
      {socials.map((social) => (
        <a href={social.url} target="_blank" rel="noopener noreferrer" aria-label={social.text} class="flex h-9 w-9 items-center justify-center rounded-lg bg-panel-raised text-muted transition hover:bg-line hover:text-accent">
          <Icon name={social.icon} width={18} height={18} />
        </a>
      ))}
      <a href="#hero" aria-label="Back to top" class="flex h-9 w-9 items-center justify-center rounded-lg bg-panel-raised text-muted transition hover:bg-line hover:text-accent">
        <Icon name="ph:arrow-up-bold" width={18} height={18} />
      </a>
    </div>
  </div>
</footer>
```

- [ ] **Step 2: Delete dead components after confirming no references**

Run: `grep -rn "Circle.astro\|Logo.astro\|LogoIcon.astro" src`
Expected: no output.

Then:

```bash
git rm src/components/Circle.astro src/components/Logo.astro src/components/LogoIcon.astro
```

- [ ] **Step 3: Build and run visual checks**

Run: `npm run build`
Expected: PASS with no TypeScript or Astro errors.

Run: `npm run dev` in a background shell, then screenshot at 1280px and 375px in both themes using the installed Chromium. Confirm:
- No horizontal scrollbar.
- Header pill stays on top, hero not hidden.
- Project grid is 4 / 2 / 1 columns.
- Mobile menu opens and closes.
- Light and dark both readable.

- [ ] **Step 4: Final grep checks**

Run:

```bash
grep -rn "text-bittersweet\|bg-white-smoke\|dark:bg-dark\|Circle" src || true
grep -rn "hero.jpg" src || true
```

Expected: no output (old palette and hero image gone).

Run: `git status --short`
Expected: only intended files changed.

- [ ] **Step 5: Commit**

```bash
git add src/components/Footer.astro
git commit -m "feat: rebuild footer and remove dead decorations"
```
