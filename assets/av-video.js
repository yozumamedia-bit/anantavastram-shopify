/* .av-video: muted loop by default. Play button unmutes and shows controls; if data-film is set, swaps to the full film. */
(function () {
  var reduce = false;
  try { reduce = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
  document.querySelectorAll('.av-video').forEach(function (box) {
    var video = box.querySelector('video');
    var btn = box.querySelector('.av-video__play');
    if (!video || !btn) return;
    if (reduce && video.hasAttribute('autoplay')) { video.removeAttribute('autoplay'); video.pause(); }
    btn.addEventListener('click', function () {
      var film = box.getAttribute('data-film');
      if (film && video.getAttribute('src') !== film) {
        video.pause();
        video.removeAttribute('loop');
        video.setAttribute('src', film);
        video.load();
      }
      video.setAttribute('controls', '');
      video.removeAttribute('tabindex');
      video.muted = false;
      box.classList.add('is-playing');
      var p = video.play();
      if (p && p.catch) p.catch(function () { box.classList.remove('is-playing'); });
      video.focus();
    });
  });
})();
