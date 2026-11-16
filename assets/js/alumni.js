/* Hover previews and standalone play/pause buttons; center links open Instagram. */
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
  const media = cards.map(card => card.querySelector('.alumni-media'));
  const controls = cards.map(card => card.querySelector('.alumni-preview-control'));
  const names = cards.map(card => card.querySelector('h3').textContent);
  const intents = cards.map(() => null);
  const hovered = cards.map(() => false);
  const userPaused = cards.map(() => false);
  const versions = cards.map(() => 0);
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
  function revealPreviewTop(index) {
    const rect = media[index].getBoundingClientRect();
    const headerBottom = document.getElementById('site-header')?.getBoundingClientRect().bottom || 0;
    const safeTop = Math.max(0, headerBottom) + 12;
    // Only reveal an already-visible preview's hidden top; never push the page downward.
    if (rect.top < safeTop - 1 && rect.bottom > safeTop) {
      window.scrollBy({top: rect.top - safeTop, behavior: 'instant'});
    }
  }
  function select(index, revealTop = false) {
    selected = Math.max(0, Math.min(index, maxIndex()));
    render();
    const left = cards[selected].getBoundingClientRect().left - track.getBoundingClientRect().left + track.scrollLeft;
    track.scrollTo({left: clampScroll(left, Math.max(0, track.scrollWidth - track.clientWidth)), behavior: reduced.matches ? 'instant' : 'smooth'});
    if (revealTop) revealPreviewTop(selected);
  }
  function syncControl(index, playing) {
    controls[index].innerHTML = playing ? pauseIcon : playIcon;
    controls[index].setAttribute('aria-pressed', String(playing));
    controls[index].setAttribute('aria-label', names[index] + (playing ? ': sessiz önizlemeyi duraklat' : ': sessiz önizlemeyi oynat'));
    controls[index].title = playing ? 'Önizlemeyi duraklat' : 'Önizlemeyi oynat';
    cards[index].classList.toggle('is-playing', playing);
  }
  function pause(index, keepFrame = false) {
    versions[index] += 1;
    intents[index] = null;
    videos[index].pause();
    cards[index].classList.toggle('is-previewing', keepFrame && videos[index].readyState >= 2);
    syncControl(index, false);
  }
  function stopAll(except = -1) { videos.forEach((video, i) => { if (i !== except) pause(i); }); }
  function unavailable(index) {
    pause(index);
    controls[index].disabled = true;
    controls[index].hidden = true;
    cards[index].dataset.previewAvailable = 'false';
  }
  function loadPreview(index) {
    const video = videos[index];
    if (video.hasAttribute('src')) return !video.error;
    if (!video.canPlayType('video/mp4')) { unavailable(index); return false; }
    video.preload = 'auto';
    video.src = video.dataset.src;
    video.load();
    return true;
  }
  async function playPreview(index, reason) {
    if (reason === 'hover' && (!hovered[index] || userPaused[index] || reduced.matches)) return;
    stopAll(index);
    const version = ++versions[index];
    intents[index] = reason;
    if (!loadPreview(index)) { unavailable(index); return; }
    const video = videos[index];
    try {
      video.muted = true;
      video.volume = 0;
      if (reason === 'hover' || video.ended) video.currentTime = 0;
      await video.play();
      if (version !== versions[index]) {
        if (!intents[index]) video.pause();
        return;
      }
      if (document.hidden || (reason === 'hover' && !hovered[index])) { pause(index); return; }
      cards[index].classList.add('is-previewing');
      syncControl(index, true);
    } catch {
      if (version !== versions[index]) return;
      if (video.error) unavailable(index);
      else pause(index);
    }
  }
  videos.forEach((video, index) => {
    video.addEventListener('loadeddata', () => {
      if (!video.videoWidth || !video.videoHeight) return;
      controls[index].disabled = false;
      controls[index].hidden = false;
      cards[index].dataset.previewAvailable = 'true';
    });
    video.addEventListener('pause', () => syncControl(index, false));
    video.addEventListener('error', () => unavailable(index));
    media[index].addEventListener('pointerenter', event => {
      if (event.pointerType !== 'mouse') return;
      hovered[index] = true;
      if (reduced.matches || userPaused[index] || intents[index] === 'manual' || !matchMedia('(hover: hover)').matches) return;
      revealPreviewTop(index);
      playPreview(index, 'hover');
    });
    media[index].addEventListener('pointerleave', event => {
      if (event.pointerType !== 'mouse') return;
      hovered[index] = false;
      if (intents[index] === 'hover') pause(index);
    });
    controls[index].addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      revealPreviewTop(index);
      if (!video.paused) {
        userPaused[index] = true;
        pause(index, true);
      } else {
        userPaused[index] = false;
        playPreview(index, 'manual');
      }
    });
    cards[index].addEventListener('focusin', () => {
      const start = Math.min(Math.floor(index / perPage()) * perPage(), maxIndex());
      if (start !== selected) select(start, true);
    });
    syncControl(index, false);
  });
  document.getElementById('alumni-next').addEventListener('click', () => {stopAll(); select(selected >= maxIndex() ? 0 : selected + perPage(), true);});
  document.getElementById('alumni-prev').addEventListener('click', () => {stopAll(); select(selected <= 0 ? maxIndex() : selected - perPage(), true);});
  track.addEventListener('keydown', event => {
    if (event.target !== track) return;
    let index;
    if (event.key === 'ArrowRight') index = selected >= maxIndex() ? 0 : selected + perPage();
    else if (event.key === 'ArrowLeft') index = selected <= 0 ? maxIndex() : selected - perPage();
    else if (event.key === 'Home') index = 0;
    else if (event.key === 'End') index = maxIndex();
    else return;
    event.preventDefault(); stopAll(); select(index, true);
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
    media.forEach(element => loader.observe(element));
  } else media.forEach((element, i) => loadPreview(i));
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
  window.addEventListener('pagehide', () => stopAll());
  reduced.addEventListener('change', () => stopAll());
  render(); layout();
})();
