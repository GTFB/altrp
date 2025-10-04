// CMS bootstrap script
// - creates apps/cms/.env from apps/cms/example.env with generated NEXTAUTH_SECRET
// - if --sqlite-path is passed: updates CMS_SQLITE_PATH in .env, runs migrations, and flips CMS_PROVIDER to 'sqlite' in settings.ts
// - builds the Next.js app for CMS

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

function parseArgs(argv) {
  const args = {};
  for (const a of argv.slice(2)) {
    const m = a.match(/^--([^=]+)=(.*)$/);
    if (m) {
      args[m[1]] = m[2];
    } else if (a.startsWith('--')) {
      args[a.replace(/^--/, '')] = true;
    }
  }
  return args;
}

function generateSecret(bytes = 48) {
  return crypto.randomBytes(bytes).toString('hex');
}

function loadEnvTemplate(templatePath) {
  const raw = fs.readFileSync(templatePath, 'utf8');
  const lines = raw.split(/\r?\n/);
  const obj = {};
  for (const line of lines) {
    if (!line || line.trim().startsWith('#')) continue;
    const idx = line.indexOf('=');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const val = line.slice(idx + 1);
    obj[key] = val;
  }
  return obj;
}

function saveEnv(envPath, envObj) {
  const content = Object.entries(envObj)
    .map(([k, v]) => `${k}=${v}`)
    .join('\n') + '\n';
  fs.writeFileSync(envPath, content, 'utf8');
}

function ensureEnv(args) {
  const cmsDir = path.resolve(__dirname, '..', 'apps', 'cms');
  const templatePath = path.join(cmsDir, 'example.env');
  const targetPath = path.join(cmsDir, '.env');
  const envObj = loadEnvTemplate(templatePath);

  // set NEXTAUTH_SECRET
  envObj.NEXTAUTH_SECRET = generateSecret(48);

  // override sqlite path if provided
  const sqlitePathArg = args['sqlite-path'] || args['sqlitePath'];
  if (sqlitePathArg) {
    envObj.CMS_SQLITE_PATH = sqlitePathArg;
  }

  saveEnv(targetPath, envObj);
  console.log(`[cms-up] .env written at ${targetPath}`);

  return { cmsDir, sqlitePath: sqlitePathArg };
}

function flipCmsProviderToSqlite(projectRoot) {
  const settingsPath = path.join(projectRoot, 'settings.ts');
  let src = fs.readFileSync(settingsPath, 'utf8');
  const before = src;
  // Replace the assignment to 'sqlite'
  src = src.replace(/export const CMS_PROVIDER: ['\"]mdx['\"] \|\s*['\"]sqlite['\"]\s*=\s*['\"]mdx['\"]/g, "export const CMS_PROVIDER: 'mdx' |  'sqlite' = 'sqlite'");
  if (src !== before) {
    fs.writeFileSync(settingsPath, src, 'utf8');
    console.log('[cms-up] settings.ts CMS_PROVIDER set to sqlite');
  } else {
    console.log('[cms-up] settings.ts CMS_PROVIDER already set or pattern not found');
  }
}

function run(cmd, opts = {}) {
  console.log(`[cms-up] $ ${cmd}`);
  execSync(cmd, { stdio: 'inherit', ...opts });
}

function main() {
  const projectRoot = path.resolve(__dirname, '..');
  const args = parseArgs(process.argv);

  const { sqlitePath } = ensureEnv(args);

  if (sqlitePath) {
    flipCmsProviderToSqlite(projectRoot);
    // run migrations
    run('bun run db:generate', { cwd: projectRoot });
    run('bun run db:migrate', { cwd: projectRoot });
  }

  // build CMS
  run('bun run --filter=altrp-cms build', { cwd: projectRoot });
}

try {
  main();
} catch (e) {
  console.error('[cms-up] failed:', e?.message || e);
  process.exit(1);
}


