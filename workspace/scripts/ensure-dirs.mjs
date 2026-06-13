import fs from 'node:fs';

export function ensureDir(pathname) {
  if (fs.existsSync(pathname)) {
    const stat = fs.statSync(pathname);
    if (!stat.isDirectory()) {
      throw new Error(`${pathname} exists but is not a directory`);
    }
    return;
  }

  fs.mkdirSync(pathname, {recursive: true});
}

ensureDir('/media/input');
ensureDir('/media/output');
