export function initNotifications() {
  const region = document.createElement('div');
  region.className = 'toast-region';
  region.setAttribute('aria-live', 'polite');
  document.body.appendChild(region);
  return (message) => {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<strong>Little joy:</strong> ${message}`;
    region.appendChild(toast);
    window.setTimeout(() => toast.remove(), 3200);
  };
}
