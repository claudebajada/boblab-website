# Deployment

The selected host is GitHub Pages, using https://github.com/claudebajada/boblab-website.
See [GitHub Pages operations](github-pages.md) for the normal update workflow.
The existing boblab.info domain is not changed by this deployment.

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

## Domain migration later

Before replacing boblab.info, confirm the roster, update selected publication
and project metadata, and review current images and permissions. Back up the old
site and inventory WordPress URLs; legacy-urls.json is the initial map.
Configure the custom domain in Pages, set the required DNS, verify HTTPS and the
old URL aliases, then enable indexing via stage: live when the owner is ready.
GitHub Pages does not provide custom HTTP 301 rules; the old team URL is a static
compatibility page. Keep Git history and the previous deployment available for rollback.
