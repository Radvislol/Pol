// Builds dist/seimas.html: compiles src/SeimasGame.jsx with esbuild (React & Lucide come from
// CDN globals), compiles Tailwind for the classes it uses, and inlines both into the template.
import * as esbuild from 'esbuild';
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const GLOBALS = { react: 'React', 'react-dom': 'ReactDOM', 'react-dom/client': 'ReactDOM', 'lucide-react': 'LucideReact' };
const globalsPlugin = {
  name: 'cdn-globals',
  setup(b) {
    b.onResolve({ filter: /^(react|react-dom|react-dom\/client|lucide-react)$/ }, (a) => ({ path: a.path, namespace: 'cdn-global' }));
    b.onLoad({ filter: /.*/, namespace: 'cdn-global' }, (a) => ({ contents: `module.exports = window.${GLOBALS[a.path]};`, loader: 'js' }));
  },
};

const js = await esbuild.build({
  entryPoints: [join(here, 'entry.jsx')],
  bundle: true, format: 'iife', minify: true, target: ['es2019'], write: false,
  jsx: 'transform', legalComments: 'none', plugins: [globalsPlugin],
});
const app = js.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');

mkdirSync(join(root, '.tmp'), { recursive: true });
const cssOut = join(root, '.tmp', 'tw.css');
execFileSync(join(root, 'node_modules', '.bin', 'tailwindcss'), ['-c', join(here, 'tailwind.config.cjs'), '-i', join(here, 'tailwind.css'), '-o', cssOut, '--minify'], { stdio: 'inherit' });
const css = readFileSync(cssOut, 'utf8');

const html = readFileSync(join(here, 'template.html'), 'utf8')
  .replace('/*__TAILWIND__*/', () => css)
  .replace('/*__APP__*/', () => app);
mkdirSync(join(root, 'dist'), { recursive: true });
writeFileSync(join(root, 'dist', 'seimas.html'), html);
console.log(`dist/seimas.html  ${(html.length / 1024).toFixed(1)} KB (app ${(app.length / 1024).toFixed(1)} KB, css ${(css.length / 1024).toFixed(1)} KB)`);
