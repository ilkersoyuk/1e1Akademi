/* No dependencies: works on a static host or directly from index.html. */
(function () {
  'use strict';
  function remainingTime(target, now) {
    if (!Number.isFinite(target) || !Number.isFinite(now)) throw new TypeError('Invalid countdown date');
    const total = Math.max(0, Math.floor((target - now) / 1000));
    return {days: Math.floor(total / 86400), hours: Math.floor(total / 3600) % 24, minutes: Math.floor(total / 60) % 60, seconds: total % 60, ended: target <= now};
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = {remainingTime};
  if (typeof document === 'undefined') return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const intro = document.getElementById('brand-intro');
  if (intro && !document.documentElement.classList.contains('show-brand-intro')) {
    intro.remove();
  } else if (intro) {
    intro.addEventListener('animationend', (event) => {if (event.animationName === 'intro-exit') intro.remove();});
    window.setTimeout(() => intro.remove(), 1800);
  }
  const hero = document.getElementById('anasayfa');
  const video = document.getElementById('hero-video');
  const videoToggle = document.getElementById('hero-video-toggle');
  if (video && videoToggle) {
    const icon = videoToggle.querySelector('.hero-video-icon');
    const label = videoToggle.querySelector('.hero-video-label');
    let inView = true;
    let userPaused = false;

    function refreshVideo() {
      if (reduce.matches || userPaused || !inView || document.hidden) {
        video.pause();
        if (reduce.matches) video.classList.remove('is-ready');
        return;
      }
      if (!video.hasAttribute('src')) video.src = video.dataset.src;
      video.play().catch(() => {
        // Aborts while scrolling away are expected. A failed load keeps the poster visible.
        if (video.error) videoToggle.hidden = true;
      });
    }

    video.addEventListener('playing', () => {
      video.classList.add('is-ready');
      videoToggle.hidden = false;
      icon.textContent = 'Ⅱ';
      label.textContent = 'Videoyu durdur';
    });
    video.addEventListener('pause', () => {
      icon.textContent = '▷';
      label.textContent = 'Videoyu oynat';
    });
    video.addEventListener('error', () => {
      video.classList.remove('is-ready');
      videoToggle.hidden = true;
    });
    videoToggle.addEventListener('click', () => {
      userPaused = !video.paused;
      refreshVideo();
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => {
        inView = entry.isIntersecting;
        refreshVideo();
      }, {threshold: .14}).observe(hero);
    }
    reduce.addEventListener('change', () => {
      videoToggle.hidden = true;
      if (!reduce.matches && userPaused && video.readyState >= 2) videoToggle.hidden = false;
      refreshVideo();
    });
    document.addEventListener('visibilitychange', refreshVideo);
    refreshVideo();

    const parallax = window.matchMedia('(min-width: 761px) and (prefers-reduced-motion: no-preference)');
    let frame = 0;
    function scheduleParallax() {
      if (frame || !parallax.matches || !inView) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        hero.style.setProperty('--hero-parallax', Math.min(window.scrollY * .12, 72) + 'px');
      });
    }
    window.addEventListener('scroll', scheduleParallax, {passive: true});
    parallax.addEventListener('change', scheduleParallax);
    scheduleParallax();
  }
  const countdown = document.getElementById('yks-countdown');
  if (countdown) {
    const target = Date.parse(countdown.dataset.target);
    let clock;
    function update() {
      if (!Number.isFinite(target)) {document.getElementById('countdown-note').textContent = 'Sınav tarihi güncellenecek.';return;}
      const now = Date.now();
      const values = remainingTime(target, now);
      for (const key of ['days', 'hours', 'minutes', 'seconds']) countdown.querySelector('[data-time="' + key + '"]').textContent = String(values[key]).padStart(2, '0');
      if (values.ended) {clearTimeout(clock);document.getElementById('countdown-note').textContent = 'Sınav günü geldi. Tüm öğrencilerimize başarılar dileriz.';}
      if (!values.ended) {
        clearTimeout(clock);
        clock = setTimeout(update, 1000 - now % 1000 + 1);
      }
    }
    update();
    document.addEventListener('visibilitychange', () => {if (!document.hidden) update();});
  }
  document.addEventListener('keydown', event => {if (event.key === 'Escape' && document.getElementById('menu-toggle')?.getAttribute('aria-expanded') === 'true') document.getElementById('menu-toggle').click();});
})();

(function () {
  'use strict';
  const strip = document.querySelector('.academy-strip');
  if (!strip) return;
  const track = strip.querySelector('.academy-ticker-track');
  const group = track.querySelector('.academy-ticker-group');
  const toggle = strip.querySelector('.academy-ticker-toggle');
  const icon = toggle.firstElementChild;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const duplicate = group.cloneNode(true);
  duplicate.setAttribute('aria-hidden', 'true');
  duplicate.querySelectorAll('a').forEach(link => { link.tabIndex = -1; });

  function setMotion() {
    const moving = !reducedMotion.matches;
    strip.classList.toggle('is-moving', moving);
    toggle.hidden = !moving;
    if (moving) track.append(duplicate);
    else duplicate.remove();
  }

  toggle.addEventListener('click', () => {
    const paused = strip.classList.toggle('is-paused');
    icon.textContent = paused ? '▷' : 'Ⅱ';
    toggle.setAttribute('aria-label', paused ? 'Kayan bilgileri devam ettir' : 'Kayan bilgileri durdur');
  });

  reducedMotion.addEventListener('change', setMotion);
  setMotion();
})();
