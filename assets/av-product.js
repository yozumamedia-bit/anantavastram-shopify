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
