/* No embeds or trackers: local silent previews, ordinary Instagram links. */
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
  const videos = cards.map(card => card.querySelector('video'));
  const pauseButton = document.getElementById('alumni-pause');
  const current = document.getElementById('alumni-current');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!cards.length) return;
  let selected = 0;
  let paused = reduced.matches || Boolean(navigator.connection?.saveData);
  let sectionVisible = false, pointerInside = false, focusWithin = false;
  let autoTimer, previewTimer, scrollTimer;
  let active = -1, pending = -1, generation = 0, programmaticUntil = 0;
  const visibleVideos = new Set();

  function stopPreviews() {
    clearTimeout(previewTimer);
    generation += 1;
    active = -1;
    pending = -1;
    videos.forEach((video, index) => {
      video.pause();
      cards[index].classList.remove('is-previewing');
      if (video.readyState > 0) video.currentTime = 0;
    });
  }
  function preview(delay = 320) {
    if (paused || document.hidden || !sectionVisible || !visibleVideos.has(selected)) {
      stopPreviews();
      return;
    }
    if ((active === selected && !videos[selected].paused) || pending === selected) return;
    stopPreviews();
    const index = selected;
    const ticket = generation;
    pending = index;
    previewTimer = setTimeout(() => {
      if (ticket !== generation || paused || document.hidden || !visibleVideos.has(index)) return;
      const video = videos[index];
      video.muted = true;
      video.defaultMuted = true;
      video.volume = 0;
      video.playsInline = true;
      if (!video.getAttribute('src')) video.src = video.dataset.src;
      const play = video.play();
      if (!play) return;
      play.then(() => {
        if (ticket !== generation || selected !== index || paused || document.hidden || !visibleVideos.has(index)) {
          video.pause();
          return;
        }
        active = index;
        pending = -1;
        cards[index].classList.add('is-previewing');
      }).catch(() => {
        if (ticket === generation) pending = -1;
        cards[index].classList.remove('is-previewing');
      });
    }, delay);
  }
  function render() {
    cards.forEach((card, index) => card.classList.toggle('is-selected', index === selected));
    current.textContent = String(selected + 1).padStart(2, '0');
    section.style.setProperty('--alumni-progress', ((selected + 1) / cards.length * 100) + '%');
    pauseButton.setAttribute('aria-pressed', String(paused));
    pauseButton.setAttribute('aria-label', paused ? 'Önizlemeleri ve otomatik kaydırmayı başlat' : 'Önizlemeleri ve otomatik kaydırmayı durdur');
    pauseButton.querySelector('span').textContent = paused ? '▷' : 'Ⅱ';
    section.dataset.paused = String(paused);
  }
  function cardLeft(index) {
    return cards[index].getBoundingClientRect().left - track.getBoundingClientRect().left + track.scrollLeft;
  }
  function select(index, scroll = true) {
    selected = getNextIndex(index, cards.length, 0);
    render();
    if (scroll) {
      programmaticUntil = performance.now() + 850;
      const max = Math.max(0, track.scrollWidth - track.clientWidth);
      track.scrollTo({left: clampScroll(cardLeft(selected), max), behavior: reduced.matches ? 'auto' : 'smooth'});
    }
    preview(160);
  }
  function schedule() {
    clearTimeout(autoTimer);
    if (paused || document.hidden || !sectionVisible || pointerInside || focusWithin) return;
    autoTimer = setTimeout(() => {
      select(getNextIndex(selected, cards.length, 1));
      schedule();
    }, 6400);
  }
  function pauseChanged() {
    render();
    preview();
    schedule();
  }
  document.getElementById('alumni-next').addEventListener('click', () => {select(getNextIndex(selected, cards.length, 1)); schedule();});
  document.getElementById('alumni-prev').addEventListener('click', () => {select(getNextIndex(selected, cards.length, -1)); schedule();});
  pauseButton.addEventListener('click', () => {paused = !paused; pauseChanged();});
  track.addEventListener('keydown', event => {
    let index;
    if (event.key === 'ArrowRight') index = getNextIndex(selected, cards.length, 1);
    else if (event.key === 'ArrowLeft') index = getNextIndex(selected, cards.length, -1);
    else if (event.key === 'Home') index = 0;
    else if (event.key === 'End') index = cards.length - 1;
    else return;
    event.preventDefault();
    select(index);
    schedule();
  });
  track.addEventListener('pointerenter', event => {
    if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
    pointerInside = true;
    schedule();
  });
  track.addEventListener('pointerleave', event => {
    if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
    pointerInside = false;
    schedule();
  });
  cards.forEach((card, index) => {
    card.addEventListener('pointerenter', event => {
      if (event.pointerType === 'mouse' || event.pointerType === 'pen') select(index, false);
    });
    card.addEventListener('focusin', () => select(index));
    videos[index].addEventListener('error', () => card.classList.remove('is-previewing'));
  });
  section.addEventListener('focusin', () => {focusWithin = true; schedule();});
  section.addEventListener('focusout', event => {
    if (!section.contains(event.relatedTarget)) {focusWithin = false; schedule();}
  });
  track.addEventListener('scroll', () => {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      if (performance.now() > programmaticUntil) {
        const x = track.getBoundingClientRect().left;
        const nearest = cards.reduce((best, card, index) => Math.abs(card.getBoundingClientRect().left - x) < Math.abs(cards[best].getBoundingClientRect().left - x) ? index : best, 0);
        select(nearest, false);
      } else preview();
    }, 140);
  }, {passive: true});
  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver(entries => {
      sectionVisible = entries[0].isIntersecting;
      preview(450);
      schedule();
    }, {threshold: 0, rootMargin: '-90px 0px 0px 0px'});
    sectionObserver.observe(section);
    const videoObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const index = cards.findIndex(card => card.querySelector('.alumni-media') === entry.target);
        if (entry.isIntersecting && entry.intersectionRatio >= .18) visibleVideos.add(index);
        else visibleVideos.delete(index);
      });
      preview();
    }, {threshold: [0, .18, .5]});
    cards.forEach(card => videoObserver.observe(card.querySelector('.alumni-media')));
  }
  reduced.addEventListener('change', event => {paused = event.matches; pauseChanged();});
  document.addEventListener('visibilitychange', () => {preview(); schedule();});
  window.addEventListener('pagehide', () => {clearTimeout(autoTimer); clearTimeout(scrollTimer); stopPreviews();});
  render();
})();
