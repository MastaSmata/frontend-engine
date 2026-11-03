export function mount(root, props) {
  const splash = root.querySelector('[data-preloader]');
  if (!splash) return;
  const timeout = Math.max(1000, Math.min(Number(props.timeout) || 3000, 15000));
  const wait = (duration) => new Promise((resolve) => setTimeout(resolve, duration));
  const firstScreenImages = async () => {
    await new Promise((resolve) => requestAnimationFrame(resolve));
    const pending = [...document.images].filter((image) => !image.complete && !image.closest('[data-preloader]'))
      .filter((image) => { const rect = image.getBoundingClientRect(); return rect.width > 0 && rect.bottom > 0 && rect.top < innerHeight; })
      .map((image) => new Promise((resolve) => { image.addEventListener('load', resolve, { once:true }); image.addEventListener('error', resolve, { once:true }); }));
    await Promise.all(pending);
  };
  const hide = () => splash.classList.add('is-done');
  const show = () => splash.classList.remove('is-done');
  Promise.race([Promise.all([document.fonts?.ready, firstScreenImages()]).catch(() => {}), wait(timeout)])
    .then(() => setTimeout(hide, Math.max(0, 250 - performance.now())));
  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest?.('a[href]');
    if (!link || (link.target && link.target !== '_self') || link.hasAttribute('download')) return;
    const target = new URL(link.href, location.href);
    if (target.origin !== location.origin || (target.pathname === location.pathname && target.search === location.search)) return;
    show();
    setTimeout(hide, timeout * 2);
  });
  window.addEventListener('beforeunload', show);
  window.addEventListener('pageshow', (event) => { if (event.persisted) hide(); });
}
