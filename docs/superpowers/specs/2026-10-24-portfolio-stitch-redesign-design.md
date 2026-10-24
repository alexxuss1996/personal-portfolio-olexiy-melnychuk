# Portfolio Stitch Redesign

Date: 2026-10-24
Status: approved design, awaiting spec review
Source: Stitch project "Animated Portfolio Site Refresh" (screens: Portfolio Redesign, Portfolio Light Mode)

## Goal

Replace the current portfolio page with the Stitch design in both light and dark themes, keeping every existing behavior: section navigation, mobile menu, theme persistence, CV download, project/skill/social data, and the SendGrid contact form.

## Scope

In:

- Full visual rewrite of `Header`, `Hero`, `Projects`, `ProjectCard`, `Skills`, `SkillCard`, `Contact`, `ContactForm`, `Footer`.
- New design tokens in `src/styles/global.css`.
- Space Grotesk (display/labels) and Inter (body) fonts.
- Light and dark palettes driven by the existing `.dark` class.
- Responsive layouts at desktop, tablet, and mobile.

Out:

- New sections, new routes, CMS, or animation libraries.
- Fabricated hero stats. The Stitch stats strip is removed by user decision.
- Changes to SendGrid credentials or server behavior.
- Real project copy: `projects.json` stays as-is.

## Design Tokens

Light:

- canvas `#F7F7FB`
- panel `#FFFFFF`
- panel raised `#FFFFFF`
- ink `#111827`
- muted `#6B7280`
- border `rgba(17, 24, 39, 0.10)`
- glass `rgba(255, 255, 255, 0.72)`

Dark:

- canvas `#0B070D`
- panel `#17121C`
- panel raised `#231E25`
- ink `#F7EBE1`
- muted `#9E95A6`
- border `rgba(247, 235, 225, 0.10)`
- glass `rgba(23, 18, 28, 0.65)`

Shared:

- accent `#8B5CF6`, hover `#7C3AED`
- accent glow `rgba(139, 92, 246, 0.35)`
- radius: inputs 8px, cards 16px, hero/contact panel 24px, pills 9999px
- container max width 1280px

Typography:

- display: Space Grotesk, hero 56px/64px desktop, 36px/44px mobile, weight 700, tracking -0.03em
- headings: Space Grotesk 40px, 24px, 18px, weight 600
- body: Inter 18px/28px and 14px/20px
- labels: Space Grotesk 11-13px, uppercase, tracking 0.04em

Background:

- dark: base canvas, soft radial coral/violet glow behind hero, 28px dot grid at 3% opacity
- light: lavender-tinted canvas with the same grid and a soft violet radial glow

## Layout

### Header

Fixed, top, floating pill. Glass background with blur, hairline border, shadow.

- Left: `OM` circular monogram and name.
- Center: Overview, Projects, Stack, Contact.
- Right: theme toggle icon button, CV download pill.
- Mobile (<768px): monogram, theme toggle, hamburger. Nav collapses into a glass dropdown below the bar.
- Smooth scroll to sections, offset for fixed header.

### Hero

Centered, max-width 4xl.

- H1: "Hello, I'm **Olexiy Melnychuk**, Your **Passionate** Web Developer."
- Name uses violet gradient text; "Passionate" uses violet wavy underline.
- Subtitle: "Crafting intuitive, accessible, and high-performance digital interfaces with modern component architecture and dynamic web animations."
- CTAs: violet "View Projects" pill with arrow, neutral "Download CV" pill with download icon.
- No stats strip, no hero photo.

### Projects

Section title "Featured Projects", left-aligned. Responsive grid: 1 col mobile, 2 tablet, 4 desktop.

Card:

- 16:10 cover image, hover zoom.
- Status pill top-right using the first tag.
- Tag chips.
- Title, description clamped to 3 lines.
- Footer action row: violet Live Demo button (external icon), neutral GitHub button.
- Card hover: 1.5px lift, softened shadow.

All entries in `projects.json` render. `demo` uses the project's `demo` URL; `github` uses the GitHub URL. Existing bug where demo falls back to GitHub is fixed.

### Skills

Full-width band. Title "Technical Stack & Mastery" and one-line intro.

- Grid: 1 col mobile, 2 tablet, 3 desktop.
- Card: 56px tinted icon tile, title, body copy.
- Icon colors alternate accent, violet, teal, coral per card.
- Hover: surface lighten, lift, icon scale.

### Contact

Single large panel with ambient glow.

- Left (5/12): heading "Let's engineer something exceptional together.", intro, three direct-channel rows (phone, email, Telegram), three small social cards (LinkedIn, GitHub, Twitter), CV download link.
- Right (7/12): form card. First name, last name, email, phone, message, submit button.
- Form posts to the existing Astro POST handler and SendGrid integration. Labels are visible; inputs are accessible.

### Footer

Panel surface, monogram, copyright, social icon buttons, back-to-top link. Year computed at runtime.

## Component Changes

- `Layout.astro`: load both fonts, set body background/ink, keep smooth scroll.
- `global.css`: replace old theme palette with new tokens; keep `.dark` variant.
- `Header.astro`: new fixed pill header, new mobile drawer logic, keep theme toggle.
- `ThemeButton.astro`: restyle to square icon button, keep persistence script.
- `Hero.astro`: replace image hero with text hero and CTAs.
- `Projects.astro` / `ProjectCard.astro`: new grid and card markup; pass real demo URL.
- `Skills.astro` / `SkillCard.astro`: new grid and card markup.
- `Contact.astro` / `ContactForm.astro`: new panel layout; keep POST handler.
- `Footer.astro`: rewrite.
- Remove `Circle.astro`, `Logo.astro`, `LogoIcon.astro` after confirming no references.
- `src/images/hero.jpg` becomes unused; leave file in place to avoid touching user assets.

## Accessibility

- One `h1`, sequential headings.
- Visible focus rings on links, buttons, inputs, theme toggle, hamburger.
- Icon-only buttons have `aria-label`.
- Mobile menu toggles `aria-expanded`.
- Form inputs have labels and required states.
- Color contrast: ink on canvas/panel and muted on panel meet WCAG AA.
- Respect `prefers-reduced-motion` for transitions and smooth scroll.

## Testing

- `npm run build` passes (`astro check` + build).
- Dev server visual check at 1280px and 375px, light and dark.
- Nav links scroll to correct sections and close the mobile menu.
- Theme toggle persists after reload.
- All project cards render with distinct demo and GitHub links.
- Contact form still POSTs with same field names (`name`, `surname`, `phone`, `email`, `message`).
- CV download resolves to `/frontend-olexiy-melnychuk-cv.pdf`.
- Lighthouse-level sanity: no horizontal scroll, images sized, no layout shift from fonts.

## Risks

- Stitch mock uses Material Symbols. Implementation uses existing `astro-icon`/inline SVG to avoid a new runtime font.
- Light theme exists only as a screenshot; tokens above are the agreed interpretation.
- Project content is placeholder today; the design must tolerate long titles/descriptions.
