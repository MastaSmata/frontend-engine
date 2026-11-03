import { escapeHtml } from '../../../components/template-core.js';

export function render({ template, props, context, helpers }) {
  const editorial = context.datasets?.editorial;
  const items = (Array.isArray(editorial) ? editorial : editorial?.items || []).slice(0, props.limit || 12);
  const href = escapeHtml(props.collectionHref || 'collection.html');
  const card = (item) => `<a class="editorial-marquee__card" href="${href}"><img src="${escapeHtml(item.image || '')}" alt="${escapeHtml(item.title || '')}" loading="lazy"><span class="editorial-marquee__label"><small>${escapeHtml(item.subtitle || item.index || '')}</small><strong>${escapeHtml(item.title || '')}</strong></span></a>`;
  const once = items.map(card).join('');
  const cards = props.layout === 'grid' ? once : once + once;
  return helpers.renderTemplate(template, [context, { ...props, layout: props.layout || 'marquee', cards }]);
}

export function mount(root, props) {
  const track = root.querySelector('[data-marquee]');
  if (!track || props.layout === 'grid' || track.scrollWidth <= track.clientWidth) return;
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  let dragging = false;
  let previousX = 0;
  let moved = false;
  const onDown = (event) => { dragging = true; moved = false; previousX = event.clientX; track.classList.add('is-dragging'); track.setPointerCapture?.(event.pointerId); };
  const onMove = (event) => { if (!dragging) return; const delta = event.clientX - previousX; if (Math.abs(delta) > 2) moved = true; previousX = event.clientX; track.scrollLeft -= delta; };
  const onUp = () => { dragging = false; track.classList.remove('is-dragging'); };
  track.addEventListener('pointerdown', onDown);
  track.addEventListener('pointermove', onMove);
  track.addEventListener('pointerup', onUp);
  track.addEventListener('pointercancel', onUp);
  track.addEventListener('click', (event) => { if (moved) { event.preventDefault(); moved = false; } }, true);
  if (reducedMotion) return;
  let visible = true;
  const observer = 'IntersectionObserver' in window ? new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }) : null;
  observer?.observe(track);
  const animate = () => {
    if (!dragging && visible && !document.hidden && track.scrollWidth > track.clientWidth) {
      track.scrollLeft += .55;
      const loopWidth = track.scrollWidth / 2;
      if (loopWidth && track.scrollLeft >= loopWidth) track.scrollLeft -= loopWidth;
    }
    requestAnimationFrame(animate);
  };
  requestAnimationFrame(animate);
}
