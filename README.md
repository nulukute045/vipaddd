# codex-web-cli

Node.js CLI wrapper for opening Codex Cloud and handling repo handoff tasks.

## Install

```bash
npm install -g .
```

## Cloud commands

- `codex-web open` — open `https://chatgpt.com/codex/cloud`
- `codex-web cloud` — alias of `open`
- `codex-web connect` — show repo/branch handoff steps from terminal to Codex Cloud

## Repo helper commands

- `codex-web status`
- `codex-web repo`
- `codex-web pr`
- `codex-web handoff`


## Terminal-only note

- Directly using `chatgpt.com/codex/cloud` purely inside terminal (without web) is not supported via a public API.
- `codex-web terminal` prints this limitation and recommended options.
