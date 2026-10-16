import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Main agent: takes a job { url, clips[] } and downloads each section.
 */
export async function runAgent(job, options = {}) {
  const outputDir = path.resolve(options.output || './output');
  const quality = options.quality || '720';

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log(chalk.bold.cyan('\n🎬  Clips Agent'));
  console.log(chalk.gray(`URL: ${job.url}`));
  console.log(chalk.gray(`Clips: ${job.clips.length}`));
  console.log(chalk.gray(`Output: ${outputDir}\n`));

  // Check yt-dlp is available
  const ytDlp = await findYtDlp();
  if (!ytDlp) {
    console.error(chalk.red('❌ yt-dlp not found.'));
    console.log(chalk.yellow('\nInstall it first:'));
    console.log('  • Windows: download yt-dlp.exe from https://github.com/yt-dlp/yt-dlp/releases');
    console.log('  • macOS:   brew install yt-dlp');
    console.log('  • Linux:   pip install -U yt-dlp  or  sudo apt install yt-dlp');
    process.exit(1);
  }

  const results = [];

  for (const [i, clip] of job.clips.entries()) {
    const spinner = ora(`Downloading ${i + 1}/${job.clips.length}: ${clip.name}`).start();

    const safeName = sanitize(clip.name);
    const outTemplate = path.join(outputDir, `${safeName}.%(ext)s`);

    // Convert times to the format yt-dlp --download-sections expects
    const start = normalizeTime(clip.start);
    const end = normalizeTime(clip.end);
    const section = `*${start}-${end}`;

    try {
      await runYtDlp(ytDlp, [
        '-f', `best[height<=${quality}]/best`,
        '--download-sections', section,
        '--force-keyframes-at-cuts',
        '-o', outTemplate,
        '--no-warnings',
        job.url
      ]);

      // Find the actual file that was created
      const files = fs.readdirSync(outputDir)
        .filter(f => f.startsWith(safeName + '.'))
        .map(f => path.join(outputDir, f));

      if (files.length) {
        spinner.succeed(chalk.green(`${clip.name} → ${path.basename(files[0])}`));
        results.push({ name: clip.name, file: files[0], ok: true });
      } else {
        spinner.warn(chalk.yellow(`${clip.name} – downloaded but file not found`));
        results.push({ name: clip.name, ok: false });
      }
    } catch (err) {
      spinner.fail(chalk.red(`${clip.name} – ${err.message}`));
      results.push({ name: clip.name, ok: false, error: err.message });
    }
  }

  // Summary
  console.log('\n' + chalk.bold('Summary'));
  const ok = results.filter(r => r.ok).length;
  console.log(chalk.green(`✓ ${ok} succeeded`));
  if (ok < results.length) {
    console.log(chalk.red(`✗ ${results.length - ok} failed`));
  }
  console.log(chalk.gray(`\nFiles saved in: ${outputDir}\n`));
}

function sanitize(name) {
  return name.replace(/[<>:"/\\|?*\x00-\x1F]/g, '').replace(/\s+/g, '_').slice(0, 80);
}

/** Turn "2:35" or "00:02:35" into a consistent form yt-dlp likes */
function normalizeTime(t) {
  const parts = t.split(':').map(Number);
  if (parts.length === 2) {
    // mm:ss → assume it's minutes:seconds from start
    return `${parts[0]}:${String(parts[1]).padStart(2, '0')}`;
  }
  if (parts.length === 3) {
    return `${parts[0]}:${String(parts[1]).padStart(2, '0')}:${String(parts[2]).padStart(2, '0')}`;
  }
  return t;
}

function runYtDlp(bin, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(bin, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stderr = '';

    child.stderr.on('data', d => { stderr += d.toString(); });
    child.on('close', code => {
      if (code === 0) resolve();
      else reject(new Error(stderr.trim().split('\n').pop() || `yt-dlp exited ${code}`));
    });
    child.on('error', reject);
  });
}

async function findYtDlp() {
  const candidates = [
    'yt-dlp',
    'yt-dlp.exe',
    path.join(process.cwd(), 'yt-dlp.exe'),
    path.join(process.cwd(), 'yt-dlp'),
    '/usr/local/bin/yt-dlp',
    '/usr/bin/yt-dlp'
  ];

  for (const c of candidates) {
    try {
      await new Promise((res, rej) => {
        const p = spawn(c, ['--version'], { stdio: 'ignore' });
        p.on('close', code => (code === 0 ? res() : rej()));
        p.on('error', rej);
      });
      return c;
    } catch {
      // try next
    }
  }
  return null;
}
