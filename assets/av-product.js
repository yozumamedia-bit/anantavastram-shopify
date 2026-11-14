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
  /* one photograph at a time: arrows step the strip, and the counter follows it */
  var current = 0;
  var prev = document.querySelector('[data-av-prev]');
  var next = document.querySelector('[data-av-next]');
  function sync() {
    current = Math.max(0, Math.min(items.length - 1, Math.round(media.scrollLeft / Math.max(1, items[0].offsetWidth))));
    if (count) count.textContent = current + 1;
    if (prev) prev.disabled = current === 0;
    if (next) next.disabled = current === items.length - 1;
  }
  function go(i) {
    i = Math.max(0, Math.min(items.length - 1, i));
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    media.scrollTo({ left: items[i].offsetLeft - items[0].offsetLeft, behavior: reduce ? 'auto' : 'smooth' });
  }
  var tick;
  media.addEventListener('scroll', function () { clearTimeout(tick); tick = setTimeout(sync, 60); }, { passive: true });
  if (prev) prev.addEventListener('click', function () { go(current - 1); });
  if (next) next.addEventListener('click', function () { go(current + 1); });
  media.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(current + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(current - 1); }
  });
  /* the hint: a label and one small nudge of the strip, shown until the first swipe or arrow */
  var hint = document.querySelector('[data-av-hint]');
  if (hint && items.length > 1) {
    var nudged = false;
    var done = function () { hint.classList.add('is-done'); media.removeEventListener('scroll', seen); };
    var seen = function () { if (!nudged && media.scrollLeft > 60) done(); };
    media.addEventListener('scroll', seen, { passive: true });
    if (prev) prev.addEventListener('click', done);
    if (next) next.addEventListener('click', done);
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduce && 'IntersectionObserver' in window) {
      var hio = new IntersectionObserver(function (en) {
        if (!en[0].isIntersecting) return;
        hio.disconnect();
        setTimeout(function () {
          if (media.scrollLeft > 4) return;
          nudged = true;
          media.style.scrollSnapType = 'none';
          media.scrollTo({ left: 56, behavior: 'smooth' });
          setTimeout(function () {
            media.scrollTo({ left: 0, behavior: 'smooth' });
            setTimeout(function () { media.style.scrollSnapType = ''; nudged = false; }, 500);
          }, 520);
        }, 1200);
      }, { threshold: 0.6 });
      hio.observe(media);
    }
  }
  sync();
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
  var more = document.querySelector('[data-av-more]');
  if (more) more.addEventListener('click', function () {
    build();
    dialog.showModal();
    document.documentElement.classList.add('av-zoom-open');
    var target = strip.children[imgs.slice(0, current).filter(Boolean).length];
    if (target) target.scrollIntoView({ block: 'start', inline: 'start' });
  });
  dialog.querySelector('[data-av-zoom-close]').addEventListener('click', function () { dialog.close(); });
  dialog.addEventListener('click', function (e) { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener('close', function () { document.documentElement.classList.remove('av-zoom-open'); });
})();
