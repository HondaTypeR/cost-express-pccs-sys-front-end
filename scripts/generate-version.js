const { execSync } = require('node:child_process');
const { writeFileSync } = require('node:fs');
const { join } = require('node:path');

const rootDir = join(__dirname, '..');

let gitHash = 'unknown';
try {
  gitHash = execSync('git rev-parse --short HEAD', {
    cwd: rootDir,
    stdio: ['ignore', 'pipe', 'ignore'],
  })
    .toString()
    .trim();
} catch {
  // git unavailable in some CI environments
}

const version = `${Date.now()}-${gitHash}`;
const payload = {
  version,
  buildTime: new Date().toISOString(),
};

writeFileSync(join(rootDir, 'public/version.json'), JSON.stringify(payload, null, 2));
writeFileSync(join(rootDir, '.build-version'), version);

console.log(`[generate-version] ${version}`);
