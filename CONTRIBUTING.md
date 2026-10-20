# Contributing

This repository is a published copy of the MCP server in the GenReady
monorepo (`mcp-server/`). The tools themselves live on the hosted server at
`https://genready.ai/mcp`, and this package forwards to it.

## Report a problem

Open an issue. Include:

- the tool name and the arguments you passed
- the full error text
- your client (Claude Desktop, Claude Code, Cursor, or another) and Node version

For account or plan questions, use https://genready.ai/support.

## Send a change

1. Open an issue first for anything beyond a typo or a small fix.
2. Fork the repository and create a branch.
3. Run `npm ci` and `npm run build`.
4. Open a pull request. CI builds the package and checks that it lists all tools without a working API key.

Maintainers port accepted changes into the monorepo, then publish a new release
here and on npm. A change to a tool description or schema must also change the
hosted server, so it may take longer than a change to this proxy.

## Security

Do not post API keys or exploit details in an issue. Email kris@genready.ai.
