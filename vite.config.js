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

export default {
  base: '/Agentic-AI-Lab-AAIL-Website/',
  root: 'src',
  publicDir: '../public',
  plugins: [htmlPartials()],
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: resolve(rootDir, 'src/index.html'),
        products: resolve(rootDir, 'src/products-fullPage.html'),
        research: resolve(rootDir, 'src/research-fullPage.html'),
        people: resolve(rootDir, 'src/people-fullPage.html'),
        activities: resolve(rootDir, 'src/activities-fullPage.html')
      }
    }
  }
};

