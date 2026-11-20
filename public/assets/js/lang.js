// Language: fills every [data-lang] element from the dictionaries inlined into the page
// (window.AAIL_I18N, see vite.config.js). It runs synchronously at the end of <body>, before the
// kit's module scripts, so moments and tabs start on the final text. Switching reloads the page,
// so every moment starts again on the new language's words.
(function () {
  var dicts = window.AAIL_I18N || {};
  var stored = null;
  try { stored = localStorage.getItem('aail-lang'); } catch (e) {}
  var lang = dicts[stored] ? stored : 'zh';
  var d = dicts[lang] || {};
  var html = document.documentElement;
  html.lang = lang === 'zh' ? 'zh-CN' : 'en';

  // A Chinese statement has no spaces between words; [data-lang-split] wraps each word in a span
  // so the word-highlight moment can light it word by word.
  var segment = function (el, text) {
    if (lang !== 'zh' || typeof Intl === 'undefined' || !Intl.Segmenter) { el.textContent = text; return; }
    var seg = new Intl.Segmenter('zh', { granularity: 'word' });
    el.textContent = '';
    Array.from(seg.segment(text)).forEach(function (s) {
      var span = document.createElement('span');
      span.textContent = s.segment;
      el.appendChild(span);
    });
  };

  document.querySelectorAll('[data-lang]').forEach(function (el) {
    var v = d[el.getAttribute('data-lang')];
    if (v == null) return;
    if (el.hasAttribute('data-lang-split')) segment(el, v);
    else el.textContent = v;
  });
  // attributes: data-lang-alt, data-lang-aria (aria-label), data-lang-content (meta), data-lang-title
  [['data-lang-alt', 'alt'], ['data-lang-aria', 'aria-label'], ['data-lang-content', 'content'], ['data-lang-title', 'title']]
    .forEach(function (pair) {
      document.querySelectorAll('[' + pair[0] + ']').forEach(function (el) {
        var v = d[el.getAttribute(pair[0])];
        if (v != null) el.setAttribute(pair[1], v);
      });
    });

  document.querySelectorAll('[data-lang-switch]').forEach(function (btn) {
    var other = lang === 'zh' ? 'en' : 'zh';
    btn.addEventListener('click', function () {
      try { localStorage.setItem('aail-lang', other); } catch (e) {}
      location.reload();
    });
  });
})();
