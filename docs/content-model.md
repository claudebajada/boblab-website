# Content model

Record facts are plain text in JSON. Editorial page copy and composition live in
`scripts/render.mjs`. All record text is escaped when rendered.
Paragraphs are arrays of strings, not Markdown. Link labels and URLs are separate
fields. Templates contain fictional examples and are public repository files.

Use a stable kebab-case `id` matching the filename (for example,
`content/projects/tarragon.json` with `"id": "tarragon"`). IDs also become page
fragment identifiers. Only approved public records belong in this repository. Prepare real drafts in
the private workspace outside the repository; a draft flag excludes HTML but does
not provide repository privacy. Draft and public files share a schema. Unknown fields fail
validation so a misspelled field cannot silently disappear.

## Shared record fields

| Field | Meaning |
| --- | --- |
| `id` | Stable kebab-case identifier, unique within its collection |
| `draft` | `true` excludes the record from HTML; `false` permits rendering |
| `sourceIds` | Source-register heading IDs; at least one required for public records |
| `lastReviewed` | Valid calendar date, `YYYY-MM-DD` |
| `links` | List of `{ "label": "Read the paper", "url": "https://…" }` objects |

Public-record approval is an editorial decision. The validator can check source
references and structure; it cannot establish truth, consent, or image rights.

## Collections

| Collection | Fields in addition to shared fields |
| --- | --- |
| `people` | `name`, `role`, `group` (`faculty`/`current`/`alumni`), `years` (text/null), `bio` (paragraphs), `image` (local `/media/…` path/null), `imageAlt` (text/null) |
| `projects` | `title`, `acronym` (text/null), `summary` (paragraphs), `status` (`active`/`programme`/`completed`/`resource`), `category` (`research`/`policy`/`education`/`collaboration`/`resource`), `shortTitle` (text/null), `figures` (credited image objects), `publicationIds` (public publication IDs), `startDate`, `endDate` (ISO dates/null) |
| `publications` | `title`, `authors` (ordered list), `year` (integer), `venue`, `kind` (`journal`/`preprint`/`conference`/`software`/`dataset`/`policy`), `doi` (DOI string/null) |
| `news` | `title`, `date` (ISO date), `endDate` (ISO date/null), `summary` (paragraphs), `photos` (up to three credited photograph objects) |

Alumni images are rejected. Current images need useful alt text and a source/
permission note in the source register. Empty optional paragraphs/links are fine;
unknown dates stay null. Project dates use human-readable full dates. Unknown and approximate dates stay
null; do not invent precision.

Publications sort by year descending and title; authors retain source order. Use
academic author-date citations in prose and figure credits, for example
"Farrugia et al. (2024)". Full author arrays stay intact; long displayed lists
use "et al." with a disclosure for the complete list.
Preprints are labelled. Do not add both versions of the same work without a
specific editorial reason and cross-reference. People sort by name within Faculty, Lab members, and Alumni. Faculty includes
confirmed academic collaborators and does not imply shared lab leadership. `programme`
projects make no active/completed claim. Each public project gets a local
`/projects/<id>/` page. Categories distinguish cluster collaborations; resources
and completed work have separate sections. Publication references must resolve
to public records, and duplicate public DOIs fail validation. News is dated rather than presented as a current announcement.

## News and events policy

Keep the homepage brief: show **at most three** approved updates, newest first
by `date`, with the ID as a stable tie-breaker. The limit applies across news and
events combined, not three of each. Drafts never use a slot. Do not add an
expanding feed, carousel, or automatic archive listing. Older approved updates
retain their individual `/news/<id>/` URLs and public source records when they
leave the homepage; adding a fourth update does not delete an earlier story.

Each update has a title of at most 100 characters, a summary of at most **80
words**, at most **two resource links**, and at most **three photographs**. These
limits are enforced by validation; the renderer enforces the three-item homepage
limit. The homepage uses only the first photograph and links to the individual
update for its full gallery and resource links. Leave `photos` empty for a
text-only update. Keep one record per event rather than one per session or photo.

