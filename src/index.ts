#!/usr/bin/env node
/**
 * GenReady MCP server for clients that launch local commands (stdio).
 *
 * Bridges stdio to the hosted endpoint at https://genready.ai/mcp. Clients
 * that support remote MCP servers can connect to that URL directly instead.
 * Configuration: see ./config.ts.
 */
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { PACKAGE_VERSION, resolveConfig } from './config.js';
import { createProxyServer } from './proxy.js';

const args = process.argv.slice(2);
if (args.includes('--version') || args.includes('-v')) {
  console.log(PACKAGE_VERSION);
  process.exit(0);
}

const resolved = resolveConfig(process.env);
if (!resolved.ok) {
  console.error(`Error: ${resolved.error}`);
  process.exit(1);
}
const { apiKey, mcpUrl } = resolved.config;

async function connectUpstream(): Promise<Client> {
  const client = new Client({ name: 'genready-mcp-stdio', version: PACKAGE_VERSION });
  const transport = new StreamableHTTPClientTransport(mcpUrl, {
    requestInit: { headers: { Authorization: `Bearer ${apiKey}` } },
  });
  await client.connect(transport);
  return client;
}

const server = createProxyServer(connectUpstream, { name: 'genready', version: PACKAGE_VERSION });

server.connect(new StdioServerTransport()).catch((err: unknown) => {
  console.error('Fatal error:', err instanceof Error ? err.message : err);
  process.exit(1);
});
