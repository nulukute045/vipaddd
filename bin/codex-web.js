#!/usr/bin/env node
const { runCli } = require('../lib/cli');

try {
  const output = runCli(process.argv);
  if (output) console.log(output);
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
}
