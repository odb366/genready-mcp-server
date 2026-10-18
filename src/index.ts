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
import { STATIC_TOOLS } from './toolList.js';

const args = process.argv.slice(2);
if (args.includes('--version') || args.includes('-v')) {
  console.log(PACKAGE_VERSION);
  process.exit(0);
}

const resolved = resolveConfig(process.env);
const keyMissing = !process.env.GENREADY_API_KEY?.trim();
if (!resolved.ok && !keyMissing) {
  console.error(`Error: ${resolved.error}`);
  process.exit(1);
}
if (!resolved.ok) {
  // Start anyway so clients can read the tool list. Tool calls explain what to set.
  console.error(
    `Warning: ${resolved.error} Tools are listed, but calls will fail until it is set.`,
  );
}

async function connectUpstream(): Promise<Client> {
  if (!resolved.ok) throw new Error('GENREADY_API_KEY is not set');
  const { apiKey, mcpUrl } = resolved.config;
  const client = new Client({ name: 'genready-mcp-stdio', version: PACKAGE_VERSION });
  const transport = new StreamableHTTPClientTransport(mcpUrl, {
    requestInit: { headers: { Authorization: `Bearer ${apiKey}` } },
  });
  await client.connect(transport);
  return client;
}

const server = createProxyServer(
  connectUpstream,
  { name: 'genready', version: PACKAGE_VERSION },
  STATIC_TOOLS,
);

server.connect(new StdioServerTransport()).catch((err: unknown) => {
  console.error('Fatal error:', err instanceof Error ? err.message : err);
  process.exit(1);
});
