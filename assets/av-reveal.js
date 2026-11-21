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
/* sync 16 Nov */

/* Level columns (16 Nov 2026): where a section has a small label and a heading on the left and text on the right,
   the text on the right starts level with the heading's first line, not with the label above it. */
(function () {
  var SEL = '.av-intro, .av-band, .av-enquiry, .av-steps__head, .av-chapter, .av-people__head, .av-past-head, .av-past__head, .av-campaign__head';
  function capTop(el) {
    var cs = getComputedStyle(el), fs = parseFloat(cs.fontSize), lh = parseFloat(cs.lineHeight);
    if (!lh) lh = fs * 1.2;
    return el.getBoundingClientRect().top + (lh - fs * 0.72) / 2;
  }
  function firstText(el) {
    var w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null), n;
    while ((n = w.nextNode())) { if (n.nodeValue.trim()) return n.parentElement; }
    return null;
  }
  function level() {
    document.querySelectorAll(SEL).forEach(function (sec) {
      var a = sec.children[0], b = sec.children[1];
      if (!a || !b) return;
      var label = a.querySelector('.av-label');
      var head = a.querySelector('h1, h2, h3, .av-statement, .av-sub');
      if (!label || !head || !head.textContent.trim()) return;
      b.style.paddingTop = '0px';
      var ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
      if (rb.left < ra.right - 1) return; /* stacked: nothing to level */
      var t = firstText(b);
      if (!t) return;
      var d = capTop(head) - capTop(t);
      b.style.paddingTop = d > 1 ? d.toFixed(1) + 'px' : '0px';
    });
  }
  var timer;
  function later() { clearTimeout(timer); timer = setTimeout(level, 120); }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(level); else window.addEventListener('load', level);
  window.addEventListener('resize', later);
})();
