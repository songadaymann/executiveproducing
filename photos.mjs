// The site's photos are kept out of this repo (see ASSETS.md). The shared copy lives in a
// private Cloudflare R2 bucket, laid out like private-assets/, so the automatic build can
// fetch what it needs.
//   npm run photos:push   uploads everything in private-assets/ to the bucket
//   npm run photos:pull   builds the site, downloading any photo it uses that isn't here yet
// Both go through Wrangler, so they need a Cloudflare login that can reach the bucket.
import { exec } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, readdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';

const root = import.meta.dirname;
const bucket = 'executiveproducing-photos';
const run = promisify(exec);

// Names go into a shell command, so only plain relative paths are allowed.
const isPlainPath = (file) => /^[a-z0-9][a-z0-9._/-]*$/i.test(file) && !file.includes('..');

// Runs `wrangler r2 object <command>` against the real bucket. Paths are relative to the repo.
const wrangler = (command) => run(`npx -y wrangler r2 object ${command} --remote`, { cwd: root });

// The line of Wrangler's output that says what went wrong, without its colour codes.
const reason = (error) => {
  const lines = `${error.stderr ?? ''}\n${error.stdout ?? ''}`.replace(/\x1b\[[0-9;]*m/g, '').split('\n');
  return lines.find((line) => line.includes('[ERROR]'))?.replace(/^.*\[ERROR\]\s*/, '').trim() || 'Wrangler failed';
};

// Downloads one photo into private-assets/. Returns whether it arrived.
export async function pullPhoto(file) {
  if (!isPlainPath(file)) return false;
  const target = path.join(root, 'private-assets', file);
  await mkdir(path.dirname(target), { recursive: true });
  try {
    await wrangler(`get ${bucket}/${file} --file private-assets/${file}`);
  } catch (error) {
    await rm(target, { force: true });
    console.warn(`Couldn't download ${file} from the photo bucket: ${reason(error)}`);
    return false;
  }
  return existsSync(target);
}

async function push() {
  const folder = path.join(root, 'private-assets');
  if (!existsSync(folder)) {
    console.error('There is no private-assets/ folder here, so there is nothing to upload.');
    process.exit(1);
  }
  const entries = await readdir(folder, { recursive: true, withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile() && !entry.name.startsWith('.'))
    .map((entry) => path.relative(folder, path.join(entry.parentPath ?? entry.path, entry.name)).split(path.sep).join('/'))
    .sort();

  const failed = [];
  for (const file of files) {
    if (!isPlainPath(file)) {
      console.warn(`Skipped ${file}: use only letters, numbers, dots, dashes and underscores in photo names.`);
      failed.push(file);
      continue;
    }
    try {
      await wrangler(`put ${bucket}/${file} --file private-assets/${file}`);
      console.log(`Uploaded ${file}`);
    } catch (error) {
      console.error(`Couldn't upload ${file}: ${reason(error)}`);
      failed.push(file);
    }
  }
  console.log(`${files.length - failed.length} of ${files.length} photos are now in the bucket.`);
  if (failed.length) process.exit(1);
}

if (process.argv[1] === import.meta.filename) {
  if (process.argv[2] !== 'push') {
    console.error('Usage: node photos.mjs push   (to download, run npm run photos:pull)');
    process.exit(1);
  }
  await push();
}
