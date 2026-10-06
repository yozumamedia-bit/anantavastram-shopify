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
