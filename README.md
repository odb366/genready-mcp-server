# @genready/mcp-server

Connect [GenReady](https://genready.ai) to your AI assistant or coding agent. Scan any page for readiness to be cited by AI search engines and used by AI agents, then hand the fix checklist straight to your agent.

## 1. Get an API key

Create one at [genready.ai/api-keys](https://genready.ai/api-keys). To read site-wide fix plans, enable **Read site data** (`domain:read`) when you create it.

## 2. Connect

### Remote (recommended, nothing to install)

Any client that supports remote MCP servers over Streamable HTTP can connect directly:

- URL: `https://genready.ai/mcp`
- Header: `Authorization: Bearer gr_live_your_key_here`

Claude Code:

```bash
claude mcp add --transport http genready https://genready.ai/mcp \
  --header "Authorization: Bearer gr_live_your_key_here"
```

Cursor (`.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "genready": {
      "url": "https://genready.ai/mcp",
      "headers": { "Authorization": "Bearer gr_live_your_key_here" }
    }
  }
}
```

### Local command (stdio)

For clients that only launch local commands, such as Claude Desktop:

```json
{
  "mcpServers": {
    "genready": {
      "command": "npx",
      "args": ["-y", "@genready/mcp-server"],
      "env": { "GENREADY_API_KEY": "gr_live_your_key_here" }
    }
  }
}
```

This package forwards to the hosted endpoint, so both options expose the same tools.

## 3. Ask

> Scan https://example.com for AI readiness and fix what you can in this repo.

## Tools

| Tool              | What it does                                                                                  | Credits    |
| ----------------- | --------------------------------------------------------------------------------------------- | ---------- |
| `analyze_website` | Scan a URL. Returns scores and the fix checklist. `scope`: `full`, `content`, `crawlability`. | 1 per scan |
| `get_report`      | Read a report by ID, including its fix checklist.                                             | Free       |
| `check_status`    | Progress of a scan started with `wait: false`.                                                | Free       |
| `list_reports`    | Your past reports.                                                                            | Free       |
| `get_usage`       | Plan, credits used and remaining.                                                             | Free       |
| `list_domains`    | Your monitored domains (needs `domain:read`).                                                 | Free       |
| `get_fix_plan`    | Ranked site-wide fixes from a domain's latest site analysis (needs `domain:read`).            | Free       |

The fix checklist is included on Pro and Agency plans. On other plans, reports say it is locked.

## Environment variables (stdio)

| Variable           | Required | Description                                             |
| ------------------ | -------- | ------------------------------------------------------- |
| `GENREADY_API_KEY` | Yes      | Your API key (starts with `gr_live_`)                   |
| `GENREADY_MCP_URL` | No       | Hosted MCP endpoint (default `https://genready.ai/mcp`) |

## Links

- [MCP docs](https://genready.ai/docs/mcp)
- [REST API docs](https://genready.ai/docs/api)
