// Renders src/credits.json into a static site in dist/.
// Photos live in the ignored private-assets/ folder (see ASSETS.md). Without it the
// site still builds: credits simply show no photo.
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const root = import.meta.dirname;
const dist = path.join(root, 'dist');
const privateAssets = path.join(root, 'private-assets');
const data = JSON.parse(await readFile(path.join(root, 'src/credits.json'), 'utf8'));
const SITE = 'https://executiveproducing.com';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

await rm(dist, { recursive: true, force: true });
await mkdir(path.join(dist, 'media'), { recursive: true });

// Copies a private photo into dist/media and returns its URL, or null when it's missing.
async function media(file) {
  if (!file) return null;
  const source = path.join(privateAssets, file);
  if (!existsSync(source)) return null;
  const target = path.join(dist, 'media', file);
  await mkdir(path.dirname(target), { recursive: true });
  await cp(source, target);
  return `/media/${file}`;
}

const linkList = (links) => {
  const items = Object.entries(links ?? {}).filter(([, url]) => url);
  if (!items.length) return '';
  return `<ul class="links">${items.map(([label, url]) => `<li><a href="${esc(url)}" rel="noopener" target="_blank">${esc(label)}</a></li>`).join('')}</ul>`;
};

async function renderCredit(c) {
  const photo = await media(c.image);
  const embed = c.embed
    ? `<div class="embed" data-type="${esc(c.embed.type)}" data-id="${esc(c.embed.id)}" data-title="${esc(c.embed.title)}"></div>`
    : '';
  const backed = c.backed
    ? `<p class="credit-backed"><b>C.Y.’s part:</b> ${esc(c.backed)}${c.source ? ` <a href="${esc(c.source)}" rel="noopener" target="_blank">Source</a>` : ''}</p>`
    : '';
  return `
      <li class="credit reveal" id="${esc(c.slug)}">
        <details>
          <summary${photo ? ` data-peek="${esc(photo)}"` : ''}>
            <span class="credit-role">${esc(c.role)}${c.work ? `<span class="work">${esc(c.work)}</span>` : ''}</span>
            <span class="credit-name">${esc(c.name)}</span>
          </summary>
          <div class="credit-card${photo ? '' : ' no-image'}">
            ${photo ? `<div class="credit-photo"><img src="${esc(photo)}" alt="${esc(c.imageAlt ?? c.name)}" loading="lazy" decoding="async" width="148" height="148"></div>` : ''}
            <div>
              <p class="credit-meta label">${esc([c.discipline, c.base].filter(Boolean).join(' · '))}</p>
              <p class="credit-bio">${esc(c.bio)}</p>
              ${backed}
              ${linkList(c.links)}
            </div>
            ${embed}
          </div>
        </details>
      </li>`;
}

const cy = data.cy;
const portrait = await media(cy.image);
const credits = (await Promise.all(data.credits.map(renderCredit))).join('');
const featuredCredits = data.featuredCredits.map(([slug, name]) => `<a href="#${esc(slug)}">${esc(name)}</a>`).join(', ');

const { approach } = data;
const statement = approach.statement.map(esc).join('<br>\n          ');
const pathways = approach.pathways.map(({ title, invitation, steps }) => `
        <div class="pathway">
          <h3>${esc(title)}</h3>
          <p>${esc(invitation)}</p>
          <ol class="pathway-steps" role="list">${steps.map((step) => `<li>${esc(step)}</li>`).join('')}</ol>
        </div>`).join('');

const projectGroups = Object.entries(data.projectLinks).map(([group, links]) => `
        <div class="project-group">
          <h3 class="label">${esc(group)}</h3>
          <ul class="project-links" role="list">${Object.entries(links).map(([name, url]) => `
            <li><a href="${esc(url)}" rel="noopener" target="_blank">
              <span class="project-name">${esc(name)}</span>
              <span class="project-domain">${esc(new URL(url).hostname)}</span>
              <span class="project-arrow" aria-hidden="true">↗</span>
            </a></li>`).join('')}
          </ul>
        </div>`).join('');

const reels = data.interviews.map((r) => `
      <figure class="reel reveal">
        ${r.youtube
          ? `<div class="embed" data-type="youtube" data-id="${esc(r.youtube)}" data-title="${esc(r.title)}"></div>`
          : `<a class="reel-link" href="${esc(r.url)}" rel="noopener" target="_blank">${esc(r.linkText ?? 'Read')} ↗</a>`}
        <figcaption>
          <h3><a href="${esc(r.url)}" rel="noopener" target="_blank">${esc(r.title)}</a></h3>
          <p>${esc(r.description)}</p>
        </figcaption>
      </figure>`).join('');

