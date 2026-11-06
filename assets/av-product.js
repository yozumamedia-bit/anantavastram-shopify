/* Product page: show the phone order bar while the main Order button is out of view. */
(function () {
  var bar = document.getElementById('av-orderbar');
  var button = document.querySelector('.av-product__actions .product-form__submit');
  if (!bar || !button || !('IntersectionObserver' in window)) return;
  var mq = window.matchMedia('(max-width: 900px)');
  var offscreen = false;
  function render() {
    var show = offscreen && mq.matches;
    bar.classList.toggle('is-visible', show);
    bar.setAttribute('aria-hidden', show ? 'false' : 'true');
    bar.querySelector('button').tabIndex = show ? 0 : -1;
    document.body.classList.toggle('has-orderbar', show);
  }
  var io = new IntersectionObserver(function (entries) {
    offscreen = !entries[0].isIntersecting;
    render();
  }, { threshold: 0 });
  io.observe(button);
  if (mq.addEventListener) mq.addEventListener('change', render); else mq.addListener(render);
})();

/* Product photographs: a "1 / 4" counter on the swipe strip, and tap or click to see every photograph large in a
   <dialog>, opened at the one tapped. The largest srcset candidate is used. Esc, the Close button or a tap on the
   backdrop closes it. */
(function () {
  var media = document.querySelector('[data-av-gallery]');
  var dialog = document.getElementById('av-zoom');
  if (!media) return;
  var items = Array.prototype.slice.call(media.children);
  var count = document.querySelector('[data-av-count]');
  if (count && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && e.intersectionRatio > 0.6) count.textContent = items.indexOf(e.target) + 1;
      });
    }, { root: null, threshold: [0.6] });
    items.forEach(function (el) { io.observe(el); });
  }
  if (!dialog || typeof dialog.showModal !== 'function') return;
  var strip = dialog.querySelector('[data-av-zoom-strip]');
  function largest(img) {
    var set = (img.getAttribute('srcset') || '').split(',').map(function (s) { var p = s.trim().split(/\s+/); return { url: p[0], w: parseInt(p[1], 10) || 0 }; });
    set.sort(function (a, b) { return b.w - a.w; });
    return set.length && set[0].url ? set[0].url : img.currentSrc || img.src;
  }
  var imgs = items.map(function (el) { return el.querySelector('img:not(.av-media__alt)'); });
  var built = false;
  function build() {
    if (built) return; built = true;
    imgs.forEach(function (img) {
      if (!img) return;
      var big = document.createElement('img');
      big.src = largest(img); big.alt = img.alt || ''; big.loading = 'lazy'; big.decoding = 'async';
      strip.appendChild(big);
    });
  }
  items.forEach(function (el, i) {
    var img = imgs[i];
    if (!img) return;
    el.classList.add('av-zoomable');
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', '0');
    el.setAttribute('aria-label', 'See photograph ' + (i + 1) + ' larger');
    function open() {
      build();
      dialog.showModal();
      document.documentElement.classList.add('av-zoom-open');
      var target = strip.children[imgs.slice(0, i).filter(Boolean).length];
      if (target) target.scrollIntoView({ block: 'start', inline: 'start' });
    }
    el.addEventListener('click', open);
    el.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
  });
  dialog.querySelector('[data-av-zoom-close]').addEventListener('click', function () { dialog.close(); });
  dialog.addEventListener('click', function (e) { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener('close', function () { document.documentElement.classList.remove('av-zoom-open'); });
})();
