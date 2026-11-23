// Renders src/credits.json into a static site in dist/.
// Photos live in the ignored private-assets/ folder (see ASSETS.md). Without it the
// site still builds: credits simply show no photo. `npm run deploy` passes two flags:
// --fetch-photos downloads any missing photo from the private bucket (see photos.mjs), and
// --require-photos fails if one is still missing, so a photo-less site is never published by accident.
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { pullPhoto } from './photos.mjs';

const root = import.meta.dirname;
const dist = path.join(root, 'dist');
const privateAssets = path.join(root, 'private-assets');
const data = JSON.parse(await readFile(path.join(root, 'src/credits.json'), 'utf8'));
const SITE = 'https://executiveproducing.com';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

await rm(dist, { recursive: true, force: true });
await mkdir(path.join(dist, 'media'), { recursive: true });

const requirePhotos = process.argv.includes('--require-photos');
const fetchPhotos = process.argv.includes('--fetch-photos');
const missingPhotos = [];
let fetchedPhotos = 0;
let downloads = Promise.resolve();

// Copies a private photo into dist/media and returns its URL, or null when it's missing.
async function media(file) {
  if (!file) return null;
  const source = path.join(privateAssets, file);
  if (fetchPhotos && !existsSync(source)) {
    // One download at a time: the page asks for many photos at once.
    downloads = downloads.then(async () => {
      if (!existsSync(source) && await pullPhoto(file)) fetchedPhotos += 1;
    });
    await downloads;
  }
  if (!existsSync(source)) {
    missingPhotos.push(file);
    return null;
  }
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

const host = (url) => new URL(url).hostname.replace(/^www\./, '');

// What opens under a name: a photo, who they are, what C.Y. did, links, and a player.
function renderCard(c, photo) {
  const meta = [c.discipline, c.base].filter(Boolean).join(' · ');
  const embed = c.embed
    ? `<div class="embed" data-type="${esc(c.embed.type)}" data-id="${esc(c.embed.id)}" data-title="${esc(c.embed.title)}"></div>`
    : '';
  const backed = c.backed
    ? `<div class="credit-backed"><p class="label">C.Y.’s part</p><p>${esc(c.backed)}${c.source ? ` <a href="${esc(c.source)}" rel="noopener" target="_blank">Source</a>` : ''}</p></div>`
    : '';
  return `<div class="credit-card${photo ? '' : ' no-image'}">
            ${photo ? `<div class="credit-photo"><img src="${esc(photo)}" alt="${esc(c.imageAlt ?? c.name)}" loading="lazy" decoding="async" width="480" height="480"></div>` : ''}
            <div class="credit-body">
              ${meta ? `<p class="credit-meta label">${esc(meta)}</p>` : ''}
              <p class="credit-bio">${esc(c.bio)}</p>
              ${backed}
              ${linkList(c.links)}
            </div>
            ${embed}
          </div>`;
}

// The credits that roll large: role on one side of the centre axis, name on the other.
async function renderCredit(c) {
  const photo = await media(c.image);
  return `
      <li class="credit reveal" id="${esc(c.slug)}">
        <details>
          <summary${photo ? ` data-peek="${esc(photo)}"` : ''}>
            <span class="credit-role">${esc(c.role)}${c.work ? `<span class="work">${esc(c.work)}</span>` : ''}</span>
            <span class="credit-name">${esc(c.name)}</span>
          </summary>
          ${renderCard(c, photo)}
        </details>
      </li>`;
}

// A compact row that opens the same card. Under the name, a credit shows its role and work;
// a project (anything with a url) shows its domain.
async function renderEntry(c) {
  const photo = await media(c.image);
  const sub = c.url
    ? `<span class="entry-domain">${esc(host(c.url))}</span>`
    : `<span class="entry-role">${esc(c.role)}</span>${c.work ? `<span class="work">${esc(c.work)}</span>` : ''}`;
  return `
            <li class="entry" id="${esc(c.slug)}">
              <details>
                <summary${photo ? ` data-peek="${esc(photo)}"` : ''}>
                  <span class="entry-name">${esc(c.name)}</span>
                  <span class="entry-sub">${sub}</span>
                </summary>
                ${renderCard(c, photo)}
              </details>
            </li>`;
}

// Rows in two lists side by side, filled down the left one first.
async function renderColumns(items) {
  const rows = await Promise.all(items.map(renderEntry));
  const half = Math.ceil(rows.length / 2);
  const lists = [rows.slice(0, half), rows.slice(half)].filter((list) => list.length);
  return `<div class="entry-cols">${lists.map((list) => `
          <ol class="entries" role="list">${list.join('')}
          </ol>`).join('')}
        </div>`;
}

const cy = data.cy;
const portrait = await media(cy.image);
const credits = (await Promise.all(data.credits.map(renderCredit))).join('');
const moreCredits = await renderColumns(data.moreCredits);
const featuredCredits = data.featuredCredits.map(([slug, name]) => `<a href="#${esc(slug)}">${esc(name)}</a>`).join(', ');

const { approach } = data;
const statement = approach.statement.map((line) => `<span>${esc(line)}</span>`).join('\n          ');
// Each step carries its position (--i of --n) so the stylesheet can draw the steps as a staircase.
const pathways = approach.pathways.map(({ title, invitation, steps }) => `
        <div class="pathway">
          <h3>${esc(title)}</h3>
          <p>${esc(invitation)}</p>
          <ol class="pathway-steps" role="list" style="--n:${steps.length}">${steps.map((step, i) => `<li style="--i:${i}">${esc(step)}</li>`).join('')}</ol>
        </div>`).join('');

const sections = [['approach', 'Approach'], ['credits', 'Credits'], ['about', 'About'], ['projects', 'Projects'], ['interviews', 'Interviews'], ['contact', 'Contact']];
const navLinks = sections.map(([id, label]) => `<li><a href="#${id}">${label}</a></li>`).join('');

const projectGroups = (await Promise.all(data.projects.map(async ({ group, items }) => `
        <div class="entry-group reveal">
          <h3 class="label slate">${esc(group)}</h3>
          ${await renderColumns(items)}
        </div>`))).join('');

const reels = data.interviews.map((r) => `
      <figure class="reel reveal">
        ${r.youtube
          ? `<div class="embed" data-type="youtube" data-id="${esc(r.youtube)}" data-title="${esc(r.title)}"></div>`
          : `<a class="reel-link" href="${esc(r.url)}" rel="noopener" target="_blank"><span class="reel-read">${esc(r.linkText ?? 'Read')} ↗</span><span class="label">${esc(host(r.url))}</span></a>`}
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
  <nav class="bar" aria-label="Sections">
    <a class="bar-mark" href="#top" aria-label="${esc(cy.name)}, back to the top">
      <span class="bar-domain label" aria-hidden="true">executiveproducing.com</span>
      <span class="bar-name" aria-hidden="true">${esc(cy.name)}</span>
    </a>
    <ul class="bar-links" role="list">${navLinks}</ul>
    <button class="button bar-roll roll-button" type="button"><span class="dot" aria-hidden="true"></span><span class="roll-label">Roll credits</span></button>
    <span class="bar-progress" aria-hidden="true"></span>
  </nav>

  <header class="titles" id="top">
    <div class="titles-main">
      <p class="label slate">Executive Producer</p>
      <h1>${esc(cy.name)}</h1>
      <div class="byline">
        ${portrait ? `<figure class="portrait"><img src="${esc(portrait)}" alt="${esc(cy.imageAlt)}" width="200" height="200"></figure>` : ''}
        <p class="lede">${cy.lede}</p>
      </div>
    </div>
    <div class="titles-bottom">
      <button class="button primary roll-button" type="button"><span class="dot" aria-hidden="true"></span><span class="roll-label">Roll credits</span></button>
      <a class="button" href="#approach">The approach ↓</a>
      <a class="button" href="#credits">The credits ↓</a>
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
        <p class="label slate">Starring</p>
        <h2 id="credits-title">The credits</h2>
        <p>${esc(data.creditsIntro)}</p>
        <p class="featured-credits">C.Y. works with ${featuredCredits}, and 20+ more.</p>
      </div>
      <ol class="credits">${credits}
      </ol>
      <div class="entry-group more-credits reveal">
        <h3 class="label slate">${esc(data.moreCreditsLabel)}</h3>
        ${moreCredits}
      </div>
    </section>

    <section class="section" id="about" aria-labelledby="about-title">
      <div class="section-head reveal">
        <p class="label slate">Liner notes</p>
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
        <h2 id="projects-title">Projects &amp; Documentaries</h2>
      </div>
      <div class="project-directory">${projectGroups}
      </div>
    </section>

    <section class="section" id="interviews" aria-labelledby="interviews-title">
      <div class="section-head reveal">
        <p class="label slate">Bonus features</p>
        <h2 id="interviews-title">In conversation</h2>
      </div>
      <div class="reels">${reels}
      </div>
    </section>
  </main>

  <footer class="end" id="contact">
    <p class="label slate">That’s a wrap</p>
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
<body><main class="end"><p class="label slate">404</p><h2>This scene was cut.</h2><p><a class="button" href="/">Back to the credits</a></p></main></body></html>
`);
await writeFile(path.join(dist, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`);
await writeFile(path.join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${SITE}/</loc></url></urlset>\n`);
const projectCount = data.projects.reduce((n, { items }) => n + items.length, 0);
const missingNote = missingPhotos.length
  ? ` (${missingPhotos.length} ${missingPhotos.length === 1 ? 'photo' : 'photos'} missing from private-assets/)`
  : '';
const fetchedNote = fetchedPhotos
  ? ` Downloaded ${fetchedPhotos} ${fetchedPhotos === 1 ? 'photo' : 'photos'} from the photo bucket.`
  : '';
console.log(`Built dist/ with ${data.credits.length + data.moreCredits.length} credits and ${projectCount} projects${missingNote}.${fetchedNote}`);

if (requirePhotos && missingPhotos.length) {
  console.error(`
Stopped before deploying. The site uses these photos, and they are not in private-assets/${fetchPhotos ? '\nand could not be downloaded from the photo bucket' : ''}:
${missingPhotos.map((file) => `  private-assets/${file}`).join('\n')}

Deploying now would publish the site without them. Photos are kept out of the repo
(see ASSETS.md). If a photo is new, put it in private-assets/ and run npm run photos:push.
Then deploy again.`);
  process.exit(1);
}
