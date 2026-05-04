const test = require('node:test');
const assert = require('node:assert/strict');
const { parseRemoteUrl, printHelp, CODEX_CLOUD_URL } = require('../lib/cli');

test('parseRemoteUrl handles ssh remote', () => {
  assert.deepEqual(parseRemoteUrl('git@github.com:acme/my-repo.git'), { owner: 'acme', repo: 'my-repo' });
});

test('parseRemoteUrl handles https remote', () => {
  assert.deepEqual(parseRemoteUrl('https://github.com/acme/my-repo.git'), { owner: 'acme', repo: 'my-repo' });
});

test('parseRemoteUrl returns null for unsupported remotes', () => {
  assert.equal(parseRemoteUrl('https://gitlab.com/acme/my-repo.git'), null);
});

test('help output includes cloud/open commands and url constant is set', () => {
  const help = printHelp();
  assert.match(help, /open/);
  assert.match(help, /cloud/);
  assert.equal(CODEX_CLOUD_URL, 'https://chatgpt.com/codex/cloud');
});
