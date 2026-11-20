# Deployment

The selected host is GitHub Pages, using https://github.com/claudebajada/boblab-website.
See [GitHub Pages operations](github-pages.md) for the normal update workflow.
The live site is https://boblab.info/.

## Build contract

| Setting | Value |
| --- | --- |
| Runtime | Node 22+; Node 24 used in CI |
| Install step | None, no dependencies |
| Checks | npm run check |
| Build | npm run build |
| Output | dist/ only |
| Deploy URL | SITE_URL provided by GitHub Pages |
| Runtime services/secrets | None |

The output is ordinary HTML/CSS and static assets. It works at a domain root
or project path; the build derives URL prefixes from SITE_URL. Local preview
uses loopback only and is not a production server. Do not publish the repo,
docs or the parent workspace as the document root. Internal notes, real content
drafts, raw uploads, and original archives belong outside the repository.

## Custom domain and legacy URLs

The default build uses `https://boblab.info` for canonical links, the sitemap
and structured data. Set `SITE_URL` to test a different host or path.
GitHub Pages controls HTTP-to-HTTPS redirects through its **Enforce HTTPS** setting.

The old WordPress team URL, `/our-team-1/`, serves an HTML page that immediately
forwards to `/our-team/`. It also includes a link for browsers that disable
automatic forwarding. The retained WordPress routes are listed in `legacy-urls.json`.
