import fs from 'node:fs';
import path from 'node:path';
import {ensureDir} from './ensure-dirs.mjs';

const MAX_DEPTH = 2;

export function formatBytes(bytes) {
  if (bytes === 0) {
    return '0 B';
  }

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** index;
  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}

export function listFiles(root) {
  ensureDir(root);
  const files = [];

  function walk(current, depth) {
    if (depth > MAX_DEPTH) {
      return;
    }

    const entries = fs.readdirSync(current, {withFileTypes: true});
    for (const entry of entries) {
      const entryPath = path.join(current, entry.name);
      const stat = fs.statSync(entryPath);
      if (entry.isDirectory()) {
        walk(entryPath, depth + 1);
        continue;
      }

      files.push({
        path: entryPath,
        size: stat.size,
        mtimeMs: stat.mtimeMs,
      });
    }
  }

  walk(root, 0);
  return files.sort((a, b) => a.path.localeCompare(b.path));
}

export function printSection(title, root) {
  const files = listFiles(root);
  console.log(`\n${title}`);
  console.log(root);

  if (files.length === 0) {
    console.log('  (empty)');
    return;
  }

  for (const file of files) {
    const relative = path.relative(root, file.path);
    const modified = new Date(file.mtimeMs).toISOString();
    console.log(`  ${relative}  ${formatBytes(file.size)}  ${modified}`);
  }
}

printSection('Input media', '/media/input');
printSection('Output media', '/media/output');
