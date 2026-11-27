import { readdirSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const projectRoot = dirname(fileURLToPath(import.meta.url));
const excludedNamePattern = /(?:^|[._-])(?:test|spec|preview|draft|redirect|404|auth|login|logout|account|dashboard|private)(?:[._-]|$)/i;
function listHtmlPages(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name.startsWith('.') || ['node_modules', 'dist'].includes(entry.name)) return [];
    const absolutePath = resolve(directory, entry.name);
    if (entry.isDirectory()) return listHtmlPages(absolutePath);
    const relativePath = relative(projectRoot, absolutePath).replaceAll('\\', '/');
    if (!entry.isFile() || !entry.name.toLowerCase().endsWith('.html')) return [];
    if (relativePath.toLowerCase() === 'index.html.html' || excludedNamePattern.test(relativePath)) return [];
    return [relativePath];
  });
}

const htmlPages = listHtmlPages(projectRoot);

if (!htmlPages.includes('index.html')) {
  throw new Error('Vite HTML entry discovery requires the root index.html homepage.');
}

const htmlInputs = Object.fromEntries(
  htmlPages.map((name) => [name.slice(0, -'.html'.length), resolve(projectRoot, name)]),
);

export default defineConfig({
  base: '/',
  build: {
    rollupOptions: {
      input: htmlInputs,
    },
  },
});
