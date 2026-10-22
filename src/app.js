// Small enhancements on top of a page that works without JavaScript.
const root = document.documentElement;
root.classList.add('js');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Fade sections in as they enter the viewport.
const revealer = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      entry.target.classList.add('seen');
      revealer.unobserve(entry.target);
    }
  }
}, { rootMargin: '0px 0px -8% 0px' });
document.querySelectorAll('.reveal').forEach((el) => revealer.observe(el));

// Players load only when someone opens a credit, so the page stays light.
function embedFrame(el) {
  const { type, id, title } = el.dataset;
  const frame = document.createElement('iframe');
  frame.loading = 'lazy';
  frame.title = title;
  frame.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
  if (type === 'spotify') {
    frame.src = `https://open.spotify.com/embed/${id}?theme=0`;
    frame.height = id.startsWith('track') ? 152 : 352;
  } else if (type === 'bandcamp') {
    frame.className = 'bc';
    frame.src = `https://bandcamp.com/EmbeddedPlayer/${id}/size=large/bgcol=16140f/linkcol=f0a63a/tracklist=false/artwork=small/transparent=true/`;
    frame.height = 120;
  } else if (type === 'youtube') {
    frame.className = 'yt';
    frame.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
  } else if (type === 'soundcloud') {
    frame.src = `https://w.soundcloud.com/player/?url=${encodeURIComponent(id)}&color=%23f0a63a&visual=false`;
    frame.height = 166;
  }
  return frame;
}

document.querySelectorAll('.embed[data-type]').forEach((el) => {
  const details = el.closest('details');
  if (el.dataset.type === 'youtube') {
    // A poster first; the YouTube player itself only after a click.
    const poster = document.createElement('button');
    poster.type = 'button';
    poster.className = 'yt-poster';
    poster.style.backgroundImage = `url(https://i.ytimg.com/vi/${el.dataset.id}/hqdefault.jpg)`;
    poster.setAttribute('aria-label', `Play: ${el.dataset.title}`);
    poster.innerHTML = '<span aria-hidden="true"></span>';
    poster.addEventListener('click', () => poster.replaceWith(embedFrame(el)));
    el.append(poster);
    return;
  }
  details.addEventListener('toggle', () => {
    if (details.open && !el.firstChild) el.append(embedFrame(el));
  });
});

// A photo that trails the pointer over each name, for mice and trackpads.
if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
  const peek = document.createElement('div');
  peek.className = 'peek';
  peek.setAttribute('aria-hidden', 'true');
  const img = document.createElement('img');
  img.alt = '';
  peek.append(img);
  document.body.append(peek);
  document.querySelectorAll('.credit summary[data-peek]').forEach((summary) => {
    const name = summary.querySelector('.credit-name');
    name.addEventListener('pointerenter', () => {
      if (summary.parentElement.open) return;
      img.src = summary.dataset.peek;
      peek.classList.add('on');
    });
    name.addEventListener('pointermove', (e) => {
      peek.style.left = `${e.clientX}px`;
      peek.style.top = `${e.clientY}px`;
    });
    name.addEventListener('pointerleave', () => peek.classList.remove('on'));
    summary.addEventListener('click', () => peek.classList.remove('on'));
  });
  addEventListener('scroll', () => peek.classList.remove('on'), { passive: true });
}

// "Roll credits": scroll the page at film-credit speed until the end card or any input.
const rollButton = document.querySelector('.roll-button');
if (rollButton && !reduceMotion) {
  let rolling = false;
  let last = 0;
  let y = 0;
  const label = rollButton.querySelector('.roll-label');
  const stop = () => {
    rolling = false;
    root.classList.remove('rolling');
    root.style.scrollBehavior = '';
    label.textContent = 'Roll credits';
  };
  const step = (t) => {
    if (!rolling) return;
    const dt = last ? Math.min(t - last, 50) : 16;
    last = t;
    y += dt * 0.07;
    scrollTo(0, y);
    if (innerHeight + scrollY >= root.scrollHeight - 2) return stop();
    requestAnimationFrame(step);
  };
  rollButton.addEventListener('click', (e) => {
    e.stopPropagation();
    if (rolling) return stop();
    rolling = true;
    last = 0;
    y = scrollY;
    root.style.scrollBehavior = 'auto';
    root.classList.add('rolling');
    label.textContent = 'Stop';
    requestAnimationFrame(step);
  });
  for (const type of ['wheel', 'touchstart', 'keydown', 'pointerdown']) {
    addEventListener(type, (e) => {
      if (rolling && !rollButton.contains(e.target)) stop();
    }, { passive: true });
  }
}
