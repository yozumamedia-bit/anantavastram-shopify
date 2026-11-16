/* Scroll reveal for photographs and loops only: .av-media and .av-video wrappers carry .av-reveal (set in their snippets).
   Adds .is-in once 15% of the box is inside the viewport less a 10% margin at the bottom; av-base.css holds the transition.
   Design mode, no-js and reduced motion show everything at once (CSS). */
(function () {
  var items = document.querySelectorAll('.av-reveal');
  if (!items.length) return;
  function show(n) { n.classList.add('is-in'); }
  if (!('IntersectionObserver' in window)) { items.forEach(show); return; }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { show(e.target); io.unobserve(e.target); }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });
  items.forEach(function (n) { io.observe(n); });
})();

/* Optical left edge (16 Nov 2026): a large heading's first letter carries blank space on its left (a round "C" more than
   an "A"), so big headings looked indented against the small label above them. Each large, left-aligned heading is
   pulled left by exactly the blank space of its own first letter, so the ink lines up with the text around it. */
(function () {
  if (!document.fonts || !window.CanvasRenderingContext2D) return;
  var ctx = document.createElement('canvas').getContext('2d');
  function align() {
    document.querySelectorAll('.av-statement, .av-sub, .av-name, .av-coll-story__text h2, .av-coll-story__text h3').forEach(function (el) {
      var cs = getComputedStyle(el);
      var size = parseFloat(cs.fontSize);
      if (size < 22 || (cs.textAlign !== 'start' && cs.textAlign !== 'left')) return;
      var text = (el.textContent || '').trim();
      if (!text) return;
      ctx.font = cs.fontStyle + ' ' + cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily;
      var m = ctx.measureText(text.charAt(0));
      if (typeof m.actualBoundingBoxLeft !== 'number') return;
      var gap = -m.actualBoundingBoxLeft; // blank space to the left of the first letter's ink
      if (gap > 0.3 && gap < size * 0.15) el.style.textIndent = (-gap).toFixed(2) + 'px';
    });
  }
  document.fonts.ready.then(align);
})();
