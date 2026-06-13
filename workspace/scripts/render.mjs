import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {bundle} from '@remotion/bundler';
import {getCompositions, renderMedia} from '@remotion/renderer';
import {ensureDir} from './ensure-dirs.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(__dirname, '..');

export function parseArgs(argv) {
  const args = {
    output: '/media/output/final.mp4',
    compositionId: 'MainVideo',
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--output') {
      args.output = argv[index + 1];
      index += 1;
      continue;
    }
    if (arg === '--composition') {
      args.compositionId = argv[index + 1];
      index += 1;
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  if (!args.output) {
    throw new Error('--output requires a file path');
  }
  if (!args.compositionId) {
    throw new Error('--composition requires an id');
  }

  return args;
}

export function ensureParentDir(filePath) {
  ensureDir(path.dirname(filePath));
}

export async function bundleProject() {
  const entryPoint = path.join(workspaceRoot, 'src', 'Root.tsx');
  console.log(`Bundling ${entryPoint}`);
  return bundle({
    entryPoint,
    webpackOverride: (config) => config,
  });
}

export async function selectComposition(bundleLocation, compositionId) {
  const compositions = await getCompositions(bundleLocation);
  const composition = compositions.find((item) => item.id === compositionId);

  if (!composition) {
    const available = compositions.map((item) => item.id).join(', ') || '(none)';
    throw new Error(`Composition "${compositionId}" not found. Available: ${available}`);
  }

  return composition;
}

export async function renderComposition(options) {
  const {bundleLocation, composition, output} = options;
  console.log(`Rendering ${composition.id} to ${output}`);

  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: 'h264',
    imageFormat: 'jpeg',
    outputLocation: output,
    onProgress: ({progress}) => {
      const percent = Math.round(progress * 100);
      process.stdout.write(`\rProgress: ${percent}%`);
    },
  });

  process.stdout.write('\n');
  console.log(`Done: ${output}`);
}

export async function main() {
  try {
    const args = parseArgs(process.argv.slice(2));
    ensureParentDir(args.output);
    const bundleLocation = await bundleProject();
    const composition = await selectComposition(bundleLocation, args.compositionId);
    await renderComposition({
      bundleLocation,
      composition,
      output: args.output,
    });
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}

await main();
