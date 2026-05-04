const { execSync, spawnSync } = require('node:child_process');
const os = require('node:os');

const CODEX_CLOUD_URL = 'https://chatgpt.com/codex/cloud';

function run(command) {
  return execSync(command, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

function runMaybe(command) {
  try {
    return run(command);
  } catch {
    return null;
  }
}

function gitRoot(startPath) {
  const root = runMaybe(`git -C "${startPath}" rev-parse --show-toplevel`);
  return root || null;
}

function openUrl(url) {
  const platform = os.platform();

  if (platform === 'win32') {
    const result = spawnSync('cmd.exe', ['/c', 'start', '', url], { stdio: 'ignore', windowsVerbatimArguments: true });
    if (result.status !== 0) {
      throw new Error(`Could not open browser using cmd.exe start. Please open manually: ${url}`);
    }
    return;
  }

  const command = platform === 'darwin' ? 'open' : 'xdg-open';
  const result = spawnSync(command, [url], { stdio: 'ignore' });
  if (result.status !== 0) {
    throw new Error(`Could not open browser using ${command}. Please open manually: ${url}`);
  }
}

function parseRemoteUrl(url) {
  if (!url) return null;
  // git@github.com:owner/repo.git
  const ssh = url.match(/^git@github\.com:(.+?)\/(.+?)(\.git)?$/);
  if (ssh) return { owner: ssh[1], repo: ssh[2].replace(/\.git$/, '') };

  // https://github.com/owner/repo(.git)
  const https = url.match(/^https?:\/\/github\.com\/(.+?)\/(.+?)(\.git)?$/);
  if (https) return { owner: https[1], repo: https[2].replace(/\.git$/, '') };

  return null;
}

function gitInfo(cwd) {
  const root = gitRoot(cwd);
  if (!root) {
    throw new Error('Not inside a git repository.');
  }

  const branch = runMaybe(`git -C "${root}" branch --show-current`) || '(detached HEAD)';
  const remote = runMaybe(`git -C "${root}" remote get-url origin`);
  const parsed = parseRemoteUrl(remote);
  const dirty = !!runMaybe(`git -C "${root}" status --porcelain`);

  return { root, branch, remote, parsed, dirty };
}

function commandStatus(cwd) {
  const info = gitInfo(cwd);
  const lines = [
    `Repo root: ${info.root}`,
    `Branch: ${info.branch}`,
    `Origin: ${info.remote || '(none)'}`,
    `Working tree dirty: ${info.dirty ? 'yes' : 'no'}`,
    `Codex cloud: ${CODEX_CLOUD_URL}`
  ];
  return lines.join('\n');
}

function commandRepo(cwd) {
  const info = gitInfo(cwd);
  return `Repository: ${info.root}\nBranch: ${info.branch}\nOrigin: ${info.remote || '(none)'}`;
}

function commandOpen() {
  openUrl(CODEX_CLOUD_URL);
  return `Opened ${CODEX_CLOUD_URL}`;
}

function commandPr(cwd) {
  const info = gitInfo(cwd);
  if (!info.parsed) {
    throw new Error('Origin is not a GitHub URL. Could not construct PR link.');
  }
  const url = `https://github.com/${info.parsed.owner}/${info.parsed.repo}/compare/${info.branch}?expand=1`;
  openUrl(url);
  return `Opened ${url}`;
}

function commandHandoff(cwd) {
  const info = gitInfo(cwd);
  if (!info.remote) {
    throw new Error('No origin remote configured.');
  }
  const push = spawnSync('git', ['-C', info.root, 'push', '-u', 'origin', info.branch], { stdio: 'inherit' });
  if (push.status !== 0) {
    throw new Error('git push failed. Resolve the issue and retry.');
  }
  return `Pushed ${info.branch} to origin. Ready for Codex Cloud handoff.`;
}

function printHelp() {
  return [
    'codex-web <command>',
    '',
    'Commands:',
    '  open      Open Codex Cloud in your browser',
    '  status    Show git + Codex Cloud status summary',
    '  repo      Show current repository details',
    '  pr        Open GitHub compare page for current branch',
    '  handoff   Push current branch to origin for cloud continuation',
    '  help      Show this help message'
  ].join('\n');
}

function runCli(argv, cwd = process.cwd()) {
  const command = argv[2] || 'help';
  switch (command) {
    case 'open':
      return commandOpen();
    case 'status':
      return commandStatus(cwd);
    case 'repo':
      return commandRepo(cwd);
    case 'pr':
      return commandPr(cwd);
    case 'handoff':
      return commandHandoff(cwd);
    case 'help':
    case '--help':
    case '-h':
      return printHelp();
    default:
      throw new Error(`Unknown command: ${command}. Try: codex-web help`);
  }
}

module.exports = {
  runCli,
  parseRemoteUrl,
  printHelp,
  CODEX_CLOUD_URL
};
