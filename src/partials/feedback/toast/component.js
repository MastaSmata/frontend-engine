export function mount(root) {
  const toast = root.querySelector('[data-toast]');
  const text = root.querySelector('[data-toast-text]');
  if (!toast || !text) return;
  let timer;
  window.addEventListener('groundaq:notice', (event) => {
    const message = typeof event.detail === 'string' ? event.detail : event.detail?.message;
    if (!message) return;
    text.textContent = message;
    toast.hidden = false;
    clearTimeout(timer);
    timer = setTimeout(() => { toast.hidden = true; }, 3200);
  });
}
