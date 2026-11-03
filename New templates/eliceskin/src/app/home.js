const sleep = (duration) => new Promise((resolve) => window.setTimeout(resolve, duration));

export function initHomeTypewriter() {
  const target = document.querySelector('[data-home-typewriter]');
  if (!target) return;

  const copy = 'Good skin days on repeat';
  let cursor = copy.length;
  let deleting = false;

  const tick = async () => {
    if (!deleting && cursor < copy.length) {
      cursor += 1;
      target.textContent = copy.slice(0, cursor);
      window.setTimeout(tick, 82);
      return;
    }

    if (!deleting) {
      await sleep(1800);
      deleting = true;
      tick();
      return;
    }

    if (cursor > 0) {
      cursor -= 1;
      target.textContent = copy.slice(0, cursor);
      window.setTimeout(tick, 42);
      return;
    }

    deleting = false;
    window.setTimeout(tick, 450);
  };

  tick();
}
