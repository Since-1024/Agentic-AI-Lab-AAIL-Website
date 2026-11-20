// The two demo videos (systems, news): play only while on screen, never under reduced motion,
// and each has the kit's pause disc (WCAG 2.2.2: anything moving past 5 s can be paused).
(function () {
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var zh = (document.documentElement.lang || '').indexOf('zh') === 0;
  var label = { pause: zh ? '暂停视频' : 'Pause video', play: zh ? '播放视频' : 'Play video' };
  var playIcon = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3l8 5-8 5z"/></svg>';
  var pauseIcon = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 3h3v10H4zM9 3h3v10H9z"/></svg>';

  document.querySelectorAll('.site-video').forEach(function (video) {
    var btn = video.parentElement.querySelector('.site-video-toggle');
    var userPaused = reduce;
    var show = function () {
      if (!btn) return;
      var paused = video.paused;
      btn.innerHTML = paused ? playIcon : pauseIcon;
      btn.setAttribute('aria-label', paused ? label.play : label.pause);
    };
    video.addEventListener('play', show);
    video.addEventListener('pause', show);
    show();
    if (btn) btn.addEventListener('click', function () {
      if (video.paused) { userPaused = false; video.play().catch(function () {}); }
      else { userPaused = true; video.pause(); }
    });
    if (!('IntersectionObserver' in window)) return;
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && !userPaused) video.play().catch(function () {});
        else if (!e.isIntersecting) video.pause();
      });
    }, { threshold: 0.35 }).observe(video);
  });
})();
