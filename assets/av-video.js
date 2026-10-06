/* .av-video: muted loop by default. The play control swaps in the full film (data-film) with sound and native controls;
   the Sound toggle on the film sets muted. If play() rejects, the poster stays and the play control returns. */
(function () {
  var reduce = false;
  try { reduce = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
  document.querySelectorAll('.av-video').forEach(function (box) {
    var video = box.querySelector('video');
    var btn = box.querySelector('.av-video__play');
    var sound = box.querySelector('.av-video__sound');
    if (!video || !btn) return;
    if (reduce && video.hasAttribute('autoplay')) { video.removeAttribute('autoplay'); video.pause(); }
    function syncSound() {
      if (sound) sound.setAttribute('aria-pressed', video.muted ? 'false' : 'true');
    }
    btn.addEventListener('click', function () {
      var film = box.getAttribute('data-film');
      if (film && video.getAttribute('src') !== film) {
        video.pause();
        video.removeAttribute('loop');
        video.removeAttribute('autoplay');
        video.setAttribute('src', film);
        video.load();
      }
      video.setAttribute('controls', '');
      video.removeAttribute('tabindex');
      video.muted = false;
      box.classList.add('is-playing');
      syncSound();
      var p = video.play();
      if (p && p.catch) {
        p.catch(function () {
          box.classList.remove('is-playing');
          video.removeAttribute('controls');
          video.muted = true;
          syncSound();
        });
      }
      video.focus();
    });
    if (sound) {
      sound.addEventListener('click', function () { video.muted = !video.muted; syncSound(); });
      video.addEventListener('volumechange', syncSound);
    }
  });
})();
