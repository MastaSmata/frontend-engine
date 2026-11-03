export function installImageFallback(root = document) {
  root.addEventListener('error', (event) => {
    const image = event.target;
    if (!(image instanceof HTMLImageElement) || image.dataset.failed) return;
    image.dataset.failed = 'true';
    image.remove();
  }, true);
}
