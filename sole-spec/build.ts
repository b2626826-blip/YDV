/**
 * 把 src/ 打包成單一檔案的 HTML。
 *
 * 產出兩份,內容相同、外殼不同:
 *   dist/artifact.html  只有頁面本體(無 doctype / html / head / body)
 *                       —— Claude Artifact 發佈時外殼由平台補上。
 *   dist/index.html     完整文件,可直接用瀏覽器開啟。
 *
 * CSS 與 JS 一律內嵌:Artifact 的 CSP 只放行 Google Fonts 的外部樣式表。
 */
import { build } from 'esbuild';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const src = join(root, 'src');
const dist = join(root, 'dist');

async function bundleScript(): Promise<string> {
  const result = await build({
    entryPoints: [join(src, 'main.ts')],
    bundle: true,
    minify: true,
    format: 'iife',
    target: 'es2020',
    write: false,
    legalComments: 'none',
  });
  const file = result.outputFiles[0];
  if (!file) throw new Error('esbuild 沒有產出 JS');
  return file.text.trim();
}

async function bundleStyles(): Promise<string> {
  const result = await build({
    entryPoints: [join(src, 'styles.css')],
    bundle: true,
    minify: true,
    write: false,
  });
  const file = result.outputFiles[0];
  if (!file) throw new Error('esbuild 沒有產出 CSS');
  return file.text.trim();
}

/** 用函式形式的 replacer,避免替換內容裡的 $& 被當成樣式引用。 */
function fill(template: string, token: string, payload: string): string {
  const marker = `/*{{${token}}}*/`;
  if (!template.includes(marker)) throw new Error(`樣板缺少佔位符 ${marker}`);
  return template.replace(marker, () => payload);
}

function wrapDocument(body: string): string {
  return [
    '<!doctype html>',
    '<html lang="zh-Hant">',
    '<head>',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">',
    '</head>',
    '<body>',
    body,
    '</body>',
    '</html>',
    '',
  ].join('\n');
}

async function main(): Promise<void> {
  const [template, script, styles] = await Promise.all([
    readFile(join(src, 'index.template.html'), 'utf8'),
    bundleScript(),
    bundleStyles(),
  ]);

  const page = fill(fill(template, 'styles', styles), 'script', script);

  await mkdir(dist, { recursive: true });
  await Promise.all([
    writeFile(join(dist, 'artifact.html'), page, 'utf8'),
    writeFile(join(dist, 'index.html'), wrapDocument(page), 'utf8'),
  ]);

  const kb = (page.length / 1024).toFixed(1);
  console.log(`dist/artifact.html  ${kb} KB`);
  console.log(`dist/index.html     ${(wrapDocument(page).length / 1024).toFixed(1)} KB`);
}

await main();
