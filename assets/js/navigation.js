(function(){var e=document.getElementById(`site-header`),t=document.getElementById(`menu-toggle`),n=document.getElementById(`mobile-menu`),r=document.getElementById(`icon-open`),i=document.getElementById(`icon-close`),a=document.querySelectorAll(`.mobile-link, .mobile-appointment`);function o(){if(!e)return;let t=window.scrollY>10;e.classList.toggle(`glass`,t),e.classList.toggle(`border-b`,t),e.classList.toggle(`border-brand-border/70`,t),e.classList.toggle(`shadow-sm`,t)}o(),window.addEventListener(`scroll`,o,{passive:!0});function s(e){n?.classList.toggle(`open`,e),t?.setAttribute(`aria-expanded`,String(e)),t?.setAttribute(`aria-label`,e?`Menüyü kapat`:`Menüyü aç`),r?.classList.toggle(`hidden`,e),i?.classList.toggle(`hidden`,!e),document.body.classList.toggle(`overflow-hidden`,e)}t?.addEventListener(`click`,()=>{s(t.getAttribute(`aria-expanded`)!==`true`)}),a.forEach(e=>{e.addEventListener(`click`,()=>s(!1))});})();

/* Keep desktop and mobile section markers in sync without moving focus. */
(function () {
  'use strict';
  const header = document.getElementById('site-header');
  if (!header) return;
  const links = [...header.querySelectorAll('nav a[href^="#"]')];
  const sections = [...new Set(links.map(link => link.getAttribute('href').slice(1)))]
    .map(id => document.getElementById(id)).filter(Boolean);
  let pending = false;
  function updateCurrentSection() {
    pending = false;
    const activationLine = header.firstElementChild.getBoundingClientRect().bottom + 32;
    let current = '';
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= activationLine) current = '#' + section.id;
    }
    for (const link of links) {
      if (link.getAttribute('href') === current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
  }
  function scheduleUpdate() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(updateCurrentSection);
  }
  window.addEventListener('scroll', scheduleUpdate, {passive: true});
  window.addEventListener('resize', scheduleUpdate);
  window.addEventListener('hashchange', scheduleUpdate);
  if (document.fonts) document.fonts.ready.then(scheduleUpdate);
  updateCurrentSection();
})();
