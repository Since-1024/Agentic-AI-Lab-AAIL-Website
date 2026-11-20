import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';


const rootDir = dirname(fileURLToPath(import.meta.url));

const applyIncludes = (html, baseDir) => {
  const includePattern = /<!--\s*@include\s+"([^"]+)"\s*-->/g;
  return html.replace(includePattern, (_, relPath) => {
    const filePath = resolve(baseDir, relPath);
    const partial = readFileSync(filePath, 'utf-8');
    return applyIncludes(partial, dirname(filePath));
  });
};

const htmlPartials = () => ({
  name: 'html-partials',
  transformIndexHtml(html, ctx) {
    if (!ctx?.filename) {
      return html;
    }
    return applyIncludes(html, dirname(ctx.filename));
  }
});

// Inline both language dictionaries into the page, so assets/js/lang.js can fill every
// [data-lang] element synchronously, before the kit's module scripts (moments, tabs) start.
const i18nInline = () => ({
  name: 'i18n-inline',
  transformIndexHtml(html) {
    const read = lang => readFileSync(resolve(rootDir, `public/assets/lang/${lang}.json`), 'utf-8');
    const zh = JSON.parse(read('zh'));
    const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    // pre-fill the default language, so the page reads complete without script
    html = html
      .replace(/(<([a-z0-9]+)\b[^>]*\sdata-lang="([^"]+)"[^>]*>)(<\/\2>)/g,
        (m, open, tag, key, close) => (key in zh ? open + esc(zh[key]) + close : m))
      .replace(/<[a-z]+\b[^>]*\sdata-lang-(?:alt|aria|content|title)="[^"]+"[^>]*>/g, tag =>
        tag.replace(/\sdata-lang-(alt|aria|content|title)="([^"]+)"/g, (m, kind, key) => {
          if (!(key in zh)) return m;
          const name = { alt: 'alt', aria: 'aria-label', content: 'content', title: 'title' }[kind];
          return ` ${name}="${esc(zh[key])}"${m}`;
        }));
    const dicts = `{"zh":${read('zh')},"en":${read('en')}}`.replace(/<\/script/gi, '<\\/script');
    return html.replace('<!-- @i18n -->', `<script>window.AAIL_I18N=${dicts}</script>`);
  }
});

// The design kit (public/assets) is plain ES modules served as files. Vite would try to bundle a
// <script type="module" src> in index.html, so these tags go in after Vite has processed the page.
const kitModules = () => ({
  name: 'kit-modules',
  transformIndexHtml: {
    order: 'post',
    handler(html) {
      const tags = ['system.js', 'motion/motion.js', 'layout/layout.js', 'diagrams/mount.js']
        .map(src => `<script type="module" src="assets/${src}"></script>`)
        .join('\n');
      return html.replace('<!-- @modules -->', tags);
    }
  }
});

export default {
  base: '/Agentic-AI-Lab-AAIL-Website/',
  // base: '/',
  root: 'src',
  publicDir: '../public',
  plugins: [htmlPartials(), i18nInline(), kitModules()],
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: resolve(rootDir, 'src/index.html')
      }
    }
  }
};
