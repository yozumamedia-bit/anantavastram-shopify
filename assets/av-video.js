/* .av-video: muted loop by default. Play button unmutes; if data-film is set, swaps to the full film with controls. */
(function () {
  document.querySelectorAll('.av-video').forEach(function (box) {
    var video = box.querySelector('video');
    var btn = box.querySelector('.av-video__play, .av-film__play');
    if (!video || !btn) return;
    btn.addEventListener('click', function () {
      var film = box.getAttribute('data-film');
      if (film && video.getAttribute('src') !== film) {
        video.pause();
        video.removeAttribute('loop');
        video.setAttribute('src', film);
        video.setAttribute('controls', '');
        video.load();
      }
      video.muted = false;
      video.play();
      box.classList.add('is-playing');
    });
  });
})();
