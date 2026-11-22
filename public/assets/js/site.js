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

// The hero's paper deck: every 2 s the front card slides off to the left and goes to the back.
// The arrows, a sideways swipe on a trackpad (or shift + wheel) over the deck, a mouse drag or a
// finger swipe, and the arrow keys move it by hand. The timer stops while the pointer is over the
// deck or a control has focus, off screen, in a background tab, after the pause button, and never
// runs under reduced motion.
(function () {
  var stack = document.querySelector('.paper-stack');
  if (!stack) return;
  var cards = Array.prototype.slice.call(stack.querySelectorAll('.paper-card'));
  var toggle = stack.querySelector('.paper-stack__toggle');
  var count = stack.querySelector('.paper-stack__count b');
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var zh = (document.documentElement.lang || '').indexOf('zh') === 0;
  var label = { pause: zh ? '暂停轮换' : 'Pause rotation', play: zh ? '继续轮换' : 'Resume rotation' };
  var playIcon = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3l8 5-8 5z"/></svg>';
  var pauseIcon = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 3h3v10H4zM9 3h3v10H9z"/></svg>';
  var INTERVAL = 2000, MOVE = 760;
  var order = cards.slice(), shown = 0, timer = null, busy = false;
  var userPaused = reduce, hovered = false, focused = false, onScreen = true;

  cards.forEach(function (c) {
    c.setAttribute('draggable', 'false');
    var img = c.querySelector('img');
    if (img) img.setAttribute('draggable', 'false');
  });

  function place() {
    order.forEach(function (c, i) {
      c.setAttribute('data-pos', i);
      c.setAttribute('tabindex', i ? '-1' : '0');
      if (i) c.setAttribute('aria-hidden', 'true'); else c.removeAttribute('aria-hidden');
    });
    if (count) count.textContent = ('0' + (shown + 1)).slice(-2);
  }
  function unlock() { setTimeout(function () { busy = false; }, MOVE); }

  // forward: the front card leaves to the left and lands at the back
  function next() {
    if (busy) return;
    busy = true;
    var front = order.shift();
    order.push(front);
    shown = (shown + 1) % cards.length;
    place();
    front.classList.add('is-leaving');
    front.setAttribute('data-pos', '0');            // stays on top while it leaves
    setTimeout(function () {
      front.classList.add('no-anim');
      front.classList.remove('is-leaving');
      front.setAttribute('data-pos', order.length - 1);
      void front.offsetWidth;                        // lands at the back without moving
      front.classList.remove('no-anim');
    }, MOVE);
    unlock();
  }

  // back: the last card comes in from the left to the front, the others step back
  function prev() {
    if (busy) return;
    busy = true;
    var back = order.pop();
    back.classList.add('no-anim', 'is-leaving');
    back.setAttribute('data-pos', '0');
    void back.offsetWidth;                           // start from the left, out of sight
    back.classList.remove('no-anim');
    order.unshift(back);
    shown = (shown - 1 + cards.length) % cards.length;
    place();
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { back.classList.remove('is-leaving'); });
    });
    unlock();
  }

  function step(dir) { if (dir > 0) next(); else prev(); sync(); }

  function running() { return !userPaused && !hovered && !focused && onScreen && !document.hidden; }
  function sync() {
    clearInterval(timer); timer = null;
    if (running()) timer = setInterval(next, INTERVAL);
    if (toggle) {
      toggle.innerHTML = userPaused ? playIcon : pauseIcon;
      toggle.setAttribute('aria-label', userPaused ? label.play : label.pause);
    }
  }

  // the arrow buttons, the pause button, the arrow keys
  stack.querySelectorAll('[data-step]').forEach(function (b) {
    b.addEventListener('click', function () { step(+b.getAttribute('data-step')); });
  });
  if (toggle) toggle.addEventListener('click', function () { userPaused = !userPaused; sync(); });
  stack.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
  });

  // a sideways swipe over the deck moves one card per gesture (a gesture ends after 220 ms of quiet);
  // an up-and-down wheel still scrolls the page
  var acc = 0, fired = false, quiet = null;
  stack.addEventListener('wheel', function (e) {
    var dx = e.deltaX, dy = e.deltaY;
    if (e.shiftKey && !dx) { dx = dy; dy = 0; }
    if (Math.abs(dx) <= Math.abs(dy)) return;
    e.preventDefault();
    clearTimeout(quiet);
    quiet = setTimeout(function () { acc = 0; fired = false; }, 220);
    if (fired) return;
    acc += dx;
    if (Math.abs(acc) > 40) { fired = true; step(acc > 0 ? 1 : -1); }
  }, { passive: false });

  // drag with the mouse, or swipe with a finger: left is the next paper, right the one before
  var startX = null, startY = 0, dragged = false;
  stack.addEventListener('pointerdown', function (e) {
    if (e.target.closest('button')) return;
    startX = e.clientX; startY = e.clientY; dragged = false;
  });
  stack.addEventListener('pointermove', function (e) {
    if (startX === null || dragged) return;
    var dx = e.clientX - startX;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(e.clientY - startY)) {
      dragged = true;
      step(dx < 0 ? 1 : -1);
    }
  });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (t) {
    stack.addEventListener(t, function () { startX = null; });
  });
  stack.addEventListener('click', function (e) {     // a drag is not a click on the paper
    if (dragged && e.target.closest('.paper-card')) { e.preventDefault(); dragged = false; }
  }, true);

  place();
  stack.addEventListener('mouseenter', function () { hovered = true; sync(); });
  stack.addEventListener('mouseleave', function () { hovered = false; sync(); });
  stack.addEventListener('focusin', function () { focused = true; sync(); });
  stack.addEventListener('focusout', function () { focused = false; sync(); });
  document.addEventListener('visibilitychange', sync);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (e) { onScreen = e[0].isIntersecting; sync(); }, { threshold: 0.3 }).observe(stack);
  }
  sync();
})();
