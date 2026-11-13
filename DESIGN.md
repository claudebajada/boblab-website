---
name: BOB Lab
description: A clear teal research directory for the Boundaries of the Brain laboratory.
colors:
  ink: "#123d47"
  teal: "#073e4b"
  cyan: "#50c6db"
  ground: "#f5f8f5"
  wash: "#e9f0ed"
  muted: "#536b70"
  line: "#cbd8d4"
  white: "#fff"
  selection: "#0c7389"
  focus: "#0a7b92"
  teal-hover: "#0b5968"
  dark-support: "#c9e1e4"
  dark-line: "#40717a"
  story: "#dce9e9"
  archive: "#eef3ef"
  footer-text: "#f1f7f3"
typography:
  display:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "clamp(3.25rem, 6.4vw, 6rem)"
    fontWeight: 550
    lineHeight: 1.12
    letterSpacing: "-0.035em"
  hero-display:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "clamp(3.5rem, 7.4vw, 6rem)"
    fontWeight: 500
    lineHeight: 1.04
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "clamp(2rem, 3.2vw, 3.1rem)"
    fontWeight: 550
    lineHeight: 1.12
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "clamp(1.35rem, 2vw, 1.8rem)"
    fontWeight: 550
    lineHeight: 1.12
    letterSpacing: "-0.025em"
  citation:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "clamp(1.4rem, 2.2vw, 2rem)"
    fontWeight: 550
    lineHeight: 1.3
    letterSpacing: "-0.035em"
  body:
    fontFamily: "Manrope, system-ui, sans-serif"
    lineHeight: 1.65
  intro-body:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "clamp(1.1rem, 1.7vw, 1.35rem)"
    lineHeight: 1.65
  label:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "0.88rem"
    lineHeight: 1.65
  action:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontWeight: 650
    lineHeight: 1.65
spacing:
  gutter: "clamp(1.3rem, 4.7vw, 5rem)"
  section: "clamp(3.5rem, 6.3vw, 6rem)"
  grid-gap: "5rem"
  row: "2.5rem"
  heading-gap: "1.5rem"
  paragraph-gap: "1.2rem"
  inline-gap: "0.75rem"
components:
  button-primary:
    backgroundColor: "{colors.teal}"
    textColor: "{colors.white}"
    typography: "{typography.action}"
    padding: "1rem 1.3rem"
  button-primary-hover:
    backgroundColor: "{colors.teal-hover}"
  inline-link:
    typography: "{typography.action}"
  navigation:
    textColor: "{colors.ink}"
    padding: "0.8rem 0"
  hero-research-link:
    textColor: "{colors.ground}"
    padding: "1rem 0"
  project-row:
    textColor: "{colors.ink}"
    padding: "2.5rem 0"
  citation-row:
    textColor: "{colors.ink}"
    padding: "2.5rem 0"
  alumni-row:
    textColor: "{colors.ink}"
    padding: "1.15rem 0"
  duck-disclosure:
    textColor: "{colors.ink}"
---

# Design System: BOB Lab

## Overview

**Creative North Star: "Clear teal research directory"**

The site takes its visual language from campus and museum wayfinding: a strong lab identity, plain directions, open rows, and enough space to read the work carefully. The supplied BOB artwork remains the identity anchor. Deep teal fields and large Manrope headings give the lab a confident public presence; pale green-white reading areas keep projects, people, and citations approachable.

The system is flat, typographic, and deliberately light on interface furniture. Project links look like destinations on a sign, while repeated ruled rows support scanning and longer reading. The responsive version keeps the same sequence and personality, collapsing columns and using native disclosures for the menu and optional duck discoveries.

**Key Characteristics:**

- Broad teal identity fields with cyan directional accents.
- One self-hosted type family, large headings, and restrained metadata.
- Square surfaces, thin rules, and open content rows.
- Generous fluid gutters and single-column reading on mobile.
- Preserved BOB logos and small, optional duck disclosures.

Recorded from `public/styles.css`, `src/templates/page.html`, `scripts/render.mjs`, and reviewed desktop/mobile renders. Values below describe the built site.

## Colors

Petrol teal and pale green-white carry the composition; cyan supplies a brighter cue inside dark fields. Frontmatter values preserve the stylesheet's canonical hex values. The stylesheet defines the site palette.

### Primary

- **Petrol teal — `teal`:** hero, footer, and the filled toolbox action.
- **Directional cyan — `cyan`:** the hero's final full stop, directory arrows, and keyboard focus on dark fields.
- **Hover teal — `teal-hover`:** the filled action's hover state.
- **Selection teal — `selection`:** selected text background, with white text.
- **Focus teal — `focus`:** visible keyboard outlines on light surfaces.

### Neutral

