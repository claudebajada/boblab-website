import { collections, newsPolicy } from './content.mjs';

export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}
const e = escapeHtml;
export const arrow = '<svg class="arrow" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>';
const paragraphs = values => values.map(value => `<p>${e(value)}</p>`).join('\n');
const links = values => values.length ? `<ul class="text-links">${values.map(link => `<li><a href="${e(link.url)}">${e(link.label)} ${arrow}</a></li>`).join('')}</ul>` : '';
const byName = key => (a, b) => a[key].localeCompare(b[key], 'en');
const intro = (title, description) => `<div class="page-intro wrap"><h1>${title}</h1>${description ? `<p>${description}</p>` : ''}</div>`;
const duckCharacters = {
  pond: ['A hidden duck', 'The pond committee', 'All boundaries are provisional. Except the edge of this pond.', 'duck', 'Call the committee', 'Motion carried. More breadcrumbs.'],
  graduate: ['A duck among the alumni', 'Doctor of pond studies', 'Thesis defended. Pond still uncharted.', 'duck-graduate', 'Meet the cohort', 'A very close-knit research group.'],
  field: ['A duck in the methods', 'Fieldwork in progress', 'One pond. Several disputed boundaries.', 'duck-field', 'See the field team', 'They agreed to follow the data. Then they found a breadcrumb.'],
  reviewer: ['A duck in the bibliography', 'Reviewer #3', 'Accept with minor revisions. Please add more breadcrumbs.', 'duck-reviewer', 'Reveal the co-authors', 'All contributed equally to the quacking.'],
};
export function duckDiscovery(kind, className = 'small-duck') {
  const [label, title, text, image, invitation, reply] = duckCharacters[kind];
  return `<details class="duck ${e(className)}"><summary aria-label="${e(label)}"><img src="/media/duck.svg" width="24" height="24" alt=""></summary>
    <div class="duck-reveal"><div class="duck-scene" aria-hidden="true"><img src="/media/${image}.svg" width="72" height="72" alt=""><span class="duck-ripple"></span></div>
      <div class="duck-caption"><p class="duck-title">${e(title)}</p><p>${e(text)}</p></div>
      <details class="duck-family"><summary>${e(invitation)} ${arrow}</summary><div class="ducklings" aria-hidden="true">${Array.from({ length: 5 }, () => '<span><img src="/media/duck.svg" width="32" height="32" alt=""></span>').join('')}</div><p>${e(reply)}</p></details>
    </div></details>`;
}
const projectName = p => p.shortTitle || p.acronym || p.title;
const projectTeaser = p => {
  const name = projectName(p);
  const summary = p.summary[0];
  const prefix = [`${name} is `, `${name} `].find(value => summary.startsWith(value));
  const teaser = prefix ? summary.slice(prefix.length) : summary;
  return teaser.charAt(0).toUpperCase() + teaser.slice(1);
};
const projectUrl = p => `/projects/${p.id}/`;
const newsUrl = n => `/news/${n.id}/`;
const newsDate = n => n.endDate && n.endDate !== n.date
  ? new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).formatRange(new Date(`${n.date}T12:00:00Z`), new Date(`${n.endDate}T12:00:00Z`))
  : date(n.date);
