const PHRASE = 'Everything your skin.';
const TYPE_DELAY = 76;
const DELETE_DELAY = 44;
const HOLD_DELAY = 1500;

export function initCollectionSlideshow() {
  const slideshow = document.querySelector('[data-collection-slideshow]');
  if (!slideshow) return;

  const slides = [...slideshow.querySelectorAll('[data-slide]')];
  const caption = slideshow.querySelector('[data-typewriter-text]');
  const count = slideshow.querySelector('[data-slide-count]');
  if (!slides.length || !caption) return;

  let slideIndex = 0;
  let timer;
  let position = 0;
  let deleting = false;

  const showSlide = (index) => {
    slideIndex = index % slides.length;
    slides.forEach((slide, itemIndex) => slide.classList.toggle('is-active', itemIndex === slideIndex));
    if (count) count.textContent = `${String(slideIndex + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
  };

  const loopType = () => {
    window.clearTimeout(timer);
    if (!deleting && position < PHRASE.length) {
      position += 1;
      caption.textContent = PHRASE.slice(0, position);
      timer = window.setTimeout(loopType, TYPE_DELAY);
      return;
    }
    if (!deleting) {
      deleting = true;
      timer = window.setTimeout(loopType, HOLD_DELAY);
      return;
    }
    if (position > 0) {
      position -= 1;
      caption.textContent = PHRASE.slice(0, position);
      timer = window.setTimeout(loopType, DELETE_DELAY);
      return;
    }
    showSlide(slideIndex + 1);
    deleting = false;
    timer = window.setTimeout(loopType, 360);
  };

  showSlide(0);
  loopType();
}
