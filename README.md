# codex-web-cli

A small Node.js CLI wrapper to speed up local-to-cloud Codex workflows.

## Install

```bash
npm install -g .
```

Then run:

```bash
codex-web help
```

## Commands

- `codex-web open` — open `https://chatgpt.com/codex/cloud`
- `codex-web status` — show repo + branch + dirty state
- `codex-web repo` — print repository details
- `codex-web pr` — open GitHub compare page for current branch
- `codex-web handoff` — push current branch to `origin`

## Notes

- `pr` supports GitHub remotes in SSH and HTTPS forms.
- `open`/`pr` rely on your OS browser opener (`xdg-open` / `open` / `start`).
