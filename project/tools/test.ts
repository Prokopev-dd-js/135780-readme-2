import { readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const PROJECTS = [
  { directory: 'libs/shared-api', config: 'tsconfig.lib.json' },
  ...['account', 'publication', 'file', 'notification', 'gateway'].map(
    (name) => ({ directory: `apps/${name}`, config: 'tsconfig.app.json' }),
  ),
];
let failed = false;
for (const project of PROJECTS) {
  const source = resolve(project.directory, 'src');
  const tests = readdirSync(source, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.spec.ts'))
    .map((entry) => join(entry.parentPath, entry.name));
  if (tests.length === 0) {
    continue;
  }
  const result = spawnSync(
    process.execPath,
    [
      'node_modules/tsx/dist/cli.mjs',
      '--tsconfig',
      join(project.directory, project.config),
      '--test',
      ...tests,
    ],
    { stdio: 'inherit' },
  );
  failed = failed || result.status !== 0;
}
process.exitCode = failed ? 1 : 0;
