import { Command } from 'commander';
import chalk from 'chalk';
import { runAgent } from './agent.js';
import { parseNaturalInput } from './parser.js';
import fs from 'fs';
import path from 'path';

const program = new Command();

program
  .name('clips')
  .description('AI-powered YouTube clip downloader agent')
  .version('1.0.0');

program
  .command('run')
  .description('Download clips from a YouTube URL using a JSON or natural-language job file')
  .argument('<jobFile>', 'Path to job file (.json or .txt)')
  .option('-o, --output <dir>', 'Output directory', './output')
  .option('-q, --quality <height>', 'Max video height (e.g. 720)', '720')
  .action(async (jobFile, options) => {
    try {
      const absPath = path.resolve(jobFile);
      if (!fs.existsSync(absPath)) {
        console.error(chalk.red(`Job file not found: ${absPath}`));
        process.exit(1);
      }

      const raw = fs.readFileSync(absPath, 'utf8');
      let job;

      if (absPath.endsWith('.json')) {
        job = JSON.parse(raw);
      } else {
        // Natural language / the format you originally gave me
        job = parseNaturalInput(raw);
      }

      if (!job.url) {
        console.error(chalk.red('No YouTube URL found in the job file.'));
        process.exit(1);
      }

      await runAgent(job, options);
    } catch (err) {
      console.error(chalk.red('Error:'), err.message);
      process.exit(1);
    }
  });

program
  .command('quick')
  .description('Quick one-off clip: clips quick <url> <start> <end> [name]')
  .argument('<url>', 'YouTube URL')
  .argument('<start>', 'Start time (e.g. 2:35 or 00:02:35)')
  .argument('<end>', 'End time')
  .argument('[name]', 'Output filename (without extension)', 'clip')
  .option('-o, --output <dir>', 'Output directory', './output')
  .option('-q, --quality <height>', 'Max video height', '720')
  .action(async (url, start, end, name, options) => {
    const job = {
      url,
      clips: [{ name, start, end }]
    };
    await runAgent(job, options);
  });

export { program };
