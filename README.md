# codex-web-cli

Node.js CLI wrapper to use Codex from terminal and jump to Codex Cloud quickly.

## Install

```bash
npm install -g .
```

## Main use (terminal + cloud)

- `codex-web login` — run `codex --login` (Sign in with ChatGPT flow)
- `codex-web terminal` — run Codex directly in terminal
- `codex-web terminal --full-auto` — pass flags through to Codex CLI
- `codex-web open` — open `https://chatgpt.com/codex/cloud`

## Repo helper commands

- `codex-web status`
- `codex-web repo`
- `codex-web pr`
- `codex-web handoff`

## Requirement

Install official Codex CLI first:

```bash
npm i -g @openai/codex
```
