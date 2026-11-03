export function mountLazyVideos(root = document) {
  const videos = [...root.querySelectorAll('video[data-lazy-video]')];
  if (!videos.length) return;

  const saveData = navigator.connection?.saveData === true;
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  videos.forEach((video) => {
    const sources = [...video.querySelectorAll('source[data-video-src]')];
    if (saveData || reduceMotion) {
      video.pause();
      video.removeAttribute('autoplay');
      video.preload = 'none';
      video.load();
      return;
    }

    const start = () => {
      let changed = false;
      sources.forEach((source) => {
        if (source.src || !source.dataset.videoSrc) return;
        source.src = source.dataset.videoSrc;
        changed = true;
      });
      if (changed) video.load();
      video.preload = 'metadata';
      if (video.dataset.videoAutoplay === 'true') video.play().catch(() => {});
    };

    if (!('IntersectionObserver' in window)) {
      start();
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      start();
      observer.disconnect();
    }, { rootMargin: '300px' });
    observer.observe(video);
  });
}
