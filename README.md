# mcp-local-prompt-server

An MCP server that dynamically registers prompt templates from local files and serves them to clients with the `assistant` role (not `user`).

## Features

- **File-based prompts** — Drop `.txt`, `.md`, `.yaml`, `.yml`, or `.json` files into `prompts/` and they are registered automatically on startup
- **Clean naming** — Filenames like `grammer_correction_agent.md` become prompt names like `"grammer correction agent"`
- **Assistant role delivery** — Prompts are served with `role: "assistant"`, so clients treat the content as system-level guidance, not user input
- **Stdio transport** — Connects via standard input/output, compatible with any MCP host

## Prerequisites

- Node.js 18+
- npm

## Installation

```bash
git clone git@github.com:engrtipusultan/mcp-local-prompt-server.git
cd mcp-local-prompt-server
npm install
```

## Included prompts

| File | Prompt name | Description |
|---|---|---|
| `grammer_correction_agent.md` | grammer correction agent | Fixes English grammar errors with minimal changes, preserving the user's original style |
| `parapharasing_agent.md` | parapharasing agent | Paraphrases text with configurable tone (professional, casual, etc.) and length adjustments |
| `prompt_enhancement_agent.md` | prompt enhancement agent | Refines user inputs into structured, actionable prompts |
| `summerization_agent.md` | summerization agent | Summarizes and structurally maps long texts with metadata, TL;DR, and hierarchical outlines |

## Adding more prompts

Create a file in the `prompts/` directory:

```
prompts/
├── code_review_agent.md
├── sql_optimizer.txt
└── writing_feedback.yaml
```

Supported extensions: `.txt`, `.md`, `.yaml`, `.yml`, `.json`. Hyphens and underscores in filenames are converted to spaces for the prompt name. No code changes needed — prompts are registered automatically on the next server start.

## Usage

### Run

```bash
npm run dev
```

or

```bash
npm start
```

Both run the server directly via `tsx` — no build step needed.

## Testing with MCP Inspector

```bash
npx @modelcontextprotocol/inspector npm run dev
```

This opens a web UI where you can browse registered prompts and invoke them interactively.

## How it works

On startup, the server scans the `prompts/` directory for supported files. Each file is registered as an MCP prompt using `mcpServer.registerPrompt()`. When a client requests a prompt, the server reads the file content and returns it as an `assistant`-role message.

```
┌─────────────────────────────────────┐
│         MCP Host (client)           │
│            stdio transport          │
└────────────┬────────────────────────┘
             │ JSON-RPC
             ▼
┌─────────────────────────────────────┐
│  mcp-local-prompt-server            │
│                                     │
│  ┌────────────────────────────────┐ │
│  │  prompts/                      │ │
│  │  ├── grammer_correction.md     │ │
│  │  ├── summarization_agent.md    │ │
│  │  └── ...                       │ │
│  └────────────────────────────────┘ │
└─────────────────────────────────────┘
```

## Scripts reference

| Script | Command | Description |
|---|---|---|
| `npm run dev` | `tsx server.ts` | Run the server |
| `npm start` | `tsx server.ts` | Run the server (alias) |

## License

ISC