const newsTime = n => `<p class="meta news-date"><time datetime="${e(n.date)}">${e(newsDate(n))}</time></p>`;
function newsPhoto(photo, lead = false) {
  return `<figure class="news-photo${lead ? ' news-lead-photo' : ''}"><img src="${e(photo.src)}" alt="${e(photo.alt)}" width="${photo.width}" height="${photo.height}" loading="lazy"><figcaption>${e(photo.caption)} <span class="photo-credit">${e(photo.credit)}</span></figcaption></figure>`;
}
const statusLabel = p => ({ active: 'Current project', completed: 'Completed project', resource: 'Research resource', programme: 'Research collaboration' }[p.status]);
const date = value => new Date(`${value}T12:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
const projectDates = p => p.startDate ? `${date(p.startDate)}${p.endDate ? ` to ${date(p.endDate)}` : ' onwards'}` : p.endDate ? `Ended ${date(p.endDate)}` : '';
const publicationGroups = [
  ['journal', 'journal-articles', 'Journal articles'], ['preprint', 'preprints', 'Preprints'],
  ['dataset', 'datasets', 'Datasets'], ['policy', 'policy', 'Policy and consultation'],
  ['conference', 'conference', 'Conference papers and abstracts'], ['software', 'software', 'Software'],
];

function person(p) {
  const heading = `<div><h3>${e(p.name)}</h3><p class="person-role">${e(p.role)}</p></div>`;
  return `<article class="person" id="${e(p.id)}">
    ${p.image ? `<div class="person-heading"><span class="portrait-frame"><img class="portrait" src="${e(p.image)}" alt="${e(p.imageAlt)}" width="128" height="128" loading="lazy"></span>${heading}</div>` : heading}
    ${paragraphs(p.bio)}${links(p.links)}
  </article>`;
}
function figure(f) {
  return `<figure class="research-figure"><div class="figure-panel"><img src="${e(f.src)}" alt="${e(f.alt)}" width="${f.width}" height="${f.height}" loading="lazy"></div>
    <figcaption><p>${e(f.caption)}</p><p class="figure-credit">${e(f.credit)}${f.licenseUrl ? ` <a href="${e(f.sourceUrl)}">Source</a> · <a href="${e(f.licenseUrl)}">CC BY 4.0</a>` : ''}</p></figcaption></figure>`;
}
function brainVisual(image) {
  return `<div class="brain-visual"><img class="brain-animation" src="${e(image.src)}" alt="${e(image.alt)}" width="${image.width}" height="${image.height}" loading="lazy">
    <img class="brain-still" src="${e(image.stillSrc)}" alt="${e(image.alt)}" width="${image.width}" height="${image.height}" loading="lazy"></div>`;
}
function labBanner(image) {
  return `<div class="lab-banner" role="img" aria-label="${e(image.alt)}">${Array.from({ length: 4 }, () => `<span class="banner-panel"><img src="${e(image.src)}" alt="" width="${image.width}" height="${image.height}" loading="lazy"></span>`).join('')}</div>`;
}
function project(p) {
  return `<article class="project-row" id="${e(p.id)}">
    <div><h3><a href="${projectUrl(p)}">${e(projectName(p))} ${arrow}</a></h3>${projectName(p) !== p.title ? `<p class="project-full-title">${e(p.title)}</p>` : ''}</div>
    <div><p>${e(projectTeaser(p))}</p><p class="meta">${e(statusLabel(p))}${projectDates(p) ? ` · ${e(projectDates(p))}` : ''}</p></div>
  </article>`;
}
function paper(p, level = 2) {
  const authors = p.authors.length > 12
    ? `<p class="paper-authors">${e(p.authors.slice(0, 4).join(', '))}, et al.</p><details class="author-list"><summary>All ${p.authors.length} authors</summary><p class="paper-authors">${e(p.authors.join(', '))}</p></details>`
    : `<p class="paper-authors">${e(p.authors.join(', '))}</p>`;
  const kind = { preprint: 'Preprint, not peer reviewed', conference: 'Conference paper or abstract', dataset: 'Dataset', policy: 'Consultation response', software: 'Software' }[p.kind];
  return `<article class="paper" id="${e(p.id)}">
    <p class="paper-year">${p.year}</p>
    <div><h${level}>${p.doi ? `<a href="https://doi.org/${e(p.doi)}">${e(p.title)} ${arrow}</a>` : e(p.title)}</h${level}>
      ${authors}<p class="meta">${e(p.venue)}${kind ? ` · ${e(kind)}` : ''}</p>${links(p.links)}
    </div>
  </article>`;
}

export function composePages(data) {
  const { site } = data;
  const published = Object.fromEntries(collections.map(kind => [kind, data[kind].filter(item => !item.draft)]));
  const { people, projects, publications, news } = published;
  const updates = [...news].sort((a, b) => b.date.localeCompare(a.date) || byName('id')(a, b));
  const recentUpdates = updates.slice(0, newsPolicy.homepageItems);
  const faculty = people.filter(p => p.group === 'faculty').sort(byName('name'));
  const members = people.filter(p => p.group === 'current').sort(byName('name'));
  const alumni = people.filter(p => p.group === 'alumni').sort(byName('name'));
  const papers = [...publications].sort((a, b) => b.year - a.year || byName('title')(a, b));
  const projectGroups = [
    ['current-projects', 'Current projects', projects.filter(p => p.status === 'active' && p.category !== 'collaboration')],
    ['collaborations', 'Research clusters and collaborations', projects.filter(p => p.category === 'collaboration')],
    ['resources', 'Datasets and software projects', projects.filter(p => p.status === 'resource')],
    ['completed-projects', 'Completed projects', projects.filter(p => p.status === 'completed')],
  ].filter(([, , items]) => items.length);
  const sourceCode = 'https://github.com/VBIndex/py_vb_toolbox';
  const contact = site.email ? `<a class="email-link" href="mailto:${e(site.email)}">${e(site.email)} ${arrow}</a>` : '<p>Contact details will be available here shortly.</p>';
  const featured = ['tarragon', 'brian', 'sara', 'mohh-malti'].map(id => projects.find(p => p.id === id)).filter(Boolean);
  const featuredPaper = site.featuredPublicationId == null
    ? papers.find(p => p.kind === 'journal')
    : papers.find(p => p.id === site.featuredPublicationId);
  const groups = publicationGroups.filter(([kind]) => papers.some(p => p.kind === kind));
  const researchHeading = '<h2>Mapping brain organisation</h2>';
  const pages = [
    {
      route: '/', label: 'Home', pageClass: 'home', description: site.description,
      body: `<section class="hero"><div class="wrap">
        <div class="hero-identity"><h1>Boundaries<br>of the Brain<span>.</span></h1><img class="hero-logo" src="/media/bob-logo-white.png" alt="" width="751" height="635"></div>
        <p class="hero-description">Neuroimaging and neural cartography<br>at the University of Malta.</p>
        <a class="hero-research-link" href="/projects/">Explore our research ${arrow}</a>
      </div></section>
      <section class="wrap section about-section">${site.homeBanner ? labBanner(site.homeBanner) : ''}${site.homeImage ? brainVisual(site.homeImage) : researchHeading}<div>${site.homeImage ? researchHeading : ''}${paragraphs(site.introduction)}<p>Through <a href="/projects/disc/">DISC</a>, we also work on research data sharing and policy.</p><a class="inline-link" href="/our-team/">Meet the people ${arrow}</a></div></section>
      <section class="portfolio-section"><div class="wrap section"><div class="section-heading"><h2>Selected projects</h2></div>
        <div class="featured-projects">${featured.map(p => `<a class="featured-project" href="${projectUrl(p)}"><div><h3>${e(projectName(p))}</h3><p>${e(projectTeaser(p))}<span class="featured-status">${e(statusLabel(p))}</span></p></div>${arrow}</a>`).join('')}</div>
      </div></section>
      <section class="wrap section"><div class="section-heading"><h2>Featured research</h2><a class="inline-link" href="/publications/">Publications and outputs ${arrow}</a></div>${featuredPaper ? paper(featuredPaper, 3) : ''}
        <div class="tool-strip"><div><h3>The Vogt-Bailey toolbox</h3><p>Open-source tools for measuring local gradients and boundaries in MRI data.</p></div><a class="inline-link" href="${sourceCode}">View the code ${arrow}</a></div>
        <div class="tool-strip"><div><h3>3D-printed brain models</h3><p>The University of Malta Magnetic Resonance Imaging Platform (UMRI) sells 3D-printed brain models. All proceeds support UMRI research efforts. Collection in Malta only.</p></div><a class="inline-link" href="https://www.um.edu.mt/platforms/umri/generalpublic/brainmodels/">Order from UMRI ${arrow}</a></div>
      </section>
      ${recentUpdates.length ? `<section class="story-section" id="news-and-events"><div class="wrap section story-layout"><h2>News and events</h2><div class="news-list">${recentUpdates.map(n => `<article id="${e(n.id)}"><h3><a href="${newsUrl(n)}">${e(n.title)}</a></h3>${newsTime(n)}${n.photos.length ? newsPhoto(n.photos[0], true) : ''}${paragraphs(n.summary)}<a class="inline-link" href="${newsUrl(n)}">${n.photos.length ? 'Event story and photographs' : 'Read the update'} ${arrow}</a></article>`).join('')}</div></div></section>` : ''}`,
    },
    {
      route: '/our-team/', label: 'People', pageClass: 'people-page', description: 'Faculty, lab members, and alumni of BOB Lab at the University of Malta.',
      body: `${intro('People', 'We bring together people from different disciplines to work on questions about neuroimaging.')}
        <section class="wrap section people-section">${faculty.length ? `<h2>Faculty</h2><div class="people-grid">${faculty.map(person).join('')}</div><p class="portrait-credit meta">Faculty portraits from University of Malta profiles.</p>` : ''}
        ${members.length ? `<h2>Lab members</h2><div class="people-grid compact-people">${members.map(person).join('')}</div>` : ''}</section>
        <section class="alumni-section"><div class="wrap section"><div class="section-heading"><h2>Alumni</h2><p>Thank you to our former members for their contributions.</p></div>
          <ul class="alumni-list">${alumni.map(p => `<li id="${e(p.id)}"><span>${e(p.name)}</span><span class="meta">${e(p.role)}${p.years ? ` · ${e(p.years)}` : ''}</span>${links(p.links)}</li>`).join('')}</ul>
          ${duckDiscovery('graduate')}
        </div></section>`,
    },
    {
      route: '/projects/', label: 'Research', pageClass: 'research-page', description: 'BOB Lab projects in brain organisation, MRI methods, education, and research data policy.',
      body: `${intro('Research', 'We study brain organisation, test neuroimaging methods, and work on the policy and tools needed to share research data.')}
      <nav class="wrap section-nav" aria-label="Project sections">${projectGroups.map(([id, title]) => `<a href="#${id}">${title}</a>`).join('')}</nav>
      <section class="wrap section research-themes">
        <article id="brain-organisation"><h2>Brain organisation</h2><p>We use MRI to study brain regions, their connections, and gradual changes in brain structure and function.</p></article>
        <article id="imaging-methods"><h2>Imaging methods</h2><p>We test how image acquisition and processing affect MRI measurements. Physical phantoms and repeated scans help us assess their reliability.</p></article>
        <article id="research-policy"><h2>Research data and policy</h2><p>We study how data protection rules affect research and contribute to public consultations. Through <a href="/projects/disc/">DISC</a>, we work with legal researchers on data sharing, governance, and open science.</p><a class="inline-link" href="/publications/#policy">Policy outputs ${arrow}</a></article>
        <article id="tools"><h2>Open tools and datasets</h2><p>Our resources include the <a href="${sourceCode}">Vogt-Bailey toolbox</a>, MRI phantom data, and 3D-printable brain models. Each project page links to its available resources.</p><a class="inline-link" href="#resources">Datasets and software projects ${arrow}</a>${duckDiscovery('field')}</article>
      </section>
      ${projectGroups.map(([id, title, items], i) => `<section class="${i % 2 ? 'archive-section' : 'portfolio-section'}" id="${id}"><div class="wrap section"><h2>${title}</h2>${items.sort(byName('title')).map(project).join('')}</div></section>`).join('')}`,
    },
    {
      route: '/publications/', label: 'Publications', pageClass: 'publications-page', description: 'BOB Lab papers, preprints, datasets, conference outputs, and research policy contributions.',
      body: `${intro('Publications<br>and outputs', 'Research by lab members and collaborators.')}
      <div class="wrap publication-navigation"><nav class="section-nav" aria-label="Publication sections">${groups.map(([, id, title]) => `<a href="#${id}">${title}</a>`).join('')}</nav>${duckDiscovery('reviewer')}</div>
      <div class="wrap section papers-section">${groups.map(([kind, id, title]) => `<section class="publication-group" id="${id}"><h2>${title}</h2>${kind === 'preprint' ? '<p>These manuscripts have not been peer reviewed.</p>' : ''}${papers.filter(p => p.kind === kind).map(p => paper(p, 3)).join('')}</section>`).join('')}
      <div class="reading-note"><h2>Introduction to brain boundaries</h2><p>This article explains how gradual changes in brain organisation relate to the idea of a brain region.</p><a class="inline-link" href="https://www.um.edu.mt/newspoint/news/2023/01/are-the-boundaries-of-the-brain-sharp-or-smooth">Read the introduction ${arrow}</a></div></div>`,
    },
    {
      route: '/contact-us/', label: 'Contact', pageClass: 'contact-page', description: 'Contact BOB Lab at the University of Malta about research, collaboration, and student projects.',
      body: `${intro('Contact', 'Contact us about research collaboration, student projects, neuroimaging, or research data policy.')}
      <section class="wrap section contact-layout"><div><h2>Email the lab</h2><p>Write to Claude Julien Bajada with a short introduction and your research interests. For student enquiries, include your course or background and the work you would like to explore.</p>${contact}</div>
      <div class="contact-place"><h2>University of Malta</h2><p>Department of Physiology and Biochemistry<br>Faculty of Medicine and Surgery<br>University of Malta<br>Msida, Malta</p><a class="inline-link" href="https://www.um.edu.mt/profile/claudebajada">University contact details ${arrow}</a></div></section>`,
    },
  ];
  return [...pages, ...updates.map(n => ({
    route: newsUrl(n), navigationRoute: '/', label: n.title, pageClass: 'news-page', description: n.summary[0], article: n,
    body: `<div class="wrap project-breadcrumb"><a href="/#news-and-events">${arrow} News and events</a></div>
      ${intro(e(n.title), '')}
      <section class="wrap section news-story" aria-label="Update">${newsTime(n)}${paragraphs(n.summary)}${links(n.links)}</section>
      ${n.photos.length ? `<section class="wrap section news-gallery" aria-label="Event photographs">${n.photos.map(photo => newsPhoto(photo)).join('')}</section>` : ''}`,
  })), ...projects.map(p => {
    const related = (p.publicationIds || []).map(id => papers.find(paper => paper.id === id)).filter(Boolean);
    return {
      route: projectUrl(p), navigationRoute: '/projects/', label: projectName(p), pageClass: 'project-page', description: p.summary[0],
      body: `<div class="wrap project-breadcrumb"><a href="/projects/#${e(p.id)}">${arrow} All projects</a></div>
        ${intro(e(projectName(p)), projectName(p) !== p.title ? e(p.title) : '')}
        <section class="wrap section project-detail"><div><h2>About the project</h2>${paragraphs(p.summary)}</div><aside class="project-facts" aria-label="Project details"><h2>Project details</h2><p>${e(statusLabel(p))}</p>${projectDates(p) ? `<p>${e(projectDates(p))}</p>` : ''}${p.links.length ? `<h3>Resources and links</h3>${links(p.links)}` : ''}</aside></section>
        ${(p.figures || []).length ? `<section class="wrap section project-figures" aria-label="Project figures">${p.figures.map(f => figure(f)).join('')}</section>` : ''}
        ${related.length ? `<section class="archive-section"><div class="wrap section"><h2>Related publications and outputs</h2>${related.map(p => paper(p, 3)).join('')}</div></section>` : ''}`,
    };
  })];
}
