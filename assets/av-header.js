/* Header over the hero: transparent at the top of the page, solid once scrolled. Loaded only when the setting is on. */
(function () {
  var section = document.querySelector('.av-header-section');
  if (!section) return;
  if (window.CSS && CSS.supports('animation-timeline: scroll()')) return; // av-base.css fills the bar with scroll
  var threshold = 24;
  function update() {
    var y = window.scrollY || document.documentElement.scrollTop || 0;
    section.classList.toggle('is-scrolled', y > threshold);
  }
  update();
  window.addEventListener('scroll', update, { passive: true });
})();