- **Deep teal ink — `ink`:** primary text on light surfaces.
- **Green-white ground — `ground`:** the main page background and hero text.
- **Pale green wash — `wash`:** research programme and alumni section backgrounds.
- **Slate teal — `muted`:** introductions, roles, dates, and publication metadata on light surfaces.
- **Light sage rule — `line`:** dividers and section boundaries on light surfaces.
- **White — `white`:** filled-action text, selection text, and the skip-link background.
- **Pale blue support — `dark-support`:** secondary text in the hero and footer.
- **Muted teal rule — `dark-line`:** dividers inside the dark identity fields.
- **Story wash — `story`:** the homepage outreach band.
- **Archive wash — `archive`:** the earlier-projects band.
- **Footer white — `footer-text`:** primary footer text.

### Named Rules

**The Teal Field Rule.** Use broad teal fields for the identity and closing contact area; keep long research and citation reading on the light ground or pale washes.

## Typography

**Display Font:** Manrope, with `system-ui, sans-serif` fallbacks.

**Body Font:** Manrope, with the same fallbacks. The variable font is self-hosted at `public/fonts/manrope-variable.ttf`, declares weights 200–800, and uses `font-display: swap`.

**Character:** One clean sans-serif voice connects the large lab sign with the detailed research directory. Tight heading tracking and moderate weights provide emphasis without a second display face. Metadata remains sentence case.

### Hierarchy

- **Hero display:** weight 500, `clamp(3.5rem, 7.4vw, 6rem)`, line-height 1.04, tracking −0.04em. At 720px and below: `clamp(2.85rem, 8.9vw, 4rem)`, line-height 1.08; at 390px and below: 3rem.
- **Display / page heading:** weight 550, `clamp(3.25rem, 6.4vw, 6rem)`, line-height 1.12, tracking −0.035em. Inner-page headings have a 22ch maximum and switch to `clamp(2.8rem, 8.8vw, 4rem)` at 720px and below.
- **Headline:** weight 550, `clamp(2rem, 3.2vw, 3.1rem)`, line-height 1.12, tracking −0.035em. Several reading-section headings are explicitly 2rem.
- **Title:** weight 550, `clamp(1.35rem, 2vw, 1.8rem)`, line-height 1.12, tracking −0.025em. Homepage project titles and project rows use 1.7rem on mobile.
- **Citation title:** weight 550, `clamp(1.4rem, 2.2vw, 2rem)`, line-height 1.3; 1.45rem on mobile. Titles have a 34ch maximum.
- **Body:** the browser's default font size is inherited; the root line-height is 1.65. Paragraphs normally stop at 70ch. Person biographies stop at 49ch, featured summaries at 62ch, and paper author lines at 75ch.
- **Intro body:** `clamp(1.1rem, 1.7vw, 1.35rem)`, 59ch maximum; 1.05rem on mobile. Hero supporting copy uses `clamp(1rem, 1.6vw, 1.3rem)` and line-height 1.6; 0.94rem on mobile.
- **Label / metadata:** 0.88rem with tabular numerals. Person roles are 0.87rem; author lines are 0.92rem at line-height 1.75, reducing to 0.85rem on mobile.
- **Actions:** weight 650. Main navigation is 0.9rem, reducing to 0.8rem below 1000px; the active destination is weight 750. Text-link groups use 0.92rem.

### Named Rules

**The Single Family Rule.** Use Manrope across identity, reading, navigation, and metadata; keep hierarchy in size, weight, line-height, and spacing.

## Layout

The `.wrap` container is `min(100%, 1440px)`, centred, with inline gutters of `clamp(1.3rem, 4.7vw, 5rem)`. Section spacing is `clamp(3.5rem, 6.3vw, 6rem)`. Heading-to-copy and paragraph gaps recur at 1.5rem and 1.2rem. Broad section backgrounds span the viewport while their content follows the shared wrap.

Desktop reading layouts generally use two columns: equal columns with 5rem gaps for introductory and theme sections; 1:1.5 project rows; 1.5:1 tool/contact layouts with 6rem gaps; 110px plus remaining space for citations with a 3rem gap. Featured project summaries use a 200px title column. People and alumni use two columns, with 4rem gaps.

The header is at least 118px high. Its supplied colour logo is 76px wide; the hero uses the supplied white logo at `clamp(140px, 20vw, 260px)`. The footer repeats the white mark at 75px. Logos keep their natural proportions. Faculty portraits use 128px circular frames, reducing to 96px on mobile, with `object-fit: cover` and individual crop positions. Keep the source colours. The owner requested circular colour portraits on 2026-11-12.

At 1000px and below, navigation and brand type tighten, the header logo becomes 62px wide, the hero logo becomes 180px, and major gaps reduce. At 720px and below, most two-column sections become one column with a 2.5rem gap, project rows stack, and citation years move above titles. The header minimum becomes 96px, its logo 57px, and the desktop navigation yields to a native full-width disclosure. Directory notes move beneath their destination while the arrow spans both lines. The hero logo is 77px wide and is hidden at 390px and below. At 1600px and above the hero identity gap and logo margin increase.

## Elevation & Depth

There are no shadows, blurs, or raised cards. Full-width tonal bands, whitespace, and 1px rules create separation. Links communicate interaction through underlines, a filled-action colour change, and a short directional arrow movement. Keyboard focus uses a 3px outline offset by 6px; its colour becomes cyan inside the hero and footer. The skip link appears on focus.

