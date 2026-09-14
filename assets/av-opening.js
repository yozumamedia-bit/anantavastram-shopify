(function () {
  var html = document.documentElement;
  var el = document.getElementById('av-opening');
  if (!el) return;
  if (!html.classList.contains('av-opening-active')) { el.remove(); return; }
  try { sessionStorage.setItem('avOpened', '1'); } catch (e) {}
  var HOLD = 1600 + 200 + 1000; // fade-in + delay + hold
  var safety;
  function finish(e) {
    if (e && e.target !== el) return; // ignore bubbled transitions from children
    clearTimeout(safety);
    el.remove();
    html.classList.remove('av-opening-active');
  }
  setTimeout(function () {
    el.classList.add('is-leaving');
    el.addEventListener('transitionend', finish);
    safety = setTimeout(finish, 1200); // if transitionend never fires
  }, HOLD);
})();
