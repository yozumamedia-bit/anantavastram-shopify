(function () {
  var items = document.querySelectorAll('.av-reveal');
  if (!items.length || !('IntersectionObserver' in window)) {
    items.forEach(function (n) { n.classList.add('is-in'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -10% 0px' });
  items.forEach(function (n) { io.observe(n); });
})();
