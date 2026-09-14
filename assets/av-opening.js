(function () {
  var html = document.documentElement;
  var el = document.getElementById('av-opening');
  if (!el) return;
  if (!html.classList.contains('av-opening-active')) { el.remove(); return; }
  var HOLD = 1600 + 200 + 1000; // fade-in + delay + hold
  function finish() {
    el.remove();
    html.classList.remove('av-opening-active');
    try { sessionStorage.setItem('avOpened', '1'); } catch (e) {}
  }
  setTimeout(function () {
    el.classList.add('is-leaving');
    el.addEventListener('transitionend', finish, { once: true });
    setTimeout(finish, 1200); // safety if transitionend never fires
  }, HOLD);
})();
