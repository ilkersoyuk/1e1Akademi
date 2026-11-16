/* Pointer effects are limited to mouse input and motion-enabled desktop layouts. */
(function () {
  'use strict';
  const enabled = window.matchMedia('(min-width: 761px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
  const ring = document.createElement('div');
  ring.className = 'site-pointer';
  ring.setAttribute('aria-hidden', 'true');
  document.body.append(ring);
  const magnets = document.querySelectorAll('[data-magnetic]');
  const root = document.documentElement;
  let frame = 0;
  let x = 0;
  let y = 0;
  let active = false;

  function hidePointer() {
    cancelAnimationFrame(frame);
    frame = 0;
    root.classList.remove('has-site-pointer');
  }

  window.addEventListener('pointermove', event => {
    if (!enabled.matches || event.pointerType !== 'mouse' ||
        event.target.closest('input, textarea, select, [contenteditable]')) {
      hidePointer();
      return;
    }
    x = event.clientX;
    y = event.clientY;
    active = Boolean(event.target.closest('a[href], button, summary'));
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      ring.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
      ring.classList.toggle('is-action', active);
      root.classList.add('has-site-pointer');
    });
  }, {passive: true});

  document.addEventListener('pointerout', event => { if (!event.relatedTarget) hidePointer(); });
  window.addEventListener('blur', hidePointer);
  enabled.addEventListener('change', hidePointer);

  for (const magnet of magnets) {
    function reset() {
      magnet.style.removeProperty('--magnet-x');
      magnet.style.removeProperty('--magnet-y');
    }
    magnet.addEventListener('pointermove', event => {
      if (!enabled.matches || event.pointerType !== 'mouse') return;
      const bounds = magnet.getBoundingClientRect();
      const offsetX = event.clientX - (bounds.left + bounds.width / 2);
      const offsetY = event.clientY - (bounds.top + bounds.height / 2);
      magnet.style.setProperty('--magnet-x', Math.max(-6, Math.min(6, offsetX * .13)) + 'px');
      magnet.style.setProperty('--magnet-y', Math.max(-4, Math.min(4, offsetY * .15)) + 'px');
    }, {passive: true});
    magnet.addEventListener('pointerleave', reset);
    magnet.addEventListener('blur', reset);
    window.addEventListener('blur', reset);
    enabled.addEventListener('change', reset);
  }
})();
