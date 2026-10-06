/* Header. The phone drawer: slides in over 350ms and out over 220ms (av-base.css), the page is inert while it is open,
   focus goes to the first link and back to the burger on close; Escape closes through the dialog's own cancel.
   Over the homepage hero: fills the bar once scrolled, only where scroll-driven animations are missing. */
(function () {
  var dialog = document.getElementById('av-drawer');
  var burger = document.querySelector('.av-header__burger');
  var closing = false;

  function outside() {
    var nodes = Array.prototype.slice.call(document.querySelectorAll('.shopify-section-group-footer-group'));
    var main = document.getElementById('MainContent');
    if (main) nodes.unshift(main);
    return nodes;
  }
  function reduced() {
    try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; }
  }
  function open() {
    if (dialog.open) return;
    dialog.showModal();
    outside().forEach(function (n) { n.setAttribute('inert', ''); });
    var first = dialog.querySelector('.av-drawer__group a');
    if (first) first.focus();
  }
  function cleanup() { // after any close: ours, Escape, or the browser's own
    closing = false;
    dialog.classList.remove('is-closing');
    outside().forEach(function (n) { n.removeAttribute('inert'); });
    burger.focus();
  }
  function close() {
    if (!dialog.open || closing) return;
    if (reduced()) { dialog.close(); cleanup(); return; }
    closing = true;
    var timer;
    function end(e) {
      if (e && (e.target !== dialog || e.animationName !== 'av-drawer-out')) return;
      clearTimeout(timer);
      dialog.removeEventListener('animationend', end);
      dialog.close();
      cleanup();
    }
    dialog.addEventListener('animationend', end);
    timer = setTimeout(end, 300); // if animationend never fires
    dialog.classList.add('is-closing');
  }

  if (dialog && burger && typeof dialog.showModal === 'function') {
    var closeBtn = dialog.querySelector('.av-drawer__close');
    burger.addEventListener('click', open);
    if (closeBtn) closeBtn.addEventListener('click', close);
    dialog.addEventListener('cancel', function (e) { e.preventDefault(); close(); });
    dialog.addEventListener('close', cleanup);
  }

  var section = document.querySelector('.av-header-section');
  if (section && document.body.classList.contains('av-header-over') && !(window.CSS && CSS.supports('animation-timeline: scroll()'))) {
    var threshold = 24;
    var update = function () {
      var y = window.scrollY || document.documentElement.scrollTop || 0;
      section.classList.toggle('is-scrolled', y > threshold);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
  }
})();
