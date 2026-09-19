import { createHash } from 'node:crypto';
import { createReadStream, createWriteStream } from 'node:fs';
import { cp, mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { pipeline } from 'node:stream/promises';
import { spawn } from 'node:child_process';

const VERSION = '1.7.0';
const ARCHIVE_SHA256 = 'a44fdaf4f3b06a952dcd9a61720bac1e6bc41392aa474e68863a2e54ca2d0df5';
const ARCHIVE_URL = `https://staticimgly.com/@imgly/background-removal-data/${VERSION}/package.tgz`;
const PROJECT_ROOT = resolve(import.meta.dirname, '..');
const CACHE_ROOT = resolve(PROJECT_ROOT, '.cache', 'background-removal');
const ARCHIVE_PATH = resolve(CACHE_ROOT, `background-removal-data-${VERSION}.tgz`);
const PUBLIC_ROOT = resolve(PROJECT_ROOT, 'public', 'vendor', 'background-removal', VERSION);
const DIST_ROOT = resolve(PUBLIC_ROOT, 'dist');
const MARKER_PATH = resolve(PUBLIC_ROOT, 'asset-manifest.json');

function assertInside(parent, child) {
  const pathFromParent = relative(parent, child);
  if (pathFromParent.startsWith(`..${sep}`) || pathFromParent === '..' || resolve(child) === resolve(parent)) {
    throw new Error(`Unsafe generated asset path: ${child}`);
  }
}

async function sha256(filePath) {
  const hash = createHash('sha256');
  await pipeline(createReadStream(filePath), hash);
  return hash.digest('hex');
}

async function fileExists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') return false;
    throw error;
  }
}

async function downloadArchive() {
  await mkdir(dirname(ARCHIVE_PATH), { recursive: true });

  if (await fileExists(ARCHIVE_PATH)) {
    if (await sha256(ARCHIVE_PATH) === ARCHIVE_SHA256) return;
    await rm(ARCHIVE_PATH, { force: true });
  }

  const partialPath = `${ARCHIVE_PATH}.partial`;
  const response = await fetch(ARCHIVE_URL, { redirect: 'follow' });
  if (!response.ok || !response.body) {
    throw new Error(`Unable to download IMG.LY assets: HTTP ${response.status}`);
  }

  await pipeline(response.body, createWriteStream(partialPath));
  const actualHash = await sha256(partialPath);
  if (actualHash !== ARCHIVE_SHA256) {
    await rm(partialPath, { force: true });
    throw new Error(`IMG.LY asset checksum mismatch: expected ${ARCHIVE_SHA256}, received ${actualHash}`);
  }

  await rm(ARCHIVE_PATH, { force: true });
  await cp(partialPath, ARCHIVE_PATH);
  await rm(partialPath, { force: true });
}

async function runTar(destination) {
  await new Promise((resolvePromise, rejectPromise) => {
    const child = spawn('tar', ['-xzf', ARCHIVE_PATH, '-C', destination], {
      stdio: 'inherit',
      shell: false,
    });
    child.once('error', rejectPromise);
    child.once('exit', (code) => {
      if (code === 0) resolvePromise();
      else rejectPromise(new Error(`tar exited with code ${code ?? 'unknown'}`));
    });
  });
}

async function verifyGeneratedAssets() {
  const resourcesPath = resolve(DIST_ROOT, 'resources.json');
  if (!(await fileExists(resourcesPath))) return null;

  const resources = JSON.parse(await readFile(resourcesPath, 'utf8'));
  const chunkSizes = new Map();

  for (const resource of Object.values(resources)) {
    for (const chunk of resource.chunks) {
      const expectedSize = chunk.offsets[1] - chunk.offsets[0];
      const previousSize = chunkSizes.get(chunk.name);
      if (previousSize !== undefined && previousSize !== expectedSize) {
        throw new Error(`Conflicting sizes for asset chunk ${chunk.name}`);
      }
      chunkSizes.set(chunk.name, expectedSize);
    }
  }

  let totalBytes = 0;
  for (const [name, expectedSize] of chunkSizes) {
    const chunkPath = resolve(DIST_ROOT, name);
    assertInside(DIST_ROOT, chunkPath);
    const chunkStat = await stat(chunkPath);
    if (chunkStat.size !== expectedSize) {
      throw new Error(`Invalid size for asset chunk ${name}: expected ${expectedSize}, received ${chunkStat.size}`);
    }
    if (chunkStat.size > 25 * 1024 * 1024) {
      throw new Error(`Asset chunk ${name} exceeds the Cloudflare Pages 25 MiB limit`);
    }
    totalBytes += chunkStat.size;
  }

  return {
    package: '@imgly/background-removal-data',
    version: VERSION,
    source: ARCHIVE_URL,
    archiveSha256: ARCHIVE_SHA256,
    resourceCount: Object.keys(resources).length,
    chunkCount: chunkSizes.size,
    totalBytes,
  };
}

async function isPrepared() {
  if (!(await fileExists(MARKER_PATH))) return false;
  const marker = JSON.parse(await readFile(MARKER_PATH, 'utf8'));
  return marker.version === VERSION && marker.archiveSha256 === ARCHIVE_SHA256 && (await verifyGeneratedAssets()) !== null;
}

async function prepareAssets() {
  assertInside(resolve(PROJECT_ROOT, 'public'), PUBLIC_ROOT);
  if (await isPrepared()) {
    console.log(`Background-removal assets ${VERSION} already verified.`);
    return;
  }

  await downloadArchive();
  const extractionRoot = await mkdir(join(tmpdir(), `pixel-crunch-imgly-${process.pid}-${Date.now()}`), { recursive: true });

  try {
    await runTar(extractionRoot);
    const packageRoot = resolve(extractionRoot, 'package');
    const sourceDist = resolve(packageRoot, 'dist');

    await rm(PUBLIC_ROOT, { recursive: true, force: true });
    await mkdir(PUBLIC_ROOT, { recursive: true });
    await cp(sourceDist, DIST_ROOT, { recursive: true });
    await cp(resolve(packageRoot, 'LICENSE.md'), resolve(PUBLIC_ROOT, 'LICENSE.md'));
    await cp(resolve(packageRoot, 'ThirdPartyLicenses.json'), resolve(PUBLIC_ROOT, 'ThirdPartyLicenses.json'));

    const manifest = await verifyGeneratedAssets();
    if (!manifest) throw new Error('Generated IMG.LY assets could not be verified');
    await writeFile(MARKER_PATH, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
    console.log(`Prepared ${manifest.chunkCount} background-removal chunks (${manifest.totalBytes} bytes).`);
  } finally {
    await rm(extractionRoot, { recursive: true, force: true });
  }
}

await prepareAssets();
