# BOB Lab website

Static website for the Boundaries of the Brain laboratory at the University of
Malta. Read [AGENTS.md](AGENTS.md) before making changes.

## Run

Requires Node 22 or later; Node 24 is recommended. No installation is needed.
From the repository directory:

```sh
npm run check
npm run build
npm run preview
```

Preview is at http://127.0.0.1:4321. Rebuild to see edits. Stop with Ctrl+C;
use PORT=4322 for a different port. Deploy only dist/.

## Source layout

| Location | Purpose |
| --- | --- |
| content/ | Approved public site, people, project, publication, and news records |
| templates/content/ | Fictional examples for new records |
| src/templates/page.html | Shared HTML shell |
| scripts/render.mjs | Editorial copy and page composition |
| scripts/build.mjs | Static output and deployment metadata |
| public/ | Reviewed website assets and CSS, copied into output |
| docs/ | Public content schema, source/asset attribution, URL map, and hosting guidance |
| DESIGN.md | Shared design system |
| .github/workflows/pages.yml | GitHub Pages workflow |
| dist/ | Generated output, ignored by Git |

The site has no dependencies, build-time network calls, browser JavaScript, or
private-source integrations. A fresh checkout builds independently.

## Content updates and privacy

Start with a fictional example from templates/content/. Prepare real drafts,
private notes, raw uploads, original assets, review captures, and internal evidence
outside this repository. Copy in only approved public records and website assets.
Keep sourceIds and lastReviewed current and register public provenance in
docs/sources.md. Draft flags only exclude HTML; they do not protect files in a
public repository. The entire repository and its history must be safe to publish.

Run check/build after changes. The build checks local URLs and fragments; review
edited external URLs separately. See [content-model.md](docs/content-model.md),
[deployment.md](docs/deployment.md), and [github-pages.md](docs/github-pages.md).
The owner controls publication, repository visibility, and domain changes.
