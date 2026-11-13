# GitHub Pages

Repository: https://github.com/claudebajada/boblab-website

The website uses a dependency-free static build. The owner controls publication,
repository visibility, and domain changes.

## Normal updates

1. Add reviewed content or assets and run `npm run check` and `npm run build`.
2. Commit and push to `main`, or merge a reviewed pull request.
3. `.github/workflows/pages.yml` validates, builds, uploads only `dist/`, and
   publishes through the `github-pages` environment.

Pages must use **GitHub Actions** as its build source. No npm install, server,
database, or deployment secret is needed. Repository visibility and the account
plan must support Pages. The workflow reads the
actual Pages `base_url`: assets, navigation, canonical links, and sitemap work on
`https://claudebajada.github.io/boblab-website/` and a future custom-domain root.

Build checks run for every push and pull request. Deployment is opt-in for both
public and private repositories: enable Pages with GitHub Actions as its source,
then set the repository Actions variable `PAGES_ENABLED=true`. Until that variable
is explicitly set, the workflow builds the site and skips Pages configuration and
deployment. Repository visibility alone does not enable deployment.

Reproduce a project-path build locally:

```sh
SITE_URL=https://claudebajada.github.io/boblab-website npm run build
```

Use plain `npm run build` again for the normal root-mounted local preview. Tests
exercise both modes and reject root URLs accidentally left in a project build.

`content/site.json` is in `live` mode with the GitHub Pages HTTPS origin. The
workflow supplies the full deployed URL, including `/boblab-website`, so canonical
links, robots.txt and sitemap.xml point to the published site. Set `stage` to
`preview` for a future non-indexed preview; this is not an access restriction.

`/our-team-1/` is retained as an HTML alias with a link and canonical reference to
`/our-team/`. GitHub Pages cannot emit custom 301 rules. The custom 404 page
provides a home link with the correct deployment prefix.

The workflow supports the site at repository root. It can also find a nested
`repo/` directory, but the workflow itself must always be at the repository's
`.github/workflows/` location.

Official reference:
https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
