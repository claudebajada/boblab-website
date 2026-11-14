// Keep these public lab profiles in sync with the website footer.
const labProfiles = [
  'https://www.linkedin.com/company/theboblab',
  'https://www.instagram.com/the_bob_lab',
];

export function structuredData(site, page, origin, basePath) {
  // Canonical, indexable pages only. Neither the 404 nor the old team alias
  // should acquire a competing structured-data identity.
  if (site.stage !== 'live' || !origin || page.route === '/404.html' || page.canonicalRoute) return '';

  const homeUrl = origin + basePath + '/';
  const pageUrl = origin + basePath + page.route;
  const organizationId = homeUrl + '#organization';
  const websiteId = homeUrl + '#website';
  const webpageId = pageUrl + '#webpage';
  const graph = [];

  if (page.route === '/') {
    graph.push({
      '@type': 'ResearchOrganization',
      '@id': organizationId,
      name: site.expandedName,
      alternateName: site.name,
      url: homeUrl,
      description: site.description,
      logo: homeUrl + 'media/bob-logo-colour.png',
      email: site.email,
      parentOrganization: {
        '@type': 'CollegeOrUniversity',
        name: site.institution,
        url: 'https://www.um.edu.mt/',
      },
      address: { '@type': 'PostalAddress', addressLocality: 'Msida', addressCountry: 'MT' },
      sameAs: labProfiles,
    });
    graph.push({
      '@type': 'WebSite',
      '@id': websiteId,
      url: homeUrl,
      name: site.name,
      description: site.description,
      publisher: { '@id': organizationId },
      inLanguage: 'en',
    });
  }

  const webpage = {
    '@type': 'WebPage',
    '@id': webpageId,
    url: pageUrl,
    name: page.label + ' | ' + site.name,
    description: page.description || site.description,
    isPartOf: { '@id': websiteId },
    about: { '@id': organizationId },
    inLanguage: 'en',
  };
  if (page.article) webpage.mainEntity = { '@id': pageUrl + '#article' };
  graph.push(webpage);

  if (page.article) {
    const article = {
      '@type': 'Article',
      '@id': pageUrl + '#article',
      headline: page.article.title,
      description: page.article.summary.join(' '),
      mainEntityOfPage: { '@id': webpageId },
      publisher: { '@id': organizationId },
      inLanguage: 'en',
    };
    // An update's date may be the event date, not its publication date.
    // Do not assert datePublished without a verified publication date.
    if (page.article.photos[0]) article.image = homeUrl + page.article.photos[0].src.slice(1);
    graph.push(article);
  }

  // JSON inside a <script> must not allow user-authored text to close the tag.
  const json = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph })
    .replace(/</g, '\\u003c');
  return '<script type="application/ld+json">' + json + '</script>';
}
