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

// The hero's paper deck: every 4.5 s the front card slides off and goes to the back.
// Stops while hovered or focused, off screen, in a background tab, after the pause disc,
// and never starts under reduced motion.
(function () {
  var stack = document.querySelector('.paper-stack');
  if (!stack) return;
  var cards = Array.prototype.slice.call(stack.querySelectorAll('.paper-card'));
  var btn = stack.querySelector('.paper-stack__toggle');
  var count = stack.querySelector('.paper-stack__count b');
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var zh = (document.documentElement.lang || '').indexOf('zh') === 0;
  var label = { pause: zh ? '暂停轮换' : 'Pause rotation', play: zh ? '继续轮换' : 'Resume rotation' };
  var playIcon = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3l8 5-8 5z"/></svg>';
  var pauseIcon = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 3h3v10H4zM9 3h3v10H9z"/></svg>';
  var order = cards.slice(), shown = 0, timer = null, busy = false;
  var userPaused = reduce, hovered = false, onScreen = true;

  function place() {
    order.forEach(function (c, i) {
      c.setAttribute('data-pos', i);
      c.setAttribute('tabindex', i ? '-1' : '0');
      if (i) c.setAttribute('aria-hidden', 'true'); else c.removeAttribute('aria-hidden');
    });
    if (count) count.textContent = ('0' + (shown + 1)).slice(-2);
  }
  function next() {
    if (busy) return;
    busy = true;
    var front = order.shift();
    front.classList.add('is-leaving');
    order.push(front);
    shown = (shown + 1) % cards.length;
    place();
    front.setAttribute('data-pos', '0');           // keep it on top while it leaves
    setTimeout(function () {
      front.classList.add('no-anim');
      front.classList.remove('is-leaving');
      front.setAttribute('data-pos', order.length - 1);
      void front.offsetWidth;                       // land at the back with no movement
      front.classList.remove('no-anim');
      busy = false;
    }, 760);
  }
  function running() { return !userPaused && !hovered && onScreen && !document.hidden; }
  function sync() {
    clearInterval(timer); timer = null;
    if (running()) timer = setInterval(next, 4500);
    if (btn) {
      btn.innerHTML = userPaused ? playIcon : pauseIcon;
      btn.setAttribute('aria-label', userPaused ? label.play : label.pause);
    }
  }
  place();
  stack.addEventListener('mouseenter', function () { hovered = true; sync(); });
  stack.addEventListener('mouseleave', function () { hovered = false; sync(); });
  stack.addEventListener('focusin', function () { hovered = true; sync(); });
  stack.addEventListener('focusout', function () { hovered = false; sync(); });
  document.addEventListener('visibilitychange', sync);
  if (btn) btn.addEventListener('click', function () { userPaused = !userPaused; sync(); });
  if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { onScreen = e[0].isIntersecting; sync(); }, { threshold: 0.3 }).observe(stack);
  sync();
})();