### Named Rules

**The Flat Surface Rule.** Separate content with open rows, thin rules, and tonal fields rather than elevation.

## Shapes

Filled actions, section boundaries, and keyboard outlines remain square. Portrait frames use a 50% radius, an owner-requested exception for circular headshots. The repeated geometry is a horizontal ruled row, with an open right-pointing SVG arrow drawn at stroke width 1.5. The organic BOB logo and duck silhouette are supplied identity/discovery artwork, not a basis for rounded UI containers.

## Components

### Buttons and text actions

Filled actions are firm rectangular links: teal background, white text, weight 650, `1rem 1.3rem` padding, and a 1.5rem gap before the arrow. Hover changes the background to `teal-hover`. Inline actions use weight 650, a 0.75rem gap, and at least a 44px height. Ordinary links inherit colour and use a 1px underline offset by 0.25em; hover thickens it to 2px. All interactive links share the visible focus treatment.

### Navigation

The desktop navigation is an open horizontal row with fluid `clamp(1rem, 2vw, 2rem)` gaps. Links have 0.8rem vertical padding; hover and the current page use an underline offset by 0.6rem. The active page also uses weight 750. On mobile, the native `details` menu remains in normal flow, with a 44px summary and 48px navigation rows divided by 1px rules. Opening it expands the header above the content.

### Research entry

The owner requested a single useful research destination on 2026-11-12. The
hero now has one “Explore our research” link to `/projects/`, with a thin top rule,
a cyan arrow, 1.2rem text and `1rem 0` padding. Hover underlines the label and
moves the arrow 7px right; reduced motion removes this movement. Selected project
rows below link directly to different project pages. Do not restore the four
near-identical theme anchor routes.

The homepage introduction uses the owner-supplied Banner 5 above its heading and
copy. CSS `mix-blend-mode: darken` replaces its white ground visually with the
site's pale green-white. The source renderings and image pixels remain unchanged.
An isolated background contains the blending. Four equal panels preserve the
original row on desktop and form a two-by-two grid below 720px; each brain stays
complete. The introduction's heading and copy retain separate desktop columns
and stack on mobile. The earlier GIF and cream background remain removed.

Paper figures sit in white panels with `clamp(1rem, 2.2vw, 2rem)` padding;
captions remain outside the panels. Preserve the original scientific colours
and scales.

### Research and people rows

Project rows use `2.5rem` vertical padding, a 1px top rule, a compact title/full-title column, and a longer summary/link column. On mobile, the title precedes the copy in one column with a 0.7rem gap and 2rem vertical padding. People blocks use a 1px top rule and 1.5rem top padding, followed by name, subdued role, biography when supplied, and public links. The system supports missing portraits without empty frames.

### Citation rows

A 110px year column precedes a reading column; the row uses a 3rem gap and 2.5rem vertical padding above a top rule. The title is the article link, with an inline SVG arrow; authors follow in smaller text and the venue follows as metadata. On mobile, the row stacks with a 0.4rem gap and 2rem vertical padding. Years use tabular numerals.

### Alumni recognition

Alumni use compact text rows on the pale wash, with a 1px top rule, `1.15rem 0` padding, and a 0.2rem internal gap. Names are 1.05rem at weight 600; roles and optional years use metadata styling. This pattern deliberately carries no alumni portraits.

### Hidden duck disclosures

A small 24px duck opens a native `details` disclosure through a 44px square target. On discovery, a teal duck with amber accessories appears beside a short lab joke. The publications reviewer has glasses and a manuscript; the research duck wears a field hat; the alumni duck wears a graduation cap. The shared footer holds a pond committee and uses a white discovery icon with brighter revealed ducks. A second native disclosure introduces five ducklings.

Duck motion runs once on opening, with a short settling movement and a 60ms stagger for ducklings. Nothing moves before discovery. Reduced-motion preference removes this spatial movement while retaining clear open states. All reveals stay in normal flow, support keyboard and touch, and need no JavaScript, sound, storage, or tracking. Edit character copy in `duckCharacters` in `scripts/render.mjs`.

## Do's and Don'ts

### Do:

- **Do** preserve the supplied colour and white BOB artwork and its proportions.
- **Do** use the shared wrap, fluid gutter, and section rhythm for new reading surfaces.
- **Do** retain open ruled rows for research, citations, people, and alumni recognition.
- **Do** keep visible keyboard focus, native disclosure behavior, and at least the existing 44px action targets.
- **Do** keep ordinary navigation and content usable without JavaScript.
- **Do** keep ducks optional, quiet, and separate from essential information.

### Don't:

- **Don't** replace the selected teal directory with a generic promotional card grid during routine updates.
- **Don't** add alumni portraits to the compact recognition pattern.
- **Don't** replace real research evidence with invented scientific imagery or decorative data.
- **Don't** add autoplay sound, tracking, or essential information inside a duck discovery.
