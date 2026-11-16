(function () {
  'use strict';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduce.matches || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  }, {rootMargin: '0px 0px -6% 0px', threshold: .08});

  for (const target of document.querySelectorAll('.reveal')) {
    if (target.getBoundingClientRect().top < window.innerHeight * .91) continue;
    target.classList.add('reveal-armed');
    observer.observe(target);
  }
  reduce.addEventListener('change', () => {
    if (!reduce.matches) return;
    observer.disconnect();
    document.querySelectorAll('.reveal-armed').forEach(target => target.classList.remove('reveal-armed'));
  });
})();
