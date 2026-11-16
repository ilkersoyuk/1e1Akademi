/* Manual carousel: mouse hover previews; one click/tap opens Instagram. */
(function () {
  'use strict';
  function getNextIndex(index, count, delta) {
    if (![index, count, delta].every(Number.isInteger) || count < 1) throw new TypeError('Invalid carousel selection');
    return ((index + delta) % count + count) % count;
  }
  function clampScroll(left, max) {
    if (!Number.isFinite(left) || !Number.isFinite(max) || max < 0) throw new TypeError('Invalid scroll dimensions');
    return Math.max(0, Math.min(left, max));
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = {getNextIndex, clampScroll};
  if (typeof document === 'undefined') return;
  const section = document.getElementById('mezunlar');
  if (!section) return;
  const track = document.getElementById('alumni-track');
  const cards = [...track.querySelectorAll('.alumni-card')];
  const current = document.getElementById('alumni-current');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const videos = cards.map(card => card.querySelector('video'));
  const buttons = cards.map(card => card.querySelector('.alumni-preview-toggle'));
  const playIcon = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';
  const pauseIcon = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 5h4v14H6zm8 0h4v14h-4z"/></svg>';
  if (!cards.length) return;
  let selected = 0, scrollTimer, layoutTimer, lastWidth = 0;
  function perPage() { return Math.max(1, Math.round(Number(getComputedStyle(section).getPropertyValue('--alumni-columns')) || 1)); }
  function maxIndex() { return Math.max(0, cards.length - perPage()); }
  function render() {
    cards.forEach((card, i) => card.classList.toggle('is-selected', i === selected));
    current.textContent = String(selected + 1).padStart(2, '0');
    section.style.setProperty('--alumni-progress', Math.min(100, (selected + perPage()) / cards.length * 100) + '%');
  }
  function select(index) {
    selected = Math.max(0, Math.min(index, maxIndex()));
    render();
    const left = cards[selected].getBoundingClientRect().left - track.getBoundingClientRect().left + track.scrollLeft;
    track.scrollTo({left: clampScroll(left, Math.max(0, track.scrollWidth - track.clientWidth)), behavior: reduced.matches ? 'instant' : 'smooth'});
  }
  function pause(index) {
    const v = videos[index], button = buttons[index];
    button.removeAttribute('data-hovering');
    v.pause();
    cards[index].classList.remove('is-previewing');
    button.querySelector('.alumni-play').innerHTML = playIcon;
  }
  function stopAll() { videos.forEach((v, i) => pause(i)); }
  function unavailable(index) {
    pause(index);
    buttons[index].removeAttribute('data-hovering');
    buttons[index].querySelector('.alumni-play').hidden = true;
    cards[index].dataset.previewAvailable = 'false';
  }
  function loadPreview(index) {
    const v = videos[index];
    if (v.hasAttribute('src')) return;
    if (!v.canPlayType('video/mp4')) { unavailable(index); return; }
    v.preload = 'auto';
    v.src = v.dataset.src;
    v.load();
  }
  videos.forEach((v, index) => {
    v.addEventListener('loadeddata', () => {
      if (!v.videoWidth || !v.videoHeight) return;
      // Native Instagram links stay usable even if a preview fails.
      buttons[index].querySelector('.alumni-play').hidden = false;
      cards[index].dataset.previewAvailable = 'true';
    });
    v.addEventListener('error', () => unavailable(index));
    buttons[index].addEventListener('pointerenter', async event => {
      if (event.pointerType !== 'mouse' || reduced.matches || !matchMedia('(hover: hover)').matches) return;
      stopAll();
      buttons[index].dataset.hovering = 'true';
      loadPreview(index);
      try {
        v.muted = true;
        v.volume = 0;
        v.currentTime = 0;
        await v.play();
        if (document.hidden || buttons[index].dataset.hovering !== 'true') { pause(index); return; }
        cards[index].classList.add('is-previewing');
        buttons[index].querySelector('.alumni-play').innerHTML = pauseIcon;
      } catch { if (v.error) unavailable(index); }
    });
    buttons[index].addEventListener('pointerleave', () => {
      buttons[index].removeAttribute('data-hovering');
      pause(index);
    });
    cards[index].addEventListener('focusin', () => {
      const start = Math.min(Math.floor(index / perPage()) * perPage(), maxIndex());
      if (start !== selected) select(start);
    });
  });
  document.getElementById('alumni-next').addEventListener('click', () => {stopAll(); select(selected >= maxIndex() ? 0 : selected + perPage());});
  document.getElementById('alumni-prev').addEventListener('click', () => {stopAll(); select(selected <= 0 ? maxIndex() : selected - perPage());});
  track.addEventListener('keydown', event => {
    if (event.target !== track) return;
    let index;
    if (event.key === 'ArrowRight') index = selected >= maxIndex() ? 0 : selected + perPage();
    else if (event.key === 'ArrowLeft') index = selected <= 0 ? maxIndex() : selected - perPage();
    else if (event.key === 'Home') index = 0;
    else if (event.key === 'End') index = maxIndex();
    else return;
    event.preventDefault(); stopAll(); select(index);
  });
  track.addEventListener('scroll', () => {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      const x = track.getBoundingClientRect().left;
      let nearest = cards.reduce((best, c, i) => Math.abs(c.getBoundingClientRect().left - x) < Math.abs(cards[best].getBoundingClientRect().left - x) ? i : best, 0);
      selected = Math.min(nearest, maxIndex()); render();
    }, 160);
  }, {passive: true});
  if ('IntersectionObserver' in window) {
    const loader = new IntersectionObserver(entries => entries.forEach(entry => {
      const i = cards.findIndex(c => c.querySelector('.alumni-media') === entry.target);
      if (entry.isIntersecting) loadPreview(i);
      else pause(i);
    }), {rootMargin: '120px 0px', threshold: 0});
    buttons.forEach(button => loader.observe(button));
  } else buttons.forEach((button, i) => loadPreview(i));
  function alignCopy() {
    section.style.removeProperty('--alumni-name-height');
    section.style.removeProperty('--alumni-placement-height');
    const max = selector => Math.max(...cards.map(c => c.querySelector(selector).getBoundingClientRect().height));
    section.style.setProperty('--alumni-name-height', Math.ceil(max('h3')) + 'px');
    section.style.setProperty('--alumni-placement-height', Math.ceil(max('.alumni-placement')) + 'px');
    section.querySelector('.alumni-gallery').style.setProperty('--alumni-video-height', cards[0].querySelector('.alumni-media').getBoundingClientRect().height + 'px');
  }
  function layout() {
    clearTimeout(layoutTimer);
    layoutTimer = setTimeout(() => {alignCopy(); selected = Math.min(selected, maxIndex()); select(selected);}, 80);
  }
  if ('ResizeObserver' in window) new ResizeObserver(entries => {
    const width = entries[0].contentRect.width;
    if (Math.abs(width - lastWidth) > .5) {lastWidth = width; layout();}
  }).observe(track);
  window.addEventListener('resize', layout, {passive: true});
  document.fonts?.ready.then(layout);
  document.addEventListener('visibilitychange', () => {if (document.hidden) stopAll();});
  window.addEventListener('pagehide', stopAll);
  reduced.addEventListener('change', stopAll);
  render(); layout();
})();
