const { execSync, spawnSync } = require('node:child_process');
const os = require('node:os');

const CODEX_CLOUD_URL = 'https://chatgpt.com/codex/cloud';

function run(command) {
  return execSync(command, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

function runMaybe(command) {
  try { return run(command); } catch { return null; }
}

function gitInfo(cwd) {
  const root = runMaybe(`git -C "${cwd}" rev-parse --show-toplevel`);
  if (!root) return null;

  const branch = runMaybe(`git -C "${root}" branch --show-current`) || '(detached HEAD)';
  const remote = runMaybe(`git -C "${root}" remote get-url origin`);
  const dirty = !!runMaybe(`git -C "${root}" status --porcelain`);

  return { root, branch, remote, parsed: parseRemoteUrl(remote), dirty };
}

function parseRemoteUrl(url) {
  if (!url) return null;
  const ssh = url.match(/^git@github\.com:(.+?)\/(.+?)(\.git)?$/);
  if (ssh) return { owner: ssh[1], repo: ssh[2].replace(/\.git$/, '') };

  const https = url.match(/^https?:\/\/github\.com\/(.+?)\/(.+?)(\.git)?$/);
  if (https) return { owner: https[1], repo: https[2].replace(/\.git$/, '') };

  return null;
}

function openUrl(url) {
  const platform = os.platform();
  if (platform === 'win32') {
    const result = spawnSync('cmd.exe', ['/c', 'start', '', url], { stdio: 'ignore', windowsVerbatimArguments: true });
    if (result.status !== 0) throw new Error(`Unable to open browser. Open manually: ${url}`);
    return;
  }
  const cmd = platform === 'darwin' ? 'open' : 'xdg-open';
  const result = spawnSync(cmd, [url], { stdio: 'ignore' });
  if (result.status !== 0) throw new Error(`Unable to open browser. Open manually: ${url}`);
}

function handoffSteps(cwd) {
  const info = gitInfo(cwd);
  if (!info) {
    return [
      'No git repository detected in current folder.',
      'Tips:',
      '1) cd into your project folder (contains .git)',
      '2) run codex-web connect again',
      `3) you can still open cloud now: ${CODEX_CLOUD_URL}`
    ].join('\n');
  }
  if (!info.parsed) throw new Error('Origin remote must be a GitHub URL for connect flow.');
  const repoUrl = `https://github.com/${info.parsed.owner}/${info.parsed.repo}`;
  return [
    'Codex Cloud handoff context',
    `repo: ${repoUrl}`,
    `branch: ${info.branch}`,
    `dirty: ${info.dirty ? 'yes' : 'no'}`,
    '',
    `1) git push -u origin ${info.branch}`,
    `2) open ${CODEX_CLOUD_URL}`,
    '3) In Codex Cloud, select the same repo + branch'
  ].join('\n');
}


function commandAuto(cwd) {
  const info = gitInfo(cwd);
  if (!info) {
    openUrl(CODEX_CLOUD_URL);
    return [
      'No git repository detected. Opened Codex Cloud only.',
      'Tip: run this command inside your project folder for full automation.'
    ].join('\n');
  }

  if (info.remote) {
    const push = spawnSync('git', ['-C', info.root, 'push', '-u', 'origin', info.branch], { stdio: 'inherit' });
    if (push.status !== 0) throw new Error('git push failed during auto mode');
  }

  openUrl(CODEX_CLOUD_URL);

  const lines = [
    'Auto mode completed:',
    `- Opened: ${CODEX_CLOUD_URL}`,
    `- Repo: ${info.root}`,
    `- Branch: ${info.branch}`,
    `- Origin: ${info.remote || '(none)'}`
  ];

  if (info.parsed) {
    const prUrl = `https://github.com/${info.parsed.owner}/${info.parsed.repo}/compare/${info.branch}?expand=1`;
    openUrl(prUrl);
    lines.push(`- Opened PR compare: ${prUrl}`);
  }

  lines.push('- Next: In Codex Cloud, choose the same repo/branch.');
  return lines.join('\n');
}

function printHelp() {
  return [
    'codex-web <command> [options]',
    '',
    'Commands:',
    '  auto                  One-command automation (push + open cloud + open PR)',
    '  open                  Open Codex Cloud website',
    '  cloud                 Alias of open',
    '  connect [--open]      Print repo handoff steps; optionally open website',
    '  status                Show current git status + cloud link',
    '  repo                  Show repo root/branch/origin',
    '  pr                    Open GitHub compare page for current branch',
    '  handoff               Push current branch to origin',
    '  help                  Show this message',
    '',
    'Note: Codex Cloud does not currently provide a public terminal API endpoint.'
  ].join('\n');
}

function runCli(argv, cwd = process.cwd()) {
  const command = argv[2] || 'help';
  const args = argv.slice(3);

  if (command === 'help' || command === '--help' || command === '-h') return printHelp();
  if (command === 'auto') return commandAuto(cwd);
  if (command === 'open' || command === 'cloud') {
    openUrl(CODEX_CLOUD_URL);
    return `Opened ${CODEX_CLOUD_URL}`;
  }
  if (command === 'connect') {
    const message = handoffSteps(cwd);
    if (args.includes('--open')) openUrl(CODEX_CLOUD_URL);
    return message;
  }
  if (command === 'status') {
    const i = gitInfo(cwd);
    if (!i) return `No git repository detected.\ncloud: ${CODEX_CLOUD_URL}`;
    return [`root: ${i.root}`, `branch: ${i.branch}`, `origin: ${i.remote || '(none)'}`, `dirty: ${i.dirty ? 'yes' : 'no'}`, `cloud: ${CODEX_CLOUD_URL}`].join('\n');
  }
  if (command === 'repo') {
    const i = gitInfo(cwd);
    if (!i) return 'No git repository detected. Move to your project folder first.';
    return [`root: ${i.root}`, `branch: ${i.branch}`, `origin: ${i.remote || '(none)'}`].join('\n');
  }
  if (command === 'pr') {
    const i = gitInfo(cwd);
    if (!i) return 'No git repository detected. Move to your project folder first.';
    if (!i.parsed) throw new Error('Origin must be GitHub URL.');
    const url = `https://github.com/${i.parsed.owner}/${i.parsed.repo}/compare/${i.branch}?expand=1`;
    openUrl(url);
    return `Opened ${url}`;
  }
  if (command === 'handoff') {
    const i = gitInfo(cwd);
    if (!i) return 'No git repository detected. Move to your project folder first.';
    const push = spawnSync('git', ['-C', i.root, 'push', '-u', 'origin', i.branch], { stdio: 'inherit' });
    if (push.status !== 0) throw new Error('git push failed');
    return `Pushed ${i.branch} to origin.`;
  }
  throw new Error(`Unknown command: ${command}. Try: codex-web help`);
}

module.exports = { runCli, parseRemoteUrl, printHelp, CODEX_CLOUD_URL, handoffSteps };
