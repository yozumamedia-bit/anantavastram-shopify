/* Once-per-session opening. The wordmark fades in (1000ms), holds (600ms), then the red pane slides up (700ms) while the
   wordmark travels into the header's wordmark box (FLIP), so the pane visibly becomes the header. Any click, key, wheel or
   touch during the sequence skips straight to the slide. <html>.av-opening-active is set before first paint in
   theme.liquid; without it (return visit, reduced motion, editor) nothing is shown and the overlay is removed here. */
(function () {
  var html = document.documentElement;
  var el = document.getElementById('av-opening');
  if (!el) return;
  var reduce = false;
  try { reduce = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
  try { sessionStorage.setItem('avOpened', '1'); } catch (e) {}
  var EVENTS = ['click', 'keydown', 'wheel', 'touchmove'];
  var hold, safety, leaving = false;
  function done() {
    clearTimeout(hold);
    clearTimeout(safety);
    EVENTS.forEach(function (t) { window.removeEventListener(t, leave, true); });
    el.remove();
    html.classList.remove('av-opening-active');
  }
  var pane = el.querySelector('.av-opening__pane');
  var mark = el.querySelector('.av-opening__mark');
  var wordmark = el.querySelector('.av-opening__wordmark');
  var target = document.querySelector('.av-header__wordmark');
  if (reduce || !pane || !mark || !html.classList.contains('av-opening-active')) { done(); return; }
  function leave() {
    if (leaving) return;
    leaving = true;
    clearTimeout(hold);
    // freeze the fade where it is, so the wordmark is measured at rest (the keyframe's 6px rise is gone)
    mark.style.opacity = getComputedStyle(mark).opacity;
    mark.style.animation = 'none';
    void mark.offsetWidth;
    var flip = false;
    if (wordmark && target) {
      var from = wordmark.getBoundingClientRect();
      var to = target.getBoundingClientRect();
      if (from.width > 0 && to.width > 0) {
        flip = true;
        wordmark.style.transform = 'translate(' + (to.left - from.left).toFixed(2) + 'px, ' + (to.top - from.top).toFixed(2) + 'px) scale(' + (to.width / from.width).toFixed(4) + ')';
      }
    }
    el.classList.add(flip ? 'is-flip' : 'is-slide', 'is-leaving');
    mark.style.opacity = '1';
    pane.addEventListener('transitionend', function (e) { if (e.target === pane) done(); });
    safety = setTimeout(done, 1000); // if transitionend never fires
  }
  EVENTS.forEach(function (t) { window.addEventListener(t, leave, { capture: true, passive: true }); });
  hold = setTimeout(leave, 1600); // 1000ms fade-in + 600ms hold
})();