Use `date` for the event's first day, or the publication date for a news update.
Use `endDate` for a verified event range; otherwise use null. Never substitute
the date of an email for an unknown event date. Revisit the selection whenever
adding an update and review it annually for relevance and broken links; there
is no unattended deletion or private-source synchronisation.

Every photograph has exactly `src`, `alt`, `caption`, `credit`, `width`, and
`height`. Use an approved local JPEG, PNG, WebP, or AVIF, useful alt text, a
factual caption, visible credit, and positive pixel dimensions. Archive originals
outside the repository, strip private metadata, and normally keep website copies
below 200 KB with a maximum 1600-pixel long edge. Permission and public provenance
belong in the source and asset registers. The update's `sourceIds` cover its
photographs as well as its facts. Missing local photographs fail the build.

## Site settings

`content/site.json` contains the identity, description, introductory paragraphs,
`email` (verified public address or null), `origin` (final HTTPS origin or null),
provenance, and `stage` (`scaffold`/`preview`/`live`). Live builds require an email
and origin, and generate a sitemap. Scaffold and preview builds emit noindex and
disallow crawling. GitHub Pages supplies the full `SITE_URL` during CI.
That prevents accidental indexing, not access; a public preview is still public.

### Changing the featured research

Set `featuredPublicationId` in `content/site.json` to the ID of the output to
feature. The homepage reads its title, author list, publication type and links
from the same record as the Publications page. For example, setting the field
to `brian-framework-preprint` features the BRIAN preprint.

An explicit selection stays in place as other outputs are added. An unknown ID
or a draft fails validation. Set the field to `null` for automatic selection:
the homepage takes the first public journal article in bibliography order
(year descending, then title alphabetically). Older settings without the field
use the same rule. With no public journal articles, the automatic mode omits the
citation.

## Assets

Everything in `public/` is copied to `dist/` independently of draft flags. Keep
private imagery and original archives outside the repository. Put approved assets under `public/media/`;
compress photographs, retain appropriate credits and rights evidence in the source
register, and avoid loading third-party embeds or fonts by default.


## Homepage banner

`site.homeBanner` is null or an object with exactly `src`, `alt`, `width`, and
`height`. Banner 5 has four equal source panels; the renderer presents them in a
row on desktop and a two-by-two grid on mobile. A single accessible image label
covers the composite; panel images are decorative. Source provenance is embedded
in the PNG and recorded in docs/sources.md. CSS adapts the white
background to the site's pale ground without raster editing.

## Credited research images

`site.homeImage` is null or a lab visual with exactly `src` (the approved GIF),
`stillSrc` (a static local fallback), `alt`, `width`, and `height`. Its source
history and permission belong in the public asset provenance register and source register. The
homepage renders no archive caption or credit line. Reduced-motion preference uses the still automatically. The owner requested
no playback control. This field is currently null because the owner removed
the homepage image. Only enable it again after a new request.

Each project's `figures` is an array of credited objects with these fields:

- `src`: approved local `/media/` image path.
- `alt`: description of the actual image, with no invented scientific result.
- `caption`: a plain-language explanation and any necessary limitation.
- `credit`: authors and source work or the owner-authorised lab archive.
- `sourceUrl`: source article or original webpage.
- `licenseUrl`: the CC BY 4.0 licence URL for the present paper figures, or null
  for owner-authorised imagery. The current renderer labels a non-null licence
  CC BY 4.0; extend the label model deliberately before adding another licence.
- `width`, `height`: positive integer pixel dimensions of the image file.

The build checks that local image assets exist, including the static fallback.
Scientific figures keep their labels/scales and necessary attribution. They have
no full-size links. Captions, credits, and alt text are
escaped. Everything under public ships regardless of record draft flags, so only
approved images belong there. Portrait source permissions remain in sources.md
and the public asset provenance register, separate from any paper's licence.
