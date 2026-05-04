#!/usr/bin/env node

const path = require('node:path');
const fs = require('node:fs');

const cliPath = path.join(__dirname, '..', 'lib', 'cli.js');
if (!fs.existsSync(cliPath)) {
  console.error('Error: codex-web installation is incomplete (missing lib/cli.js).');
  console.error('Please reinstall: npm uninstall -g codex-web-cli && npm install -g codex-web-cli');
  process.exit(1);
}

const { runCli } = require(cliPath);

try {
  const output = runCli(process.argv);
  if (output) console.log(output);
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
}
