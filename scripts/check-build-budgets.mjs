import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join, relative } from 'node:path';

const outputDirectory = join(process.cwd(), 'dist');
const kibibyte = 1024;
const mebibyte = 1024 * kibibyte;
const maximumAssetBytes = 25 * mebibyte;
const maximumCssBytes = 100 * kibibyte;
const routeBudgets = [
  { route: '/', file: 'index.html', maximumJavaScriptBytes: 20 * kibibyte, mustExcludeAi: true },
  { route: '/en/', file: 'en/index.html', maximumJavaScriptBytes: 20 * kibibyte, mustExcludeAi: true },
  { route: '/comprimir/', file: 'comprimir/index.html', maximumJavaScriptBytes: 400 * kibibyte, mustExcludeAi: true },
  { route: '/en/compress/', file: 'en/compress/index.html', maximumJavaScriptBytes: 400 * kibibyte, mustExcludeAi: true },
  { route: '/convertir/', file: 'convertir/index.html', maximumJavaScriptBytes: 400 * kibibyte, mustExcludeAi: true },
  { route: '/en/convert/', file: 'en/convert/index.html', maximumJavaScriptBytes: 400 * kibibyte, mustExcludeAi: true },
  { route: '/quitar-fondo/', file: 'quitar-fondo/index.html', maximumJavaScriptBytes: 400 * kibibyte, mustExcludeAi: false },
  { route: '/en/remove-background/', file: 'en/remove-background/index.html', maximumJavaScriptBytes: 400 * kibibyte, mustExcludeAi: false },
];

function listFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? listFiles(path) : [path];
  });
}

function extractBuildReferences(html) {
  return [...new Set(html.match(/\/_astro\/[A-Za-z0-9_.-]+/g) ?? [])];
}

if (!existsSync(outputDirectory)) {
  throw new Error('dist/ does not exist. Run pnpm build before checking budgets.');
}

const failures = [];
const report = [];

for (const page of routeBudgets) {
  const htmlPath = join(outputDirectory, page.file);
  const html = readFileSync(htmlPath, 'utf8');
  const references = extractBuildReferences(html);
  let javascriptBytes = 0;
  let cssBytes = 0;

  for (const reference of references) {
    const assetPath = join(outputDirectory, reference.slice(1));
    const size = statSync(assetPath).size;
    if (extname(assetPath) === '.js') javascriptBytes += size;
    if (extname(assetPath) === '.css') cssBytes += size;
  }

  if (javascriptBytes > page.maximumJavaScriptBytes) {
    failures.push(`${page.route} references ${(javascriptBytes / kibibyte).toFixed(1)} KiB of initial JavaScript; budget is ${(page.maximumJavaScriptBytes / kibibyte).toFixed(0)} KiB.`);
  }
  if (cssBytes > maximumCssBytes) {
    failures.push(`${page.route} references ${(cssBytes / kibibyte).toFixed(1)} KiB of initial CSS; budget is ${maximumCssBytes / kibibyte} KiB.`);
  }

  if (page.mustExcludeAi) {
    const initialJavaScript = references
      .filter((reference) => reference.endsWith('.js'))
      .map((reference) => readFileSync(join(outputDirectory, reference.slice(1)), 'utf8'))
      .join('\n');
    if (/background-removal\.worker|ort-wasm|vendor\/background-removal|resources\.json/.test(initialJavaScript)) {
      failures.push(`${page.route} includes background-removal resources in its initial JavaScript.`);
    }
  }

  report.push({
    route: page.route,
    javascriptKiB: (javascriptBytes / kibibyte).toFixed(1),
    cssKiB: (cssBytes / kibibyte).toFixed(1),
  });
}

for (const file of listFiles(outputDirectory)) {
  const size = statSync(file).size;
  if (size > maximumAssetBytes) {
    failures.push(`${relative(outputDirectory, file)} is ${(size / mebibyte).toFixed(2)} MiB; Cloudflare asset budget is 25 MiB.`);
  }
}

console.table(report);

if (failures.length) {
  console.error('\nBuild budget failures:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log('\nBuild budgets passed.');
}
