const test = require('node:test');
const assert = require('node:assert/strict');
const { parseRemoteUrl, printHelp, CODEX_CLOUD_URL } = require('../lib/cli');

test('parseRemoteUrl ssh', () => {
  assert.deepEqual(parseRemoteUrl('git@github.com:acme/repo.git'), { owner: 'acme', repo: 'repo' });
});

test('parseRemoteUrl https', () => {
  assert.deepEqual(parseRemoteUrl('https://github.com/acme/repo.git'), { owner: 'acme', repo: 'repo' });
});

test('parseRemoteUrl unsupported', () => {
  assert.equal(parseRemoteUrl('https://gitlab.com/acme/repo.git'), null);
});

test('help includes connect and note', () => {
  const help = printHelp();
  assert.match(help, /connect/);
  assert.match(help, /public terminal API/);
  assert.equal(CODEX_CLOUD_URL, 'https://chatgpt.com/codex/cloud');
});