const facts = cy.facts.map(([k, v]) => `<div><dt class="label">${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('');
const background = cy.background.map(esc).join('<br>');
const notes = cy.notes.map((p) => `<p>${esc(p)}</p>`).join('\n          ');

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: cy.name,
  url: SITE,
  description: cy.description,
  homeLocation: cy.base,
  sameAs: Object.values(cy.links),
};

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(cy.name)}, Executive Producer</title>
  <meta name="description" content="${esc(cy.description)}">
  <link rel="canonical" href="${SITE}/">
  <meta name="theme-color" content="#0c0b09">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${SITE}/">
  <meta property="og:title" content="${esc(cy.name)}, Executive Producer">
  <meta property="og:description" content="${esc(cy.description)}">
  <meta property="og:image" content="${SITE}/og.png">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,300..700&family=Instrument+Serif:ital@0;1&display=swap">
  <link rel="stylesheet" href="/styles.css">
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
</head>
<body>
  <header class="titles">
    <div class="titles-top">
      <span class="label">executiveproducing.com</span>
      <span class="label">${esc(cy.base)}</span>
    </div>
    <div class="titles-main">
      ${portrait ? `<figure class="portrait"><img src="${esc(portrait)}" alt="${esc(cy.imageAlt)}" width="132" height="132"></figure>` : ''}
      <p class="label">Executive Producer</p>
      <h1>${esc(cy.name)}</h1>
      <p class="lede">${cy.lede}</p>
    </div>
    <div class="titles-bottom">
      <a class="button" href="#approach">The approach ↓</a>
      <a class="button" href="#credits">The credits ↓</a>
      <button class="button roll-button" type="button"><span class="dot" aria-hidden="true"></span><span class="roll-label">Roll credits</span></button>
    </div>
  </header>

  <main>
    <section class="section" id="approach" aria-labelledby="approach-title">
      <div class="section-head reveal">
        <h2 id="approach-title">${esc(approach.title)}</h2>
      </div>
      <div class="approach reveal">
        <p class="statement">${statement}</p>
        <div class="pathways">${pathways}
        </div>
      </div>
    </section>

    <section class="section" id="credits" aria-labelledby="credits-title">
      <div class="section-head reveal">
        <p class="label">Starring</p>
        <h2 id="credits-title">The credits</h2>
        <p>${esc(data.creditsIntro)}</p>
        <p class="featured-credits">C.Y. works with ${featuredCredits}, and 20+ more.</p>
      </div>
      <ol class="credits">${credits}
      </ol>
    </section>

    <section class="section" id="about" aria-labelledby="about-title">
      <div class="section-head reveal">
        <p class="label">Liner notes</p>
        <h2 id="about-title">About C.Y.</h2>
      </div>
      <div class="notes reveal">
        <div class="notes-text">
          ${notes}
        </div>
        <dl class="facts">
          ${facts}
          <div><dt class="label">In shorthand</dt><dd>${background}</dd></div>
        </dl>
      </div>
      <figure class="quote reveal">
        <blockquote>${esc(cy.quote.text)}</blockquote>
        <figcaption class="label">${esc(cy.quote.cite)}</figcaption>
      </figure>
    </section>

    <section class="section" id="projects" aria-labelledby="projects-title">
      <div class="section-head reveal">
        <h2 id="projects-title">Projects &amp; documentaries</h2>
      </div>
      <div class="project-directory reveal">${projectGroups}
      </div>
    </section>

    <section class="section" id="interviews" aria-labelledby="interviews-title">
      <div class="section-head reveal">
        <p class="label">Bonus features</p>
        <h2 id="interviews-title">In conversation</h2>
      </div>
      <div class="reels">${reels}
      </div>
    </section>
  </main>

  <footer class="end">
    <p class="label">That’s a wrap</p>
    <h2>Say hello</h2>
    ${linkList(cy.links)}
    <p class="colophon">Site by <a href="https://jonathanmann.net" rel="noopener" target="_blank">Jonathan Mann</a>, one of the credits. <a href="https://github.com/songadaymann/executiveproducing" rel="noopener" target="_blank">Source</a></p>
  </footer>

  <script src="/app.js" type="module"></script>
</body>
</html>
`;

await writeFile(path.join(dist, 'index.html'), html);
for (const file of ['styles.css', 'app.js', 'favicon.svg', 'og.png']) {
  if (existsSync(path.join(root, 'src', file))) await cp(path.join(root, 'src', file), path.join(dist, file));
}
await writeFile(path.join(dist, '404.html'), `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Cut</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,300..700&family=Instrument+Serif&display=swap"><link rel="stylesheet" href="/styles.css"></head>
<body><main class="end"><p class="label">404</p><h2>This scene was cut.</h2><p><a class="button" href="/">Back to the credits</a></p></main></body></html>
`);
await writeFile(path.join(dist, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`);
await writeFile(path.join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${SITE}/</loc></url></urlset>\n`);
console.log(`Built dist/ with ${data.credits.length} credits${portrait ? '' : ' (no private-assets/, so no photos)'}.`);
